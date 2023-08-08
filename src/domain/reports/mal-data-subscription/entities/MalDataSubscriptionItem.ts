import { NamedRef } from "../../../common/entities/Base";

export interface DataElementsSubscriptionItem {
    dataElementName: string;
    dataElementId: string;
    subscription: boolean;
    sectionName: string;
    sectionId: string;
    lastDateOfSubscription: string;
}

export interface DashboardSubscriptionItem {
    id: string;
    name: string;
    subscribedElements: number;
    subscription: boolean;
    lastDateOfSubscription: string;
    children: NamedRef[];
}

export interface MalDataSubscriptionItemIdentifier {
    dataElementId: string;
    sectionId: string;
}

export interface SubscriptionStatus {
    dataElementId: string;
    subscribed: boolean;
}

export type ElementType = "dataElements" | "dashboards";

export function getDataSubscriptionItemId(dataElement: DataElementsSubscriptionItem): string {
    return [dataElement.dataElementId, dataElement.sectionId].join("-");
}

export function getSubscriptionValue(
    dataElement: DataElementsSubscriptionItem,
    subscription: SubscriptionStatus[]
): boolean {
    const subscriptionValue =
        subscription.find(subscriptionValue => subscriptionValue.dataElementId === dataElement.dataElementId)
            ?.subscribed ?? false;

    return subscriptionValue;
}

export function parseDataSubscriptionItemId(string: string): MalDataSubscriptionItemIdentifier | undefined {
    const [dataElementId, sectionId] = string.split("-");
    if (!dataElementId || !sectionId) return undefined;

    return { dataElementId, sectionId };
}
