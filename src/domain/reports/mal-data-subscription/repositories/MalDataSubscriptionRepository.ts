import { Config } from "../../../common/entities/Config";
import { PaginatedObjects, Paging, Sorting } from "../../../common/entities/PaginatedObjects";
import { MalDataSubscriptionItem, SubscriptionStatus } from "../entities/MalDataSubscriptionItem";

export interface MalDataSubscriptionRepository {
    get(options: MalDataSubscriptionOptions): Promise<PaginatedObjects<MalDataSubscriptionItem>>;
    getColumns(namespace: string): Promise<string[]>;
    saveColumns(namespace: string, columns: string[]): Promise<void>;
    getSortOrder(): Promise<string[]>;
    generateSortOrder(): Promise<void>;
    getSubscription(namespace: string): Promise<SubscriptionStatus[]>;
    saveSubscription(namespace: string, subscriptionStatus: SubscriptionStatus[]): Promise<void>;
}

export interface MalDataSubscriptionOptions {
    config: Config;
    paging: Paging;
    sorting: Sorting<MalDataSubscriptionItem>;
    elementType: string;
    dataElementIds: string[];
    sections: string[];
}
