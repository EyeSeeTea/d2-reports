import { Config } from "../../../common/entities/Config";
import { PaginatedObjects, Paging, Sorting } from "../../../common/entities/PaginatedObjects";
import { MalDataSubscriptionItem } from "../entities/MalDataSubscriptionItem";

export interface MalDataSubscriptionRepository {
    get(options: MalDataSubscriptionOptions): Promise<PaginatedObjects<MalDataSubscriptionItem>>;
    save(filename: string, dataSets: MalDataSubscriptionItem[]): Promise<void>;
    getColumns(namespace: string): Promise<string[]>;
    saveColumns(namespace: string, columns: string[]): Promise<void>;
    getSortOrder(): Promise<string[]>;
    generateSortOrder(): Promise<void>;
}

export interface MalDataSubscriptionOptions {
    config: Config;
    paging: Paging;
    sorting: Sorting<MalDataSubscriptionItem>;
    dataElementNames: string[];
    sectionNames: string[];
    lastDateOfSubscription: string[];
}
