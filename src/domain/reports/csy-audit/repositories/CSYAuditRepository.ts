import { Config } from "../../../common/entities/Config";
import { PaginatedObjects, Paging, Sorting } from "../../../common/entities/PaginatedObjects";
import { AuditItem } from "../entities/AuditItem";

export interface CSYAuditRepository {
    get(options: CSYAuditOptions): Promise<PaginatedObjects<AuditItem>>;
}

export interface CSYAuditOptions {
    config: Config;
    paging: Paging;
    sorting: Sorting<AuditItem>;
    year: string;
    quarter?: string;
    orgUnitPaths: string[];
}
