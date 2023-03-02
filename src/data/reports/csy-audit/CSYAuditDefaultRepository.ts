import { PaginatedObjects } from "../../../domain/common/entities/PaginatedObjects";
import { AuditItem } from "../../../domain/reports/csy-audit/entities/AuditItem";
import { CSYAuditOptions, CSYAuditRepository } from "../../../domain/reports/csy-audit/repositories/CSYAuditRepository";
import { D2Api, Pager } from "../../../types/d2-api";
import { DataStoreStorageClient } from "../../common/clients/storage/DataStoreStorageClient";
import { StorageClient } from "../../common/clients/storage/StorageClient";
import { Instance } from "../../common/entities/Instance";

export class CSYAuditDefaultRepository implements CSYAuditRepository {
    private storageClient: StorageClient;
    private globalStorageClient: StorageClient;

    constructor(private api: D2Api) {
        const instance = new Instance({ url: this.api.baseUrl });
        this.storageClient = new DataStoreStorageClient("user", instance);
        this.globalStorageClient = new DataStoreStorageClient("global", instance);
    }

    async get(options: CSYAuditOptions): Promise<PaginatedObjects<AuditItem>> {
        const { paging } = options;

        const auditItems: AuditItem[] = [];
        const pager: Pager = {
            page: paging.page,
            pageSize: paging.pageSize,
            pageCount: 10,
            total: 100,
        };

        return { pager, objects: auditItems };
    }
}
