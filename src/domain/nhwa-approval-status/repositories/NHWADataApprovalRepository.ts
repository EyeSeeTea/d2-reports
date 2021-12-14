import { DataApprovalItem } from "../entities/DataApprovalItem";
import { Id } from "../../common/entities/Base";
import { Config } from "../../common/entities/Config";
import { PaginatedObjects, Paging, Sorting } from "../../common/entities/PaginatedObjects";

export interface NHWADataApprovalRepository {
    get(options: NHWADataApprovalRepositoryGetOptions): Promise<PaginatedObjects<DataApprovalItem>>;
    save(filename: string, dataSets: DataApprovalItem[]): Promise<void>;
}

export interface NHWADataApprovalRepositoryGetOptions {
    config: Config;
    paging: Paging;
    sorting: Sorting<DataApprovalItem>;
    periods: string[];
    orgUnitIds: Id[];
    dataSetIds: Id[];
    approvalStatus?: string;
    completionStatus?: string;
}
