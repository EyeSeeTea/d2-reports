import { Paging, Sorting } from "../../../common/entities/PaginatedObjects";
import { DashboardSubscription } from "../entities/DashboardSubscription";
import { SubscriptionWithChildrenReport } from "../usecases/GetSubscriptionReportUseCase";

export interface DashboardSubscriptionRepository {
    get(options: DashboardSubscriptionOptions): Promise<DashboardSubscription[]>;
}

export type SubscriptionWithChildrenOptions = {
    paging: Paging;
    sorting: Sorting<SubscriptionWithChildrenReport>;
};

export type DashboardSubscriptionOptions = SubscriptionWithChildrenOptions;
