export type SubscriptionStatus = {
    dashboardId?: string;
    dataElementId: string;
    lastDateOfSubscription?: string;
    subscribed: boolean;
    user: string;
};

export enum SubscriptionValue {
    notSubscribed = "Not Subscribed",
    subscribed = "Subscribed",
    subscribedToSomeElements = "Subscribed to some elements",
}
