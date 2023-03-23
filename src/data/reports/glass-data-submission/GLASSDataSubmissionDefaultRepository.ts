import _ from "lodash";
import { PaginatedObjects } from "../../../domain/common/entities/PaginatedObjects";
import {
    GLASSDataSubmissionItem,
    GLASSDataSubmissionItemIdentifier,
    GLASSDataSubmissionModule,
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
import { Ref } from "../../../domain/common/entities/Base";
import { statusItems } from "../../../webapp/reports/glass-data-submission/glass-data-submission-list/Filters";

// type CompleteDataSetRegistrationsType = {
//     completeDataSetRegistrations: [
//         {
//             period?: string;
//             dataSet?: string;
//             organisationUnit?: string;
//             attributeOptionCombo?: string;
//             date?: string;
//             storedBy?: string;
//             completed?: boolean;
//         }
//     ];
// };

export class GLASSDataSubmissionDefaultRepository implements GLASSDataSubmissionRepository {
    private storageClient: StorageClient;
    private globalStorageClient: StorageClient;

    constructor(private api: D2Api) {
        const instance = new Instance({ url: this.api.baseUrl });
        this.storageClient = new DataStoreStorageClient("global", instance);
        this.globalStorageClient = new DataStoreStorageClient("global", instance);
    }

    async get(
        options: GLASSDataSubmissionOptions,
        namespace: string
    ): Promise<PaginatedObjects<GLASSDataSubmissionItem>> {
        const { paging, sorting, orgUnitIds, periods, completionStatus, submissionStatus } = options;

        const objects = (await this.globalStorageClient.getObject<GLASSDataSubmissionItem[]>(namespace)) ?? [];
        const modules = (await this.globalStorageClient.getObject<GLASSDataSubmissionModule[]>("modules")) ?? [];

        const rows = await promiseMap(objects, async row => {
            const completedQuestionnaire = modules.find(mod => mod.id === row.module && !_.isEmpty(mod.questionnaires));

            return {
                ...row,
                orgUnit: await getCountryName(this.api, row.orgUnit),
                submissionStatus: statusItems.find(item => item.value === row.status)?.text ?? "",
                questionnaireCompleted: completedQuestionnaire ? true : false,
            };
        });

        const filteredRows = rows.filter(
            row =>
                (_.isEmpty(orgUnitIds) ? row.orgUnit : orgUnitIds.includes(row.orgUnit)) &&
                periods.includes(String(row.period)) &&
                (completionStatus === undefined
                    ? row.questionnaireCompleted
                    : row.questionnaireCompleted === completionStatus) &&
                (submissionStatus === undefined ? row.status : row.status === submissionStatus)
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

    async getColumns(namespace: string): Promise<string[]> {
        const columns = await this.storageClient.getObject<string[]>(namespace);

        return columns ?? [];
    }

    async saveColumns(namespace: string, columns: string[]): Promise<void> {
        return this.storageClient.saveObject<string[]>(namespace, columns);
    }

    async approve(namespace: string, items: GLASSDataSubmissionItemIdentifier[]) {
        const objects = await this.globalStorageClient.listObjectsInCollection<GLASSDataSubmissionItem>(namespace);
        const newSubmissionValues = await getNewSubmissionValues(this.api, items, objects, "APPROVED");

        // const completeCheckResponses: CompleteDataSetRegistrationsType[] = await promiseMap(newItems, async newItem =>
        //     this.api
        //         .get<any>("/completeDataSetRegistrations", {
        //             dataSet: "OYc0CihXiSn",
        //             period: newItem.period,
        //             orgUnit: newItem.orgUnit,
        //         })
        //         .getData()
        // );

        return await this.globalStorageClient.saveObject<GLASSDataSubmissionItem[]>(namespace, newSubmissionValues);
    }

    async reject(
        namespace: string,
        items: GLASSDataSubmissionItemIdentifier[],
        message: string,
        isDatasetUpdate: boolean
    ) {
        const objects = await this.globalStorageClient.listObjectsInCollection<GLASSDataSubmissionItem>(namespace);
        const newSubmissionValues = await getNewSubmissionValues(
            this.api,
            items,
            objects,
            isDatasetUpdate ? "APPROVED" : "REJECTED"
        );
        const modules = (await this.globalStorageClient.getObject<GLASSDataSubmissionModule[]>("modules")) ?? [];

        const userGroups: Ref[] = _.flatMap(
            _.compact(
                items.map(item => {
                    return modules.find(mod => mod.id === item.module && !_.isEmpty(mod.userGroups))?.userGroups
                        .captureAccess;
                })
            )
        ).map(({ id }) => ({ id }));

        this.sendNotifications(message, userGroups);

        return await this.globalStorageClient.saveObject<GLASSDataSubmissionItem[]>(namespace, newSubmissionValues);
    }

    async reopen(namespace: string, items: GLASSDataSubmissionItemIdentifier[]) {
        const objects = await this.globalStorageClient.listObjectsInCollection<GLASSDataSubmissionItem>(namespace);
        const newSubmissionValues = await getNewSubmissionValues(this.api, items, objects, "NOT_COMPLETED");

        return await this.globalStorageClient.saveObject<GLASSDataSubmissionItem[]>(namespace, newSubmissionValues);
    }

    async accept(namespace: string, items: GLASSDataSubmissionItemIdentifier[]) {
        const objects = await this.globalStorageClient.listObjectsInCollection<GLASSDataSubmissionItem>(namespace);
        const newSubmissionValues = await getNewSubmissionValues(this.api, items, objects, "UPDATE_REQUEST_ACCEPTED");

        return await this.globalStorageClient.saveObject<GLASSDataSubmissionItem[]>(namespace, newSubmissionValues);
    }

    async sendNotifications(message: string, userGroups: Ref[]): Promise<void> {
        await this.api.messageConversations.post({
            subject: "Rejected by WHO",
            text: `Please review the messages and the reports to find about the causes of this rejection. You have to upload new datasets.\n Reason for rejection:\n ${message}`,
            userGroups,
        });
    }
}

async function getCountryName(api: D2Api, countryId: string): Promise<string> {
    const { organisationUnits } = await api.metadata
        .get({
            organisationUnits: {
                filter: { id: { eq: countryId } },
                fields: {
                    name: true,
                },
            },
        })
        .getData();

    return organisationUnits[0]?.name ?? "";
}

async function getCountryUid(api: D2Api, countryName?: string): Promise<string> {
    const { organisationUnits } = await api.metadata
        .get({
            organisationUnits: {
                filter: { name: { eq: countryName } },
                fields: {
                    id: true,
                },
            },
        })
        .getData();

    return organisationUnits[0]?.id ?? "";
}

async function getNewSubmissionValues(
    api: D2Api,
    items: GLASSDataSubmissionItemIdentifier[],
    objects: GLASSDataSubmissionItem[],
    status: Status
) {
    const newItems: GLASSDataSubmissionItemIdentifier[] = await promiseMap(items, async ob => ({
        ...ob,
        orgUnit: await getCountryUid(api, ob.orgUnit),
    }));

    const newSubmissionValues = _.flatMap(
        objects.map(object =>
            newItems.map(item =>
                item.period === String(object.period) &&
                item.orgUnit === object.orgUnit &&
                item.module === object.module
                    ? { ...object, status }
                    : object
            )
        )
    );

    return newSubmissionValues;
}
