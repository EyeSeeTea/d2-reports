import { Paging, Sorting } from "../../../common/entities/PaginatedObjects";
import { VisualizationSubscription } from "../entities/DashboardSubscription";
import { SubscriptionWithChildrenReport } from "../usecases/GetSubscriptionReportUseCase";

export interface VisualizationSubscriptionRepository {
    get(options: VisualizationSubscriptionOptions): Promise<VisualizationSubscription[]>;
}

export type VisualizationSubscriptionOptions = {
    paging: Paging;
    sorting: Sorting<SubscriptionWithChildrenReport>;
};
