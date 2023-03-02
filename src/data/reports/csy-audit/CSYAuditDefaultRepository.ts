import _ from "lodash";
import { PaginatedObjects } from "../../../domain/common/entities/PaginatedObjects";
import { AuditItem } from "../../../domain/reports/csy-audit/entities/AuditItem";
import { CSYAuditOptions, CSYAuditRepository } from "../../../domain/reports/csy-audit/repositories/CSYAuditRepository";
import { AnalyticsResponse, D2Api, Pager } from "../../../types/d2-api";
import { DataStoreStorageClient } from "../../common/clients/storage/DataStoreStorageClient";
import { StorageClient } from "../../common/clients/storage/StorageClient";
import { Instance } from "../../common/entities/Instance";
import { getOrgUnitIdsFromPaths } from "../../../domain/common/entities/OrgUnit";

export class CSYAuditDefaultRepository implements CSYAuditRepository {
    private storageClient: StorageClient;
    private globalStorageClient: StorageClient;

    constructor(private api: D2Api) {
        const instance = new Instance({ url: this.api.baseUrl });
        this.storageClient = new DataStoreStorageClient("user", instance);
        this.globalStorageClient = new DataStoreStorageClient("global", instance);
    }

    async get(options: CSYAuditOptions): Promise<PaginatedObjects<AuditItem>> {
        const { paging, year, orgUnitPaths, quarter } = options;

        const { objects } = await this.api.models.dataElements
            .get({
                fields: { id: true },
                filter: { name: { $like: "ETA_Registry ID" } },
            })
            .getData();

        const { programs } = await this.api.metadata
            .get({
                programs: {
                    fields: { id: true },
                    filter: { name: { eq: "WHO Clinical Registry - Trauma" } },
                },
            })
            .getData();

        const { programStages } = await this.api.metadata
            .get({
                programStages: {
                    fields: { id: true },
                    filter: { name: { eq: "WHO Clinical Registry - Trauma" } },
                },
            })
            .getData();

        try {
            const { rows } = await this.api
                // program
                .get<AnalyticsResponse>(`/analytics/events/query/${programs[0]?.id}.json`, {
                    // ijG1c7IqeZb in option code 7
                    dimension: [
                        `pe:${!quarter ? year : `${year}${quarter}`}`,
                        `ou:${_.last(getOrgUnitIdsFromPaths(orgUnitPaths))}`,
                        "ijG1c7IqeZb:IN:7",
                        `${objects[0]?.id}`,
                    ],
                    stage: programStages[0]?.id, // program stage
                })
                .getData();

            const auditItems: Array<AuditItem> = rows.map(item => ({
                registerId: _.last(item) ?? "",
            }));

            const pager: Pager = {
                page: paging.page,
                pageSize: paging.pageSize,
                pageCount: Math.ceil(rows.length / paging.pageSize),
                total: rows.length,
            };

            return { pager, objects: auditItems };
        } catch (error) {
            console.debug(error);
            return { pager: { page: 1, pageCount: 1, pageSize: 10, total: 1 }, objects: [] };
        }
    }
}
