import _ from "lodash";
import { paginate, PaginatedObjects } from "../../../domain/common/entities/PaginatedObjects";
import {
    ApprovalIds,
    GLASSDataSubmissionItem,
    GLASSDataSubmissionItemIdentifier,
    GLASSDataSubmissionModule,
    EARDataSubmissionItem,
    EARSubmissionItemIdentifier,
    getUserModules,
    Status,
    Module,
} from "../../../domain/reports/glass-data-submission/entities/GLASSDataSubmissionItem";
import {
    EARDataSubmissionOptions,
    GLASSDataSubmissionOptions,
    GLASSDataSubmissionRepository,
} from "../../../domain/reports/glass-data-submission/repositories/GLASSDataSubmissionRepository";
import { D2Api } from "../../../types/d2-api";
import { DataStoreStorageClient } from "../../common/clients/storage/DataStoreStorageClient";
import { StorageClient } from "../../common/clients/storage/StorageClient";
import { Instance } from "../../common/entities/Instance";
import { promiseMap } from "../../../utils/promises";
import { Id, NamedRef, Ref } from "../../../domain/common/entities/Base";
import {
    earStatusItems,
    statusItems,
} from "../../../webapp/reports/glass-data-submission/glass-data-submission-list/Filters";
import { Namespaces } from "../../common/clients/storage/Namespaces";
import { Config } from "../../../domain/common/entities/Config";
import { Event } from "@eyeseetea/d2-api/api/events";
import { generateUid } from "../../../utils/uid";
import { OrgUnitWithChildren } from "../../../domain/reports/glass-data-submission/entities/OrgUnit";

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

type Attribute = {
    value: string;
};

