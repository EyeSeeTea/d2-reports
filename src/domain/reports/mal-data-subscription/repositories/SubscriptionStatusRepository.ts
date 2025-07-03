import { SubscriptionStatus } from "../entities/SubscriptionStatus";

export interface SubscriptionStatusRepository {
    getSubscription(namespace: string): Promise<SubscriptionStatus[]>;
    saveSubscription(namespace: string, subscriptionStatus: SubscriptionStatus[]): Promise<void>;
}
