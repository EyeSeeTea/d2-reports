import { Id } from "../../../common/entities/Base";
import { Config } from "../../../common/entities/Config";
import { PaginatedObjects, Paging, Sorting } from "../../../common/entities/PaginatedObjects";
import { DataDiffItem } from "../entities/DataDiffItem";
import { MalDataApprovalItem, MalDataApprovalItemIdentifier, MonitoringValue } from "../entities/MalDataApprovalItem";
import { DataDiffItemIdentifier } from "../entities/DataDiffItem";

export interface MalDataApprovalRepository {
    get(options: MalDataApprovalOptions): Promise<PaginatedObjects<MalDataApprovalItem>>;
    getDiff(options: MalDataApprovalOptions): Promise<PaginatedObjects<DataDiffItem>>;
    getCountryCodes(): Promise<{ id: string; code: string }[]>;
    save(filename: string, dataSets: MalDataApprovalItem[]): Promise<void>;
    complete(dataSets: MalDataApprovalItemIdentifier[]): Promise<boolean>;
    approve(dataSets: MalDataApprovalItemIdentifier[]): Promise<boolean>;
    duplicateDataSets(dataSets: MalDataApprovalItemIdentifier[]): Promise<boolean>;
    duplicateDataValues(dataSets: DataDiffItemIdentifier[]): Promise<boolean>;
    duplicateDataValuesAndRevoke(dataSets: DataDiffItemIdentifier[]): Promise<boolean>;
    incomplete(dataSets: MalDataApprovalItemIdentifier[]): Promise<boolean>;
    unapprove(dataSets: MalDataApprovalItemIdentifier[]): Promise<boolean>;
    getColumns(namespace: string): Promise<string[]>;
    saveColumns(namespace: string, columns: string[]): Promise<void>;
    getMonitoring(namespace: string): Promise<MonitoringValue>;
    saveMonitoring(namespace: string, monitoring: MonitoringValue): Promise<void>;
    getSortOrder(): Promise<string[]>;
    generateSortOrder(): Promise<void>;
}

export interface MalDataApprovalOptions {
    config: Config;
    paging: Paging;
    sorting: Sorting<MalDataApprovalItem>;
    periods: string[];
    useOldPeriods?: boolean;
    orgUnitIds: Id[];
    dataSetIds: Id[];
    approvalStatus?: boolean;
    completionStatus?: boolean;
}
