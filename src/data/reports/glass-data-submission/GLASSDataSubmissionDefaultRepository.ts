import _ from "lodash";
import { PaginatedObjects } from "../../../domain/common/entities/PaginatedObjects";
import {
    GLASSDataSubmissionItem,
    GLASSDataSubmissionItemIdentifier,
    GLASSDataSubmissionModule,
    DataSetIds,
} from "../../../domain/reports/glass-data-submission/entities/GLASSDataSubmissionItem";
import {
    GLASSDataSubmissionOptions,
    GLASSDataSubmissionRepository,
} from "../../../domain/reports/glass-data-submission/repositories/GLASSDataSubmissionRepository";
import { D2Api, Pager } from "../../../types/d2-api";
import { DataStoreStorageClient } from "../../common/clients/storage/DataStoreStorageClient";
import { StorageClient } from "../../common/clients/storage/StorageClient";
import { Instance } from "../../common/entities/Instance";
import { promiseMap } from "../../../utils/promises";
import { Status } from "../../../webapp/reports/glass-data-submission/DataSubmissionViewModel";
import { Id, NamedRef, Ref } from "../../../domain/common/entities/Base";
import { statusItems } from "../../../webapp/reports/glass-data-submission/glass-data-submission-list/Filters";
import { Namespaces } from "../../common/clients/storage/Namespaces";

interface CompleteDataSetRegistrationsResponse {
    completeDataSetRegistrations: Registration[] | undefined;
}

interface Registration {
    period: string;
    dataSet: string;
    organisationUnit: string;
    attributeOptionCombo: string;
    date: string;
    storedBy: string;
    completed: boolean;
}

interface GLASSDataSubmissionItemUpload extends GLASSDataSubmissionItemIdentifier {
    dataSubmission: string;
    status: "UPLOADED" | "IMPORTED" | "VALIDATED" | "COMPLETED";
}

interface MessageConversations {
    messageConversations: {
        id: Id;
        displayName: string;
    }[];
}

type DataValueType = {
    dataElement: string;
    period: string;
    orgUnit: string;
    value: string;
    [key: string]: string;
};

type DataValueSetsType = {
    dataSet: string;
    period: string;
    orgUnit: string;
    completeDate?: string;
    dataValues: DataValueType[];
};

export class GLASSDataSubmissionDefaultRepository implements GLASSDataSubmissionRepository {
    private storageClient: StorageClient;
    private globalStorageClient: StorageClient;

    constructor(private api: D2Api) {
        const instance = new Instance({ url: this.api.baseUrl });
        this.storageClient = new DataStoreStorageClient("user", instance);
        this.globalStorageClient = new DataStoreStorageClient("global", instance);
    }

