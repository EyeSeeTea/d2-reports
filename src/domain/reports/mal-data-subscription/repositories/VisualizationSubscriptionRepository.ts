import { VisualizationSubscription } from "../entities/DashboardSubscription";
import { SubscriptionWithChildrenOptions } from "./DashboardSubscriptionRepository";

export interface VisualizationSubscriptionRepository {
    get(options: VisualizationSubscriptionOptions): Promise<VisualizationSubscription[]>;
}

export type VisualizationSubscriptionOptions = SubscriptionWithChildrenOptions;
