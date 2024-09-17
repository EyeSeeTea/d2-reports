import { emptyPage, PaginatedObjects } from "../../../domain/common/entities/PaginatedObjects";
import { D2Api } from "../../../types/d2-api";
import { AuditItem } from "../../../domain/reports/csy-audit-operative/entities/AuditItem";
import {
    AuditItemRepository,
    AuditOptions,
} from "../../../domain/reports/csy-audit-operative/repositories/AuditRepository";
import { getOrgUnitIdsFromPaths } from "../../../domain/common/entities/OrgUnit";

export class AuditItemD2Repository implements AuditItemRepository {
    constructor(private api: D2Api) {}

    async get(options: AuditOptions): Promise<PaginatedObjects<AuditItem>> {
        return emptyPage;
    }

    async save(filename: string, items: AuditItem[]): Promise<void> {
        throw new Error("Method not implemented.");
    }
}
