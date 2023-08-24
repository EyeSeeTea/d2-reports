import { PaginatedObjectives } from "../../../../data/reports/mal-data-subscription/MalDataSubscriptionDefaultRepository";
import { Config } from "../../../common/entities/Config";
import { PaginatedObjects, Paging, Sorting } from "../../../common/entities/PaginatedObjects";
import {
    DashboardSubscriptionItem,
    ElementType,
    DataElementsSubscriptionItem,
    SubscriptionStatus,
} from "../entities/MalDataSubscriptionItem";

export interface MalDataSubscriptionRepository {
    get(options: MalDataSubscriptionOptions): Promise<PaginatedObjectives<DataElementsSubscriptionItem>>;
    getChildrenDataElements(options: MalDataSubscriptionOptions): Promise<PaginatedObjects<DashboardSubscriptionItem>>;
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
    sorting?: Sorting<DataElementsSubscriptionItem>;
    dashboardSorting?: Sorting<DashboardSubscriptionItem>;
    elementType: ElementType;
    sections: string[];
    subscriptionStatus?: string;
    dataElementGroups: string[];
}