type TrackedEntityInstance = {
    attributes: Attribute[];
    orgUnit: string;
    enrollments: {
        attributes: Attribute[];
        events: {
            program: string;
            programStage: string;
        }[];
    }[];
    programOwners: {
        program: string;
    }[];
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
        const { paging, sorting, module: selectedModule } = options;
        if (!selectedModule) return emptyPage;

        const modules = await this.getModules();
        const objects = await this.getDataSubmissionObjects(namespace);
        const uploads = await this.getUploads();

        const dataSubmissions = await this.getDataSubmissions(objects, modules, uploads, selectedModule);
        const filteredRows = this.getFilteredRows(dataSubmissions, options);
        const { pager, objects: rowsInPage } = paginate(filteredRows, paging, sorting);

        return {
            pager,
            objects: rowsInPage,
        };
    }

    private async getUploads() {
        return (
            (await this.globalStorageClient.getObject<GLASSDataSubmissionItemUpload[]>(
                Namespaces.DATA_SUBMISSSIONS_UPLOADS
            )) ?? []
        );
    }

    private async getDataSubmissionObjects(namespace: string) {
        return (await this.globalStorageClient.getObject<GLASSDataSubmissionItem[]>(namespace)) ?? [];
    }

    private async getDataSubmissions(
        objects: GLASSDataSubmissionItem[],
        modules: GLASSDataSubmissionModule[],
        uploads: GLASSDataSubmissionItemUpload[],
        selectedModule: Module
    ): Promise<GLASSDataSubmissionItem[]> {
        const enrolledCountries = await this.getEnrolledCountries();
        const amrFocalPointProgramId = await this.getAMRFocalPointProgramId();
        const dataSubmissionItems = await this.getDataSubmissionIdentifiers(
            amrFocalPointProgramId,
            enrolledCountries.join(";"),
            modules
        );

        const questionnaireDataSets =
            modules
                .find(module => module.id === selectedModule)
                ?.questionnaires.map(questionnaire => questionnaire.id) ?? [];

        const registrations = await this.getRegistrations(dataSubmissionItems, questionnaireDataSets);

        const dataSubmissions: GLASSDataSubmissionItem[] = dataSubmissionItems.map(dataSubmissionItem => {
            const dataSubmission = objects.find(
                object =>
                    object.period === dataSubmissionItem.period &&
                    object.orgUnit === dataSubmissionItem.orgUnit &&
                    object.module === dataSubmissionItem.module
            );

            const key = getRegistrationKey({
                orgUnitId: dataSubmissionItem.orgUnit,
                period: dataSubmissionItem.period,
            });
            const match = registrations[key];

            const submissionStatus =
                statusItems.find(item => item.value === dataSubmission?.status)?.text ?? "Not completed";
            const dataSubmissionPeriod =
                modules.find(module => dataSubmissionItem.module === module.id)?.dataSubmissionPeriod ?? "YEARLY";
            const dataSetsUploaded = getDatasetsUploaded(uploads, dataSubmission);

            return {
                ...dataSubmissionItem,
                ...match,
                ...dataSubmission,
                submissionStatus,
                dataSetsUploaded,
                dataSubmissionPeriod,
                id: dataSubmission?.id ?? generateUid(),
                period: dataSubmissionItem.period.slice(0, 4),
                orgUnitName: match?.orgUnitName ?? "",
                questionnaireCompleted: match?.questionnaireCompleted ?? false,
                status: dataSubmission?.status ?? "NOT_COMPLETED",
                statusHistory: dataSubmission?.statusHistory ?? [],
                from: dataSubmission?.from ?? null,
                to: dataSubmission?.to ?? null,
                creationDate: dataSubmission?.creationDate ?? new Date().toISOString(),
            };
        });

        return dataSubmissions;
    }

    private async getEnrolledCountries(): Promise<string[]> {
        const userOrgUnits = await this.getUserOrgUnits();
        const orgUnitsWithChildren = await this.getOUsWithChildren(userOrgUnits);

        const countriesOutsideNARegion = await this.getCountriesOutsideNARegion();
        const enrolledCountries = orgUnitsWithChildren.filter(orgUnit => countriesOutsideNARegion.includes(orgUnit));

        return enrolledCountries;
    }

    private async getOUsWithChildren(userOrgUnits: string[]): Promise<string[]> {
        const { organisationUnits } = await this.api.metadata
            .get({
                organisationUnits: {
                    fields: {
                        id: true,
                        level: true,
                        children: {
                            id: true,
                            level: true,
                            children: {
                                id: true,
                                level: true,
                            },
                        },
                    },
                    filter: {
                        level: {
                            eq: "1",
                        },
                    },
                },
            })
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

        return orgUnitsWithChildren;
    }

    private async getUserOrgUnits(): Promise<string[]> {
        return (await this.api.get<{ organisationUnits: Ref[] }>("/me").getData()).organisationUnits.map(ou => ou.id);
    }

    private async getDataSubmissionIdentifiers(
        program: string,
        orgUnit: string,
        modules: GLASSDataSubmissionModule[]
    ): Promise<GLASSDataSubmissionItemIdentifier[]> {
        const instances = await this.getTrackedEntityInstances(program, orgUnit);

        const dataSubmissionPeriods = getDataSubmissionPeriods();
        const orgUnitModules: { orgUnit: string; module: string }[] = _(instances)
            .map(instance => {
                const module = instance.attributes.map(attribute => attribute.value)[0] ?? "";

                return {
                    orgUnit: instance.orgUnit,
                    module: moduleMapping[module] ?? "",
                };
            })
            .uniqBy(instance => `${instance.orgUnit}_${instance.module}`)
            .value();

        return orgUnitModules.flatMap(orgUnitModule => {
            return dataSubmissionPeriods.map(dataSubmissionPeriod => ({
                ...orgUnitModule,
                period: dataSubmissionPeriod.toString(),
                module: modules.find(module => module.name === orgUnitModule.module)?.id ?? "",
            }));
        });
    }

    private async getCountriesOutsideNARegion(): Promise<string[]> {
        const { organisationUnits: kosovoOu } = await this.api.metadata
            .get({
                organisationUnits: {
                    fields: {
                        id: true,
                    },
                    filter: {
                        name: {
                            eq: "Kosovo",
                        },
                        level: {
                            eq: "3",
                        },
                        "parent.code": {
                            eq: "NA",
                        },
                    },
                },
            })
            .getData();

        const { organisationUnits } = await this.api.metadata
            .get({
                organisationUnits: {
                    fields: {
                        id: true,
                    },
                    filter: {
                        level: {
                            eq: "3",
                        },
                        "parent.code": {
                            ne: "NA",
                        },
                    },
                    paging: false,
                },
            })
            .getData();

        return _.concat(organisationUnits, kosovoOu).map(orgUnit => orgUnit.id);
    }

    private async getAMRFocalPointProgramId(): Promise<string> {
        const { programs } = await this.api.metadata
            .get({
                programs: {
                    fields: {
                        id: true,
                    },
                    filter: {
                        name: {
                            eq: "AMR - Focal Point",
                        },
                    },
                },
            })
            .getData();

        const programId = _.first(programs)?.id ?? "";

        return programId;
    }

    async getUserModules(config: Config): Promise<GLASSDataSubmissionModule[]> {
        const modules = await this.getModules();

        return getUserModules(modules, config.currentUser);
    }

    async getEAR(
        options: EARDataSubmissionOptions,
        namespace: string
    ): Promise<PaginatedObjects<EARDataSubmissionItem>> {
        const { paging, sorting, orgUnitIds, from, to, submissionStatus } = options;

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

        const objects = (await this.globalStorageClient.getObject<EARDataSubmissionItem[]>(namespace)) ?? [];
        const rows = objects.filter(object => orgUnitsWithChildren.includes(object.orgUnit.id));

        const filteredRows = rows
            .filter(row => {
                return (
                    (_.isEmpty(orgUnitIds) || !row.orgUnit ? row : orgUnitIds.includes(row.orgUnit.id)) &&
                    !!(!from && !to
                        ? row
                        : (from && new Date(row.creationDate) >= from) || (to && new Date(row.creationDate) <= to)) &&
                    (!submissionStatus ? row : row.status === submissionStatus)
                );
            })
            .map(row => {
                const submissionStatus = earStatusItems.find(item => item.value === row.status)?.text ?? "";
                return { ...row, submissionStatus };
            });

        return paginate(filteredRows, paging, sorting);
    }

    private async getRegistrations(
        items: GLASSDataSubmissionItemIdentifier[],
        questionnaireDataSets: Id[]
    ): Promise<Record<RegistrationKey, RegistrationItemBase>> {
        const orgUnitIds = _.uniq(items.map(obj => obj.orgUnit));
        const periods = _.uniq(items.map(obj => obj.period));
        const orgUnitsById = await this.getOrgUnits(orgUnitIds);
        const apiRegistrations = !_(questionnaireDataSets).compact().isEmpty()
            ? await this.getApiRegistrations({
                  orgUnitIds,
                  periods,
                  questionnaireDataSets,
              })
            : [];

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

    private async getApiRegistrations(options: {
        orgUnitIds: Id[];
        periods: string[];
        questionnaireDataSets: Id[];
    }): Promise<Registration[]> {
        const responses = options.questionnaireDataSets.flatMap(dataSet =>
            _.chunk(options.orgUnitIds, 300).map(orgUnitIdsGroups =>
                this.api.get<CompleteDataSetRegistrationsResponse>("/completeDataSetRegistrations", {
                    dataSet: dataSet,
                    orgUnit: orgUnitIdsGroups,
                    period: options.periods,
                })
            )
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

    private async getModules(): Promise<GLASSDataSubmissionModule[]> {
        const modules =
            (await this.globalStorageClient.getObject<GLASSDataSubmissionModule[]>(
                Namespaces.DATA_SUBMISSSIONS_MODULES
            )) ?? [];

        return _(modules)
            .map(module => ({
                ...module,
                userGroups: { ...module.userGroups, approveAccess: module.userGroups.approveAccess ?? [] },
            }))
            .value();
    }

    private getFilteredRows(
        rows: GLASSDataSubmissionItem[],
        options: GLASSDataSubmissionOptions
    ): GLASSDataSubmissionItem[] {
        const { orgUnitIds, module, dataSubmissionPeriod, periods, quarters, completionStatus, submissionStatus } =
            options;
        const quarterPeriods = _.flatMap(periods, year => quarters.map(quarter => `${year}${quarter}`));

        return rows.filter(row => {
            const isInOrgUnit = !!(_.isEmpty(orgUnitIds) || !row.orgUnit ? row : orgUnitIds.includes(row.orgUnit));
            const isInModule = row.module === module;

            const isDataSubmissionYearly = dataSubmissionPeriod === "YEARLY";
            const isInPeriod = isDataSubmissionYearly
                ? periods.includes(row.period)
                : quarterPeriods.includes(row.period);

            const isCompleted = !!(completionStatus !== undefined
                ? row.questionnaireCompleted === completionStatus
                : row);
            const isSubmitted = !!(!submissionStatus ? row : row.status === submissionStatus);

            return isInOrgUnit && isInModule && isInPeriod && isCompleted && isSubmitted;
        });
    }

    private async getNotificationText(
        items: GLASSDataSubmissionItemIdentifier[],
        modules: GLASSDataSubmissionModule[],
        status: string
    ) {
        const glassModule = modules.find(module => module.id === items[0]?.module)?.name;
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
        } for ${glassModule} module for${itemsWithCountry.map(
            item => ` year ${item.period} and country ${item.country}`
        )} ${multipleItems ? "have" : "has"} changed to ${status.toUpperCase()}.`;

        return text;
    }

    private getEARNotificationText(
        signals: EARSubmissionItemIdentifier[],
        modules: GLASSDataSubmissionModule[],
        status: string
    ) {
        const earModule = modules.find(module => module.id === signals[0]?.module)?.name;

        const text = signals
            .map(
                signal =>
                    `${
                        signal.levelOfConfidentiality === "CONFIDENTIAL" ? "Confidential" : "Non-Confidential"
                    } Signal for ${earModule} module and country ${
                        signal.orgUnitName
                    } ${status} at ${new Date().toISOString()}`
            )
            .join("\n");

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

    private async getEARRecipientUsers(items: EARSubmissionItemIdentifier[], modules: GLASSDataSubmissionModule[]) {
        const userGroups = _.flatMap(
            _.compact(
                items.map(
                    item =>
                        modules.find(mod => mod.id === item.module && !_.isEmpty(mod.userGroups))?.userGroups.readAccess
                )
            )
        ).map(({ id }) => id);

        const orgUnits = _(
            await promiseMap(
                items,
                async item =>
                    await this.api.get<any>(`/organisationUnits/${item.orgUnitId}?fields=ancestors,id`).getData()
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

    private async getProgramEvents(program: string, orgUnit: string, isEGASPModule: boolean): Promise<Event[]> {
        const { events } = await this.api.events // to do: use new tracker api
            .get({
                program: program,
                orgUnit: orgUnit,
                ouMode: isEGASPModule ? "DESCENDANTS" : "SELECTED",
                skipPaging: true,
            })
            .getData();

        return events;
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

    async approve(
        namespace: string,
        items: GLASSDataSubmissionItemIdentifier[],
        signals?: EARSubmissionItemIdentifier[]
    ) {
        const modules = await this.getModules();

        if (!_.isEmpty(items)) {
            const objects = await this.globalStorageClient.listObjectsInCollection<GLASSDataSubmissionItem>(namespace);

            await this.approveByModule(modules, items);
            const newSubmissionValues = this.getNewSubmissionValues(items, objects, "APPROVED");
            const recipients = await this.getRecipientUsers(items, modules);

            const message = await this.getNotificationText(items, modules, "approved");
            this.sendNotifications(message, message, [], recipients);

            return await this.globalStorageClient.saveObject<GLASSDataSubmissionItem[]>(namespace, newSubmissionValues);
        } else if (signals) {
            const objects = await this.globalStorageClient.listObjectsInCollection<EARDataSubmissionItem>(namespace);
            const newSubmissionValues = this.getNewEARSubmissionValues(signals, objects, "APPROVED");
            const recipients = await this.getEARRecipientUsers(signals, modules);

            const message = this.getEARNotificationText(signals, modules, "approved");
            this.sendNotifications(message, message, [], recipients);

            return await this.globalStorageClient.saveObject<EARDataSubmissionItem[]>(namespace, newSubmissionValues);
        }
    }

    private async approveByModule(
        modules: GLASSDataSubmissionModule[],
        items: GLASSDataSubmissionItemIdentifier[]
    ): Promise<void> {
        const selectedModule = modules.find(module => module.id === _.first(items)?.module)?.name ?? "";
        const { AMC, AMR, AMR_FUNGHI, AMR_INDIVIDUAL, EGASP } = moduleMapping;

        switch (selectedModule) {
            case AMC: {
                const amcModule = modules.find(module => module.name === AMC);
                const amcPrograms = amcModule?.programs ?? [];
                const amcProgramStages = amcModule?.programStages ?? [];
                const amcProductRegisterProgramId = await this.getAMCProductRegisterId(); // the AMC - Product Register program is tne only tracker program in this module

                const amcEventPrograms = _.filter(
                    amcPrograms,
                    amcProgram => amcProgram.id !== amcProductRegisterProgramId
                );
                const amcTrackerPrograms = _.filter(
                    amcPrograms,
                    amcProgram => amcProgram.id === amcProductRegisterProgramId
                );

                _.forEach(amcEventPrograms, async amcProgram => await this.duplicateEventProgram(amcProgram, items));
                _.forEach(
                    amcTrackerPrograms,
                    async amcProgram => await this.duplicateTrackerProgram(amcProgram, amcProgramStages, items)
                );
                break;
            }
            case AMR: {
                const amrDataSets = modules.find(module => module.name === AMR)?.dataSets ?? [];
                const amrQuestionnaires = modules.find(module => module.name === AMR)?.questionnaires ?? [];

                _.forEach(amrDataSets, async amrDataSet => await this.duplicateDataSet(amrDataSet, items));
                _.forEach(
                    amrQuestionnaires,
                    async amrQuestionnaire => await this.duplicateDataSet(amrQuestionnaire, items)
                );
                break;
            }
            case AMR_FUNGHI: {
                const amrFungalModule = modules.find(module => module.name === AMR_FUNGHI);
                const amrFungalQuestionnaires = amrFungalModule?.questionnaires ?? [];
                const amrFungalPrograms = amrFungalModule?.programs ?? [];
                const amrFungalProgramStages = amrFungalModule?.programStages ?? [];

                _.forEach(
                    amrFungalQuestionnaires,
                    async amrFungalQuestionnaire => await this.duplicateDataSet(amrFungalQuestionnaire, items)
                );
                _.forEach(
                    amrFungalPrograms,
                    async amrFungalProgram =>
                        await this.duplicateTrackerProgram(amrFungalProgram, amrFungalProgramStages, items)
                );
                break;
            }
            case AMR_INDIVIDUAL: {
                const amrIndividualModule = modules.find(module => module.name === AMR_INDIVIDUAL);
                const amrIndividualQuestionnaires = amrIndividualModule?.questionnaires ?? [];
                const amrIndividualPrograms = amrIndividualModule?.programs ?? [];
                const amrIndividualProgramStages = amrIndividualModule?.programStages ?? [];

                _.forEach(amrIndividualQuestionnaires, async amrIndividualQuestionnaire => {
                    await this.duplicateDataSet(amrIndividualQuestionnaire, items);
                });
                _.forEach(amrIndividualPrograms, async amrIndividualProgram => {
                    await this.duplicateTrackerProgram(amrIndividualProgram, amrIndividualProgramStages, items);
                });
                break;
            }
            case EGASP: {
                const egaspPrograms = modules.find(module => module.name === EGASP)?.programs ?? [];
                _.forEach(
                    egaspPrograms,
                    async egaspProgram =>
                        await this.duplicateEventProgram(egaspProgram, items, selectedModule === EGASP)
                );
                break;
            }
        }
    }

    private async getAMCProductRegisterId() {
        const { objects } = await this.api.models.programs
            .get({
                fields: { id: true },
                filter: { code: { eq: AMC_PRODUCT_REGISTER_CODE } },
            })
            .getData();

        return _.first(objects)?.id ?? "";
    }

    private async duplicateDataSet(dataSet: ApprovalIds, items: GLASSDataSubmissionItemIdentifier[]) {
        _.forEach(items, async item => {
            const dataValueSets = (await this.getDataSetsValue(dataSet.id, item.orgUnit, item.period)).dataValues;

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

    private async duplicateTrackerProgram(
        program: ApprovalIds,
        programStages: ApprovalIds[],
        items: GLASSDataSubmissionItemIdentifier[]
    ): Promise<void> {
        _.forEach(items, async item => {
            const trackedEntities = this.getTEIsWithProgramStages(
                await this.getTrackedEntityInstances(program.id, item.orgUnit, item.period),
                programStages.map(programStage => programStage.id)
            );

            if (!_.isEmpty(trackedEntities)) {
                const approvedTrackedEntities = this.getTEIsWithProgramStages(
                    await this.getTrackedEntityInstances(program.approvedId, item.orgUnit, item.period),
                    programStages.map(programStage => programStage.approvedId)
                );
                !_.isEmpty(approvedTrackedEntities) &&
                    this.api.post(
                        "/tracker",
                        { importStrategy: "DELETE" },
                        { trackedEntities: approvedTrackedEntities }
                    );

                const trackedEntitiesToPost: TrackedEntityInstance[] = trackedEntities.map(trackedEntity => ({
                    ...trackedEntity,
                    trackedEntity: "",
                    programOwners: trackedEntity.programOwners.map(programOwner => ({
                        ...programOwner,
                        program: program.approvedId,
                    })),
                    enrollments: trackedEntity.enrollments.map(enrollment => ({
                        ...enrollment,
                        enrollment: "",
                        trackedEntity: "",
                        program: program.approvedId,
                        events: enrollment.events.map(event => {
                            const approvedProgramStage =
                                programStages.find(programStage => event.programStage === programStage.id)
                                    ?.approvedId ?? "";

                            return {
                                ...event,
                                event: "",
                                trackedEntity: "",
                                program: program.approvedId,
                                programStage: approvedProgramStage,
                            };
                        }),
                    })),
                }));

                return await this.api
                    .post(
                        "/tracker",
                        { async: true, importStrategy: "CREATE_AND_UPDATE" },
                        { trackedEntities: trackedEntitiesToPost }
                    )
                    .getData();
            }
        });
    }

    private getTEIsWithProgramStages(
        trackedEntityInstances: TrackedEntityInstance[],
        programStages: string[]
    ): TrackedEntityInstance[] {
        return trackedEntityInstances.filter(trackedEntity => {
            const teiProgramStage = trackedEntity.enrollments[0]?.events[0]?.programStage ?? "";

            return programStages.includes(teiProgramStage);
        });
    }

    private async getTrackedEntityInstances(
        program: string,
        orgUnit: string,
        period?: string
    ): Promise<TrackedEntityInstance[]> {
        const startDate = period && `${period}-01-01`;
        const endDate = period && `${period}-12-31`;

        let trackedEntities: TrackedEntityInstance[] = [];
        let currentPage = 1;
        let response;
        const pageSize = 200;

        try {
            do {
                response = await this.api
                    .get<{
                        instances: TrackedEntityInstance[];
                        total: number;
                        page: number;
                    }>("/tracker/trackedEntities", {
                        program: program,
                        orgUnit: orgUnit,
                        enrollmentOccurredAfter: startDate,
                        enrollmentOccurredBefore: endDate,
                        pageSize,
                        page: currentPage,
                        totalPages: true,
                        fields: ":all",
                    })
                    .getData();

                if (!response.total) {
                    throw new Error(`Error getting paginated events of program ${program} and organisation ${orgUnit}`);
                }
                trackedEntities = trackedEntities.concat(response.instances);
                currentPage++;
            } while (response.page < Math.ceil(response.total / pageSize));
            return trackedEntities;
        } catch {
            return [];
        }
    }

    private async getProgramStages(program: string): Promise<NamedRef[]> {
        const { programs } = await this.api.metadata
            .get({
                programs: {
                    fields: {
                        programStages: {
                            id: true,
                            name: true,
                        },
                    },
                    filter: {
                        id: { eq: program },
                    },
                    paging: false,
                },
            })
            .getData();

        return _.first(programs)?.programStages ?? [];
    }

    private async duplicateEventProgram(
        program: ApprovalIds,
        items: GLASSDataSubmissionItemIdentifier[],
        isEGASPModule?: boolean
    ): Promise<void> {
        _.forEach(items, async item => {
            const programEvents = await this.getProgramEvents(program.id, item.orgUnit, isEGASPModule ?? false);
            const events = programEvents.filter(
                event => String(new Date(event.eventDate).getFullYear()) === item.period
            );

            if (!_.isEmpty(events)) {
                const approvedProgramEvents = await this.getProgramEvents(
                    program.approvedId,
                    item.orgUnit,
                    isEGASPModule ?? false
                );
                const approvedEvents = approvedProgramEvents.filter(
                    event => String(new Date(event.eventDate).getFullYear()) === item.period
                );

                !_.isEmpty(approvedEvents) &&
                    this.api.post("/events", { importStrategy: "DELETE" }, { events: approvedEvents }); // to do: use new tracker api

                const approvedProgramStage = (await this.getProgramStages(program.approvedId))[0];
                const eventsToPost = events.map(event => {
                    return {
                        ...event,
                        event: "",
                        program: program.approvedId,
                        programStage: approvedProgramStage?.id ?? "",
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
        isDatasetUpdate: boolean,
        signals?: EARSubmissionItemIdentifier[]
    ) {
        const modules = await this.getModules();

        if (!_.isEmpty(items)) {
            const objects = await this.globalStorageClient.listObjectsInCollection<GLASSDataSubmissionItem>(namespace);
            const newSubmissionValues = this.getNewSubmissionValues(
                items,
                objects,
                isDatasetUpdate ? "APPROVED" : "REJECTED"
            );
            const recipients = await this.getRecipientUsers(items, modules);

            const body = `Please review the messages and the reports to find about the causes of this rejection. You have to upload new datasets.\n Reason for rejection:\n ${message}`;

            this.sendNotifications("Rejected by WHO", body, [], recipients);

            await this.postDataSetRegistration(items, modules, false);

            return await this.globalStorageClient.saveObject<GLASSDataSubmissionItem[]>(namespace, newSubmissionValues);
        } else if (signals) {
            const objects = await this.globalStorageClient.listObjectsInCollection<EARDataSubmissionItem>(namespace);
            const newSubmissionValues = this.getNewEARSubmissionValues(signals, objects, "REJECTED");
            const recipients = await this.getEARRecipientUsers(signals, modules);

            const notificationText = this.getEARNotificationText(signals, modules, "rejected");
            const body = `${notificationText} with the following message:\n${message}`;

            this.sendNotifications(notificationText, body, [], recipients);

            return await this.globalStorageClient.saveObject<EARDataSubmissionItem[]>(namespace, newSubmissionValues);
        }
    }

    async reopen(namespace: string, items: GLASSDataSubmissionItemIdentifier[]) {
        const objects = await this.globalStorageClient.listObjectsInCollection<GLASSDataSubmissionItem>(namespace);
        const modules = await this.getModules();

        const newSubmissionValues = this.getNewSubmissionValues(items, objects, "NOT_COMPLETED");
        const recipients = await this.getRecipientUsers(items, modules);

        const message = await this.getNotificationText(items, modules, "reopened");

        this.sendNotifications(message, message, [], recipients);

        await this.postDataSetRegistration(items, modules, false);

        return await this.globalStorageClient.saveObject<GLASSDataSubmissionItem[]>(namespace, newSubmissionValues);
    }

    async accept(namespace: string, items: GLASSDataSubmissionItemIdentifier[]) {
        const objects = await this.globalStorageClient.listObjectsInCollection<GLASSDataSubmissionItem>(namespace);
        const modules = await this.getModules();

        const newSubmissionValues = this.getNewSubmissionValues(items, objects, "UPDATE_REQUEST_ACCEPTED");
        const recipients = await this.getRecipientUsers(items, modules);

        const message = await this.getNotificationText(items, modules, "update request accepted");
        this.sendNotifications(message, message, [], recipients);

        await this.postDataSetRegistration(items, modules, false);

        return await this.globalStorageClient.saveObject<GLASSDataSubmissionItem[]>(namespace, newSubmissionValues);
    }

    async getGLASSDashboardId(): Promise<string> {
        const modules = await this.getModules();
        const glassUnapvdDashboardId = modules.find(module => module.name === "AMR")?.dashboards.validationReport ?? "";

        return glassUnapvdDashboardId;
    }

    async getOrganisationUnitsWithChildren(): Promise<OrgUnitWithChildren[]> {
        const { organisationUnits } = await this.api.metadata
            .get({
                organisationUnits: {
                    fields: {
                        id: true,
                        name: true,
                        level: true,
                        path: true,
                        children: {
                            id: true,
                            name: true,
                            level: true,
                            path: true,
                            children: { id: true, name: true, level: true, path: true },
                        },
                    },
                    filter: { level: { eq: "1" } },
                },
            })
            .getData();

        const regionalLevelOUs = organisationUnits.flatMap(ou => ou.children);
        const countryLevelOUs = regionalLevelOUs.flatMap(ou => ou.children);
        const allOrgUnits = _.union(organisationUnits, regionalLevelOUs, countryLevelOUs);

        return _.orderBy(allOrgUnits, "level", "asc");
    }

    private async postDataSetRegistration(
        items: GLASSDataSubmissionItemIdentifier[],
        modules: GLASSDataSubmissionModule[],
        completed: boolean
    ) {
        const selectedModule = items[0]?.module;
        const questionnaireDataSets =
            modules
                .find(module => module.id === selectedModule)
                ?.questionnaires.map(questionnaire => questionnaire.id) ?? [];

        const dataSetRegistrations = items.flatMap(item =>
            questionnaireDataSets.map(dataSet => ({
                dataSet: dataSet,
                period: item.period,
                organisationUnit: item.orgUnit,
                completed,
            }))
        );

        if (!_(questionnaireDataSets).compact().isEmpty()) {
            await this.api
                .post<CompleteDataSetRegistrationsResponse>(
                    "/completeDataSetRegistrations",
                    {},
                    { completeDataSetRegistrations: dataSetRegistrations }
                )
                .getData();
        }
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

    private getNewEARSubmissionValues(
        signals: EARSubmissionItemIdentifier[],
        objects: EARDataSubmissionItem[],
        status: Status
    ) {
        return objects.map(object => {
            const isNewItem = !!signals.find(
                signal =>
                    signal.orgUnitId === object.orgUnit.id && signal.module === object.module && signal.id === object.id
            );

            const statusHistory = {
                changedAt: new Date().toISOString(),
                from: object.status,
                to: status,
            };

            return isNewItem
                ? { ...object, status: status, statusHistory: [...object.statusHistory, statusHistory] }
                : object;
        });
    }
}

const emptyPage: PaginatedObjects<GLASSDataSubmissionItem> = {
    pager: { page: 1, pageCount: 1, pageSize: 10, total: 1 },
    objects: [],
};

const AMC_PRODUCT_REGISTER_CODE = "AMR_GLASS_AMC_PRO_PRODUCT_REGISTER";

const moduleMapping: Record<string, string> = {
    AMC: "AMC",
    AMR: "AMR",
    AMR_FUNGHI: "AMR - Fungal", // to do: remove this line when submissions have value AMR_FUNGAL
    AMR_FUNGAL: "AMR - Fungal",
    AMR_INDIVIDUAL: "AMR - Individual",
    EAR: "EAR",
    EGASP: "EGASP",
};

type RegistrationItemBase = Pick<
    GLASSDataSubmissionItem,
    "orgUnitName" | "orgUnit" | "period" | "questionnaireCompleted"
>;

function getDatasetsUploaded(
    uploads: GLASSDataSubmissionItemUpload[],
    object: GLASSDataSubmissionItem | undefined
): string {
    const uploadStatus = uploads.filter(upload => upload.dataSubmission === object?.id).map(item => item.status);
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
    if (dataSetsUploaded === "" || !dataSetsUploaded) {
        dataSetsUploaded = "No datasets";
    }
    return dataSetsUploaded;
}

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

function getDataSubmissionPeriods(): number[] {
    const currentYear = new Date().getFullYear();
    const dataSubmissionPeriods = _.range(currentYear - 7, currentYear + 1);

    return dataSubmissionPeriods;
}
