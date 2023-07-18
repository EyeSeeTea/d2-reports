import { Config } from "../../../common/entities/Config";
import { PaginatedObjects, Paging, Sorting } from "../../../common/entities/PaginatedObjects";
import { AuditItem } from "../entities/AuditItem";

export interface CSYAuditEmergencyRepository {
    get(options: CSYAuditEmergencyOptions): Promise<PaginatedObjects<AuditItem>>;
    save(filename: string, items: AuditItem[]): Promise<void>;
}

export interface CSYAuditEmergencyOptions {
    config: Config;
    paging: Paging;
    sorting: Sorting<AuditItem>;
    year: string;
    quarter?: string;
    orgUnitPaths: string[];
    auditType: string;
}
