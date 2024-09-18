import { PaginatedObjects, Paging, Sorting } from "../../../common/entities/PaginatedObjects";
import { AuditItem, AuditType } from "../entities/AuditItem";

export interface AuditItemRepository {
    get(options: AuditOptions): Promise<PaginatedObjects<AuditItem>>;
}

export interface AuditOptions {
    paging: Paging;
    sorting: Sorting<AuditItem>;
    orgUnitPaths: string[];
    auditType: AuditType;
    year: string;
    quarter?: string;
}
