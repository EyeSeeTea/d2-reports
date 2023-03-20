import _ from "lodash";
import { PaginatedObjects } from "../../../domain/common/entities/PaginatedObjects";
import { GLASSDataSubmissionItem } from "../../../domain/reports/glass-data-submission/entities/GLASSDataSubmissionItem";
import {
    GLASSDataSubmissionOptions,
    GLASSDataSubmissionRepository,
} from "../../../domain/reports/glass-data-submission/repositories/GLASSDataSubmissionRepository";
import { D2Api, Pager } from "../../../types/d2-api";
import { DataStoreStorageClient } from "../../common/clients/storage/DataStoreStorageClient";
import { StorageClient } from "../../common/clients/storage/StorageClient";
import { Instance } from "../../common/entities/Instance";
import { promiseMap } from "../../../utils/promises";

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

        const rows = await promiseMap(filteredObjects, async row => ({
            ...row,
            orgUnit: await getCountryName(this.api, row.orgUnit),
        }));

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
