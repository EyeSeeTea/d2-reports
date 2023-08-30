import _ from "lodash";
import { PaginatedObjects } from "../../../../types/d2-api";
import { NamedRef } from "../../../common/entities/Base";

export interface DataElementsSubscriptionItem {
    dataElementName: string;
    dataElementId: string;
    section: NamedRef | undefined;
    dataElementGroups: NamedRef[];
    subscription: boolean;
    lastDateOfSubscription: string;
}

export type SubscriptionValue = "Subscribed" | "Not Subscribed" | "Subscribed to some elements";

export interface DashboardSubscriptionItem {
    id: string;
    name: string;
    subscribedElements: string;
    subscription: SubscriptionValue;
    lastDateOfSubscription: string;
    children: ChildrenDataElement[];
}

export interface ChildrenDataElement extends NamedRef {
    dataElementGroups: NamedRef[];
    subscription: SubscriptionValue;
    lastDateOfSubscription: string;
}

export interface DataElementSubscriptionItemIdentifier {
    dataElementId: string;
    sectionId: string | undefined;
    subscription: boolean;
}

export interface DashboardSubscriptionItemIdentifier {
    dashboardId: string;
    dataElementIds: string[];
    subscription: boolean;
}

export interface SubscriptionStatus {
    dataElementId: string;
    subscribed: boolean;
    dashboardId?: string;
    lastDateOfSubscription?: string;
    user: string;
}

export type ElementType = "dataElements" | "dashboards" | "visualizations";

export interface MalSubscriptionPaginatedObjects<T> extends PaginatedObjects<T> {
    sections?: NamedRef[];
    dataElementGroups?: NamedRef[];
    totalRows: T[];
}

export function getDataElementSubscriptionItemId(dataElement: DataElementsSubscriptionItem): string {
    return [dataElement.dataElementId, dataElement.section?.id, dataElement.subscription].join("-");
}

export function getChildrenDataElementSubscriptionItemId(dataElement: ChildrenDataElement): string {
    return [dataElement.id, dataElement.subscription].join("-");
}

export function getDashboardSubscriptionItemId(dashboard: DashboardSubscriptionItem): string {
    return [
        ["dashboard", dashboard.id].join("-"),
        dashboard.children.map(child => child.id).join("-"),
        dashboard.subscription,
    ].join("-");
}

export function parseDataElementSubscriptionItemId(string: string): DataElementSubscriptionItemIdentifier | undefined {
    const [dataElementId, sectionId, subscription] = string.split("-");
    if (!dataElementId) return undefined;

    return { dataElementId, sectionId, subscription: subscription === "true" };
}

export function parseDashboardSubscriptionItemId(string: string): DashboardSubscriptionItemIdentifier | undefined {
    const ids = string.split("-");
    const dashboardId = _.first(ids) === "dashboard" ? ids[1] : "";
    const dataElementIds = _.first(ids) === "dashboard" ? _.slice(ids, 2, ids.length - 1) : _.slice(ids, 0, -1);
    const subscription = _.last(ids) === "true" || _.last(ids) === "Subscribed";

    if (dashboardId === undefined || !dataElementIds) return undefined;

    return { dashboardId, dataElementIds, subscription };
}
