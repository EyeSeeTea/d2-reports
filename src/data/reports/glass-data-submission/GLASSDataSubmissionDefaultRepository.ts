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
        const { paging, sorting, orgUnitIds, periods, completionStatus } = options;

        const objects = (await this.globalStorageClient.getObject<GLASSDataSubmissionItem[]>(namespace)) ?? [];
        const modules = (await this.globalStorageClient.getObject<GLASSDataSubmissionModule[]>("modules")) ?? [];

        const filteredObjects = objects.filter(
            object =>
                (_.isEmpty(orgUnitIds) ? object.orgUnit : orgUnitIds.includes(object.orgUnit)) &&
                periods.includes(String(object.period)) &&
                (completionStatus
                    ? object.status === "COMPLETE"
                    : completionStatus === false
                    ? object.status !== "COMPLETE"
                    : object)
        );

        const rows = await promiseMap(filteredObjects, async row => {
            const completedQuestionnaire = modules.find(mod => mod.id === row.module && !_.isEmpty(mod.questionnaires));
            //const uploadedDataSet = uploads.find

            return {
                ...row,
                orgUnit: await getCountryName(this.api, row.orgUnit),
                questionnaireCompleted: completedQuestionnaire ? true : false,
            };
        });

        const rowsInPage = _(rows)
            .orderBy([row => row[sorting.field]], [sorting.direction])
            .drop((paging.page - 1) * paging.pageSize)
            .take(paging.pageSize)
            .value();

        const pager: Pager = {
            page: paging.page,
            pageSize: paging.pageSize,
            pageCount: Math.ceil(objects.length / paging.pageSize),
            total: objects.length,
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

    async reject(namespace: string, items: GLASSDataSubmissionItemIdentifier[]) {
        const objects = await this.globalStorageClient.listObjectsInCollection<GLASSDataSubmissionItem>(namespace);
        const newSubmissionValues = await getNewSubmissionValues(this.api, items, objects, "REJECTED");

        return await this.globalStorageClient.saveObject<GLASSDataSubmissionItem[]>(namespace, newSubmissionValues);
    }

    async reopen(namespace: string, items: GLASSDataSubmissionItemIdentifier[]) {
        const objects = await this.globalStorageClient.listObjectsInCollection<GLASSDataSubmissionItem>(namespace);
        const newSubmissionValues = await getNewSubmissionValues(this.api, items, objects, "NOT_COMPLETED");

        return await this.globalStorageClient.saveObject<GLASSDataSubmissionItem[]>(namespace, newSubmissionValues);
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
