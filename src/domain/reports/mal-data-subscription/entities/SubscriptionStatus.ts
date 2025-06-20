export type SubscriptionStatus = {
    dashboardId?: string;
    dataElementId: string;
    lastDateOfSubscription?: string;
    subscribed: boolean;
    user: string;
};