    async get(
        options: GLASSDataSubmissionOptions,
        namespace: string
    ): Promise<PaginatedObjects<GLASSDataSubmissionItem>> {
        const { paging, sorting, module, orgUnitIds, periods, quarters, completionStatus, submissionStatus } = options;

        const modules =
            (await this.globalStorageClient.getObject<GLASSDataSubmissionModule[]>(
                Namespaces.DATA_SUBMISSSIONS_MODULES
            )) ?? [];
        const objects =
            (await this.globalStorageClient.getObject<GLASSDataSubmissionItem[]>(namespace))?.filter(object => {
                const amrModule = modules.find(module => module.name === "AMR")?.id;
                const egaspModule = modules.find(module => module.name === "EGASP")?.id;

                return module === "AMR" ? object.module === amrModule : object.module === egaspModule;
            }) ?? [];

        const uploads =
            (await this.globalStorageClient.getObject<GLASSDataSubmissionItemUpload[]>(
                Namespaces.DATA_SUBMISSSIONS_UPLOADS
            )) ?? [];

        const userOrgUnits = (await this.api.get<{ organisationUnits: Ref[] }>("/me").getData()).organisationUnits.map(
            ou => ou.id
        );
        const { organisationUnits } = await this.api
            .get<any>(
                "/metadata?organisationUnits:fields=children[children[id,level],id,level],id,level&organisationUnits:filter=level:eq:1"
            )
            .getData();
        const orgUnitsWithChildren = _(userOrgUnits)
            .flatMap(ou => {
                const res = flattenNodes(flattenNodes(organisationUnits).filter(res => res.id === ou)).map(
                    node => node.id
                );
                return res;
            })
            .uniq()
            .value();
        const filteredObjects = objects.filter(object => orgUnitsWithChildren.includes(object.orgUnit));

        const registrations = await this.getRegistrations(filteredObjects);

        const rows = filteredObjects.map(object => {
            const key = getRegistrationKey({ orgUnitId: object.orgUnit, period: object.period });
            const match = registrations[key];
            const submissionStatus = statusItems.find(item => item.value === object.status)?.text ?? "";

            const uploadStatus = uploads.filter(upload => upload.dataSubmission === object.id).map(item => item.status);
            const completedDatasets = uploadStatus.filter(item => item === "COMPLETED").length;
            const validatedDatasets = uploadStatus.filter(item => item === "VALIDATED").length;
            const importedDatasets = uploadStatus.filter(item => item === "IMPORTED").length;
            const uploadedDatasets = uploadStatus.filter(item => item === "UPLOADED").length;

            let dataSetsUploaded = "";
            if (completedDatasets > 0) {
                dataSetsUploaded += `${completedDatasets} completed, `;
            }
            if (validatedDatasets > 0) {
                dataSetsUploaded += `${validatedDatasets} validated, `;
            }
            if (importedDatasets > 0) {
                dataSetsUploaded += `${importedDatasets} imported, `;
            }
            if (uploadedDatasets > 0) {
                dataSetsUploaded += `${uploadedDatasets} uploaded, `;
            }

            // Remove trailing comma and space if any
            dataSetsUploaded = dataSetsUploaded.replace(/,\s*$/, "");

            // Show "No datasets" if all variables are 0
            if (dataSetsUploaded === "") {
                dataSetsUploaded = "No datasets";
            }

            return {
                ...object,
                ...match,
                submissionStatus,
                dataSetsUploaded,
            };
        });

        const quarterPeriods = _.flatMap(periods, year => quarters.map(quarter => `${year}${quarter}`));

        const filteredRows = rows.filter(row =>
            (_.isEmpty(orgUnitIds) || !row.orgUnit ? row : orgUnitIds.includes(row.orgUnit)) && module === "AMR"
                ? periods.includes(String(row.period))
                : quarterPeriods.includes(String(row.period)) &&
                  (completionStatus !== undefined ? row.questionnaireCompleted === completionStatus : row) &&
                  (!submissionStatus ? row : row.status === submissionStatus)
        );

        const rowsInPage = _(filteredRows)
            .orderBy([row => row[sorting.field]], [sorting.direction])
            .drop((paging.page - 1) * paging.pageSize)
            .take(paging.pageSize)
            .value();

        const pager: Pager = {
            page: paging.page,
            pageSize: paging.pageSize,
            pageCount: Math.ceil(filteredRows.length / paging.pageSize),
            total: filteredRows.length,
        };

        return {
            pager,
            objects: rowsInPage,
        };
    }

