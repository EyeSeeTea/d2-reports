import { PaginatedObjects, Paging, Sorting } from "../../../common/entities/PaginatedObjects";
import { DashboardSubscription } from "../entities/DashboardSubscription";

export interface DashboardSubscriptionRepository {
    get(options: DashboardSubscriptionOptions): Promise<PaginatedObjects<DashboardSubscription>>;
}

export type DashboardSubscriptionOptions = {
    paging: Paging;
    sorting: Sorting<DashboardSubscription>;
};
