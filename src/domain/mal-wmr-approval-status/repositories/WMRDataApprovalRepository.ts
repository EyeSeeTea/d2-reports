import { Id } from "../../common/entities/Base";
import { Config } from "../../common/entities/Config";
import { PaginatedObjects, Paging, Sorting } from "../../common/entities/PaginatedObjects";
import { DataApprovalItem } from "../entities/DataApprovalItem";

export interface WMRDataApprovalRepository {
    get(options: WMRDataApprovalRepositoryGetOptions): Promise<PaginatedObjects<DataApprovalItem>>;
}

export interface WMRDataApprovalRepositoryGetOptions {
    config: Config;
    paging: Paging;
    sorting: Sorting<DataApprovalItem>;
    periods: string[];
    orgUnitIds: Id[];
    dataSetIds: Id[];
    approvalStatus?: string;
    completionStatus?: string;
}