    private async getRegistrations(
        items: GLASSDataSubmissionItem[]
    ): Promise<Record<RegistrationKey, RegistrationItemBase>> {
        const orgUnitIds = _.uniq(items.map(obj => obj.orgUnit));
        const periods = _.uniq(items.map(obj => obj.period));
        const orgUnitsById = await this.getOrgUnits(orgUnitIds);
        const apiRegistrations = await this.getApiRegistrations({ orgUnitIds, periods });

        const registrationsByOrgUnitPeriod = _.keyBy(apiRegistrations, apiReg =>
            getRegistrationKey({ orgUnitId: apiReg.organisationUnit, period: apiReg.period })
        );

        return _(items)
            .map((item): RegistrationItemBase => {
                const key = getRegistrationKey({ orgUnitId: item.orgUnit, period: item.period });
                const registration = registrationsByOrgUnitPeriod[key];
                const orgUnitName = orgUnitsById[item.orgUnit]?.name || "-";

                return {
                    orgUnit: item.orgUnit,
                    period: item.period,
                    orgUnitName: orgUnitName,
                    questionnaireCompleted: registration?.completed ?? false,
                };
            })
            .keyBy(item => getRegistrationKey({ orgUnitId: item.orgUnit, period: item.period }))
            .value();
    }

    private async getApiRegistrations(options: { orgUnitIds: Id[]; periods: string[] }): Promise<Registration[]> {
        const responses = _.chunk(options.orgUnitIds, 300).map(orgUnitIdsGroups =>
            this.api.get<CompleteDataSetRegistrationsResponse>("/completeDataSetRegistrations", {
                dataSet: "OYc0CihXiSn",
                orgUnit: orgUnitIdsGroups,
                period: options.periods,
            })
        );

        return _(await promiseMap(responses, response => response.getData()))
            .flatMap(r => r.completeDataSetRegistrations || [])
            .value();
    }

    private async getOrgUnits(orgUnitIds: Id[]): Promise<Record<Id, NamedRef>> {
        const responses = _.chunk(orgUnitIds, 300).map(orgUnitIdsGroup =>
            this.api.metadata.get({
                organisationUnits: {
                    fields: { id: true, displayName: true },
                    filter: { id: { in: orgUnitIdsGroup } },
                },
            })
        );

        const metadataList = await promiseMap(responses, response => response.getData());

        return _(metadataList)
            .flatMap(metadata =>
                metadata.organisationUnits.map(orgUnit => ({
                    id: orgUnit.id,
                    name: orgUnit.displayName,
                }))
            )
            .keyBy(orgUnit => orgUnit.id)
            .value();
    }

    async getColumns(namespace: string): Promise<string[]> {
        const columns = await this.storageClient.getObject<string[]>(namespace);

        return columns ?? [];
    }

    async saveColumns(namespace: string, columns: string[]): Promise<void> {
        return this.storageClient.saveObject<string[]>(namespace, columns);
    }

    async dhis2MessageCount(): Promise<number> {
        const { messageConversations } =
            (await this.api
                .get<MessageConversations>("/messageConversations.json?filter=read%3Aeq%3Afalse")
                .getData()) ?? [];

        return messageConversations.length;
    }

    private async getNotificationText(
        items: GLASSDataSubmissionItemIdentifier[],
        modules: GLASSDataSubmissionModule[],
        status: string
    ) {
        const amrModule = modules.find(module => module.name === "AMR")?.name;
        const orgUnitIds = _(items)
            .map(({ orgUnit }) => orgUnit)
            .compact()
            .uniq()
            .value();
        const orgUnitsById = await this.getOrgUnits(orgUnitIds);
        const itemsWithCountry = items.map(item => {
            const country = item.orgUnit ? orgUnitsById[item.orgUnit]?.name || "-" : undefined;
            return { period: item.period, country };
        });
        const multipleItems = items.length > 1;

        const text = `The data ${
            multipleItems ? "submissions" : "submission"
        } for ${amrModule} module for${itemsWithCountry.map(
            item => ` year ${item.period} and country ${item.country}`
        )} ${multipleItems ? "have" : "has"} changed to ${status.toUpperCase()}.`;

        return text;
    }

