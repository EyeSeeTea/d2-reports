import { Id } from "../../../common/entities/Base";
import { Config } from "../../../common/entities/Config";
import { PaginatedObjects, Paging, Sorting } from "../../../common/entities/PaginatedObjects";
import { DataDiffItem } from "../entities/DataDiffItem";
import {
    MalDataSubscriptionItem,
    MalDataSubscriptionItemIdentifier,
    Monitoring,
} from "../entities/MalDataSubscriptionItem";
import { DataDiffItemIdentifier } from "../entities/DataDiffItem";

export interface MalDataSubscriptionRepository {
    get(options: MalDataSubscriptionOptions): Promise<PaginatedObjects<MalDataSubscriptionItem>>;
    getDiff(options: MalDataSubscriptionOptions): Promise<PaginatedObjects<DataDiffItem>>;
    save(filename: string, dataSets: MalDataSubscriptionItem[]): Promise<void>;
    complete(dataSets: MalDataSubscriptionItemIdentifier[]): Promise<boolean>;
    approve(dataSets: MalDataSubscriptionItemIdentifier[]): Promise<boolean>;
    duplicateDataSets(dataSets: MalDataSubscriptionItemIdentifier[]): Promise<boolean>;
    duplicateDataValues(dataSets: DataDiffItemIdentifier[]): Promise<boolean>;
    duplicateDataValuesAndRevoke(dataSets: DataDiffItemIdentifier[]): Promise<boolean>;
    incomplete(dataSets: MalDataSubscriptionItemIdentifier[]): Promise<boolean>;
    unapprove(dataSets: MalDataSubscriptionItemIdentifier[]): Promise<boolean>;
    getColumns(namespace: string): Promise<string[]>;
    saveColumns(namespace: string, columns: string[]): Promise<void>;
    getMonitoring(namespace: string): Promise<Monitoring[]>;
    saveMonitoring(namespace: string, monitoring: Monitoring[]): Promise<void>;
    getSortOrder(): Promise<string[]>;
    generateSortOrder(): Promise<void>;
}

export interface MalDataSubscriptionOptions {
    config: Config;
    paging: Paging;
    sorting: Sorting<MalDataSubscriptionItem>;
    periods: string[];
    orgUnitIds: Id[];
    dataSetIds: Id[];
    approvalStatus?: boolean;
    completionStatus?: boolean;
}
