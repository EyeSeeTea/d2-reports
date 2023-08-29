export interface MalDataSubscriptionItem {
    dataElementName: string;
    dataElementId: string;
    subscription: boolean;
    sectionName: string;
    sectionId: string;
    lastDateOfSubscription: string;
}

export interface MalDataSubscriptionItemIdentifier {
    dataElementId: string;
    sectionId: string;
}

export interface SubscriptionStatus {
    dataElementId: string;
    subscribed: boolean;
}

export function getDataSubscriptionItemId(dataSet: MalDataSubscriptionItem): string {
    return [dataSet.dataElementId, dataSet.sectionId].join("-");
}

export function getSubscriptionValue(dataSet: MalDataSubscriptionItem, subscription: SubscriptionStatus[]): boolean {
    const subscriptionValue =
        subscription.find(subscriptionValue => subscriptionValue.dataElementId === dataSet.dataElementId)?.subscribed ??
        false;

    return subscriptionValue;
}

export function parseDataSubscriptionItemId(string: string): MalDataSubscriptionItemIdentifier | undefined {
    const [dataElementId, sectionId] = string.split("-");
    if (!dataElementId || !sectionId) return undefined;

    return { dataElementId, sectionId };
}