    private async getRecipientUsers(items: GLASSDataSubmissionItemIdentifier[], modules: GLASSDataSubmissionModule[]) {
        const userGroups = _.flatMap(
            _.compact(
                items.map(
                    item =>
                        modules.find(mod => mod.id === item.module && !_.isEmpty(mod.userGroups))?.userGroups
                            .captureAccess
                )
            )
        ).map(({ id }) => id);

        const orgUnits = _(
            await promiseMap(
                items,
                async item =>
                    await this.api.get<any>(`/organisationUnits/${item.orgUnit}?fields=ancestors,id`).getData()
            )
        )
            .flatMapDeep(obj => [obj.id, _.map(obj.ancestors, "id")])
            .flatten()
            .value();

        const { objects: recipientUsers } = await this.api.models.users
            .get({
                fields: {
                    id: true,
                },
                filter: {
                    "organisationUnits.id": { in: orgUnits },
                    "userGroups.id": { in: userGroups },
                },
            })
            .getData();

        return recipientUsers;
    }

    private async getDataSetsValue(dataSet: string, orgUnit: string, period: string) {
        return await this.api
            .get<DataValueSetsType>("/dataValueSets", {
                dataSet,
                orgUnit,
                period,
            })
            .getData();
    }

    private async getDSDataElements(dataSet: string) {
        return await this.api
            .get<any>(`/dataSets/${dataSet}`, { fields: "dataSetElements[dataElement[id,name]]" })
            .getData();
    }

    private async getProgramEvents(program: string, orgUnit: string, _period: string) {
        return await this.api.events
            .get({
                program,
                orgUnit,
            })
            .getData();
    }

    private makeDataValuesArray(
        approvalDataSetId: string,
        dataValueSets: DataValueType[],
        dataElementsMatchedArray: { [key: string]: any }[]
    ) {
        return dataValueSets.flatMap(dataValueSet => {
            const dataValue = { ...dataValueSet };
            const destId = dataElementsMatchedArray.find(
                dataElementsMatchedObj => dataElementsMatchedObj.origId === dataValueSet.dataElement
            )?.destId;

            if (!_.isEmpty(destId) && !_.isEmpty(dataValue.value)) {
                dataValue.dataElement = destId;
                dataValue.dataSet = approvalDataSetId;
                delete dataValue.lastUpdated;
                delete dataValue.comment;

                return dataValue;
            } else {
                return [];
            }
        });
    }

    async approve(namespace: string, items: GLASSDataSubmissionItemIdentifier[]) {
        const objects = await this.globalStorageClient.listObjectsInCollection<GLASSDataSubmissionItem>(namespace);
        const modules =
            (await this.globalStorageClient.getObject<GLASSDataSubmissionModule[]>(
                Namespaces.DATA_SUBMISSSIONS_MODULES
            )) ?? [];

        const module = modules.find(module => module.id === _.first(items)?.module)?.name ?? "";

        if (module === "EGASP") {
            const egaspProgram = "SOjanrinfuG";
            await this.duplicateProgram(egaspProgram, items);
        } else {
            const amrDataSets = modules.find(module => module.name === "AMR")?.dataSets ?? [];
            _.forEach(amrDataSets, async amrDataSet => await this.duplicateDataSet(amrDataSet, items));
        }

        const newSubmissionValues = this.getNewSubmissionValues(items, objects, "APPROVED");
        const recipients = await this.getRecipientUsers(items, modules);

        const message = await this.getNotificationText(items, modules, "approved");
        this.sendNotifications(message, message, [], recipients);

        return await this.globalStorageClient.saveObject<GLASSDataSubmissionItem[]>(namespace, newSubmissionValues);
    }

