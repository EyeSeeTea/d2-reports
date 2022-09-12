import { Id } from "../../../common/entities/Base";
import { Config } from "../../../common/entities/Config";
import { PaginatedObjects, Paging, Sorting } from "../../../common/entities/PaginatedObjects";
import { DataDiffItem } from "../entities/DataDiffItem";
import { DataDuplicationItem, DataDuplicationItemIdentifier } from "../entities/DataDuplicationItem";

export interface MALDataDuplicationRepository {
    get(options: MALDataDuplicationRepositoryGetOptions): Promise<PaginatedObjects<DataDuplicationItem>>;
    getDiff(options: MALDataDuplicationRepositoryGetOptions): Promise<PaginatedObjects<DataDiffItem>>;
    save(filename: string, dataSets: DataDuplicationItem[]): Promise<void>;
    complete(dataSets: DataDuplicationItemIdentifier[]): Promise<boolean>;
    approve(dataSets: DataDuplicationItemIdentifier[]): Promise<boolean>;
    duplicate(dataSets: DataDuplicationItemIdentifier[]): Promise<boolean>;
    incomplete(dataSets: DataDuplicationItemIdentifier[]): Promise<boolean>;
    unapprove(dataSets: DataDuplicationItemIdentifier[]): Promise<boolean>;
    getColumns(namespace: string): Promise<string[]>;
    saveColumns(namespace: string, columns: string[]): Promise<void>;
}

export interface MALDataDuplicationRepositoryGetOptions {
    config: Config;
    paging: Paging;
    sorting: Sorting<DataDuplicationItem>;
    periods: string[];
    orgUnitIds: Id[];
    dataSetIds: Id[];
    approvalStatus?: boolean;
    completionStatus?: boolean;
}
