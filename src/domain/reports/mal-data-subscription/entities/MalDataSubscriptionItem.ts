import { NamedRef } from "../../../common/entities/Base";

export interface DataElementsSubscriptionItem {
    dataElementName: string;
    dataElementId: string;
    section: NamedRef | undefined;
    dataElementGroups: NamedRef[];
    subscription: boolean;
    lastDateOfSubscription: string;
}

export interface DashboardSubscriptionItem {
    id: string;
    name: string;
    subscribedElements: string;
    subscription: string;
    lastDateOfSubscription: string;
    children: ChildrenDataElements[];
}

export interface ChildrenDataElements extends NamedRef {
    dataElementGroups: NamedRef[];
    subscribed: string;
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
    return [dataElement.dataElementId, dataElement.section?.id].join("-");
}

export function getDashboardSubscriptionItemId(dashboard: DashboardSubscriptionItem): string {
    return [["dashboard", dashboard.id].join("-"), dashboard.children.map(child => child.id).join("-")].join("-");
}

export function parseDataElementSubscriptionItemId(string: string): DataElementSubscriptionItemIdentifier | undefined {
    const [dataElementId, sectionId] = string.split("-");
    if (!dataElementId || !sectionId) return undefined;

    return { dataElementId, sectionId };
}

export function parseDashboardSubscriptionItemId(string: string): DashboardSubscriptionItemIdentifier | undefined {
    const ids = string.split("-");
    const dashboardId = ids[0] === "dashboard" ? ids[1] : "";
    const dataElementIds = ids[0] === "dashboard" ? ids.slice(2) : ids;

    if (dashboardId === undefined || !dataElementIds) return undefined;

    return { dashboardId, dataElementIds };
}
