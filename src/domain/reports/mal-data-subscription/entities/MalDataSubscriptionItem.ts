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
    subscription: string;
    lastDateOfSubscription: string;
    children: ChildrenDataElements[];
}

export interface ChildrenDataElements extends NamedRef {
    dataElementGroups: NamedRef[];
    subscribed: boolean;
    lastDateOfSubscription: string;
}

export interface DataElementSubscriptionItemIdentifier {
    dataElementId: string;
    sectionId: string;
}

export interface DashboardSubscriptionItemIdentifier {
    dashboardId: string;
    dataElementIds: string[];
}

export interface SubscriptionStatus {
    dataElementId: string;
    subscribed: boolean;
    dashboardId?: string;
    lastDateOfSubscription?: string;
}

export type ElementType = "dataElements" | "dashboards" | "visualizations";

export function getDataElementSubscriptionItemId(dataElement: DataElementsSubscriptionItem): string {
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

export function getDashboardSubscriptionItemId(dashboard: DashboardSubscriptionItem): string {
    return [dashboard.id, dashboard.children.map(child => child.id).join("-")].join("-");
}

export function parseDataElementSubscriptionItemId(string: string): DataElementSubscriptionItemIdentifier | undefined {
    const [dataElementId, sectionId] = string.split("-");
    if (!dataElementId || !sectionId) return undefined;

    return { dataElementId, sectionId };
}

export function parseDashboardSubscriptionItemId(string: string): DashboardSubscriptionItemIdentifier | undefined {
    const ids = string.split("-");
    const dashboardId = ids[0];
    const dataElementIds = ids.slice(1, -1);

    if (!dashboardId || !dataElementIds) return undefined;

    return { dashboardId, dataElementIds };
}
