import { SubscriptionStatus } from "../entities/SubscriptionStatus";

export interface SubscriptionStatusRepository {
    get(): Promise<SubscriptionStatus[]>;
    save(subscriptionStatus: SubscriptionStatus[]): Promise<void>;
}