    private async duplicateDataSet(dataSet: DataSetIds, items: GLASSDataSubmissionItemIdentifier[]) {
        await promiseMap(items, async item => {
            const dataValueSets = (await this.getDataSetsValue(dataSet.id, item.orgUnit ?? "", item.period)).dataValues;

            if (!_.isEmpty(dataValueSets)) {
                const DSDataElements: { dataSetElements: { dataElement: NamedRef }[] } = await this.getDSDataElements(
                    dataSet.id
                );
                const ADSDataElements: { dataSetElements: { dataElement: NamedRef }[] } = await this.getDSDataElements(
                    dataSet.approvedId
                );

                const uniqueDataElementsIds = _.uniq(_.map(dataValueSets, "dataElement"));
                const dataElementsMatchedArray = DSDataElements.dataSetElements.map(element => {
                    const dataElement = element.dataElement;
                    if (uniqueDataElementsIds.includes(dataElement.id)) {
                        const apvdName = dataElement.name + "-APVD";
                        const ADSDataElement = ADSDataElements.dataSetElements.find(
                            element => element.dataElement.name === apvdName
                        );
                        return {
                            origId: dataElement.id,
                            destId: ADSDataElement?.dataElement.id,
                            name: dataElement.name,
                        };
                    } else {
                        return [];
                    }
                });

                const dataValuesToPost = this.makeDataValuesArray(
                    dataSet.approvedId,
                    dataValueSets,
                    dataElementsMatchedArray
                );

                await promiseMap(_.chunk(dataValuesToPost, 1000), async dataValuesGroup => {
                    return await this.api.dataValues
                        .postSet({}, { dataValues: _.reject(dataValuesGroup, _.isEmpty) })
                        .getData();
                });
            }
        });
    }

    private async duplicateProgram(program: string, items: GLASSDataSubmissionItemIdentifier[]) {
        await promiseMap(items, async item => {
            const events = (await this.getProgramEvents(program, item.orgUnit ?? "", item.period)).events.map(event => {
                return {
                    program: event.program,
                    orgUnit: event.orgUnit,
                    eventDate: event.eventDate,
                    status: event.status,
                    storedBy: event.storedBy,
                    coordinate: event.coordinate,
                    dataValues: event.dataValues,
                };
            });

            if (!_.isEmpty(events)) {
                const eventsToPost = events.map(event => {
                    return {
                        program: event.program,
                        orgUnit: event.orgUnit,
                        eventDate: event.eventDate,
                        status: event.status,
                        storedBy: event.storedBy,
                        coordinate: event.coordinate,
                        dataValues: event.dataValues,
                    };
                });

                await promiseMap(_.chunk(eventsToPost, 100), async eventsGroup => {
                    return await this.api.events.post({}, { events: _.reject(eventsGroup, _.isEmpty) }).getData();
                });
            }
        });
    }

    async reject(
        namespace: string,
        items: GLASSDataSubmissionItemIdentifier[],
        message: string,
        isDatasetUpdate: boolean
    ) {
        const objects = await this.globalStorageClient.listObjectsInCollection<GLASSDataSubmissionItem>(namespace);
        const modules =
            (await this.globalStorageClient.getObject<GLASSDataSubmissionModule[]>(
                Namespaces.DATA_SUBMISSSIONS_MODULES
            )) ?? [];

        const newSubmissionValues = this.getNewSubmissionValues(
            items,
            objects,
            isDatasetUpdate ? "APPROVED" : "REJECTED"
        );
        const recipients = await this.getRecipientUsers(items, modules);

        const body = `Please review the messages and the reports to find about the causes of this rejection. You have to upload new datasets.\n Reason for rejection:\n ${message}`;
        this.sendNotifications("Rejected by WHO", body, [], recipients);

        await this.postDataSetRegistration(items, false);

        return await this.globalStorageClient.saveObject<GLASSDataSubmissionItem[]>(namespace, newSubmissionValues);
    }

    async reopen(namespace: string, items: GLASSDataSubmissionItemIdentifier[]) {
        const objects = await this.globalStorageClient.listObjectsInCollection<GLASSDataSubmissionItem>(namespace);
        const modules =
            (await this.globalStorageClient.getObject<GLASSDataSubmissionModule[]>(
                Namespaces.DATA_SUBMISSSIONS_MODULES
            )) ?? [];

        const newSubmissionValues = this.getNewSubmissionValues(items, objects, "NOT_COMPLETED");
        const recipients = await this.getRecipientUsers(items, modules);

        const message = await this.getNotificationText(items, modules, "reopened");
        this.sendNotifications(message, message, [], recipients);
        await this.postDataSetRegistration(items, false);

        return await this.globalStorageClient.saveObject<GLASSDataSubmissionItem[]>(namespace, newSubmissionValues);
    }

    async accept(namespace: string, items: GLASSDataSubmissionItemIdentifier[]) {
        const objects = await this.globalStorageClient.listObjectsInCollection<GLASSDataSubmissionItem>(namespace);
        const modules =
            (await this.globalStorageClient.getObject<GLASSDataSubmissionModule[]>(
                Namespaces.DATA_SUBMISSSIONS_MODULES
            )) ?? [];

        const newSubmissionValues = this.getNewSubmissionValues(items, objects, "UPDATE_REQUEST_ACCEPTED");
        const recipients = await this.getRecipientUsers(items, modules);

        const message = await this.getNotificationText(items, modules, "update request accepted");
        this.sendNotifications(message, message, [], recipients);

        await this.postDataSetRegistration(items, false);

        return await this.globalStorageClient.saveObject<GLASSDataSubmissionItem[]>(namespace, newSubmissionValues);
    }

    async getGLASSDashboardId(_namespace: string, _items: GLASSDataSubmissionItemIdentifier[]): Promise<string> {
        const modules =
            (await this.globalStorageClient.getObject<GLASSDataSubmissionModule[]>(
                Namespaces.DATA_SUBMISSSIONS_MODULES
            )) ?? [];
        const glassUnapvdDashboardId = modules.find(module => module.name === "AMR")?.dashboards.validationReport ?? "";

        return glassUnapvdDashboardId;
    }

    private async postDataSetRegistration(items: GLASSDataSubmissionItemIdentifier[], completed: boolean) {
        const dataSetRegistrations = items.map(item => ({
            dataSet: "OYc0CihXiSn",
            period: item.period,
            organisationUnit: item.orgUnit,
            completed,
        }));

        await this.api
            .post<CompleteDataSetRegistrationsResponse>(
                "/completeDataSetRegistrations",
                {},
                { completeDataSetRegistrations: dataSetRegistrations }
            )
            .getData();
    }

    private async sendNotifications(subject: string, text: string, userGroups: Ref[], users?: Ref[]): Promise<void> {
        this.api.messageConversations.post({
            subject,
            text,
            userGroups,
            users,
        });
    }

    private getNewSubmissionValues(
        items: GLASSDataSubmissionItemIdentifier[],
        objects: GLASSDataSubmissionItem[],
        status: Status
    ) {
        return objects.map(object => {
            const isNewItem = !!items.find(
                item =>
                    item.orgUnit === object.orgUnit &&
                    item.module === object.module &&
                    item.period === String(object.period)
            );

            const statusHistory = {
                changedAt: new Date().toISOString(),
                from: object.status,
                to: status,
            };

            return isNewItem ? { ...object, status, statusHistory: [...object.statusHistory, statusHistory] } : object;
        });
    }
}

type RegistrationItemBase = Pick<
    GLASSDataSubmissionItem,
    "orgUnitName" | "orgUnit" | "period" | "questionnaireCompleted"
>;

function getRegistrationKey(options: { orgUnitId: Id; period: string }): RegistrationKey {
    return [options.orgUnitId, options.period].join(".");
}

type RegistrationKey = string; // `${orgUnitId}.${period}`

const flattenNodes = (orgUnitNodes: OrgUnitNode[]): OrgUnitNode[] =>
    _.flatMap(orgUnitNodes, node => (node.children ? [node, ...flattenNodes(node.children)] : [node]));

type OrgUnitNode = {
    level: number;
    id: string;
    children?: OrgUnitNode[];
};
