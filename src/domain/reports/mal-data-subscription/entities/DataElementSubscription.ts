import _ from "lodash";
import { Maybe } from "../../../../types/utils";
import { Id } from "../../../common/entities/Base";
import { NamedRef } from "../../../common/entities/Ref";
import {
    DataElementSubscriptionReport,
    SubscriptionWithChildrenReport,
} from "../usecases/GetSubscriptionReportUseCase";

export type DataElementSubscription = {
    dataElementId: Id;
    dataElementName: string;
    dataElementCode: Maybe<string>;
    dataSetName: string;
    dataElementGroups: NamedRef[];
    section: Maybe<NamedRef>;
};

const reportTypes = ["dataElements", "dashboards", "visualizations"] as const;

export type SubscriptionReportType = typeof reportTypes[number];

export type SubscriptionFilterOptions = {
    reportType: SubscriptionReportType;
    dataElementGroups: NamedRef[];
    sections: NamedRef[];
};

export type SubscriptionItemIdentifier = {
    dataElementId: Id;
    sectionId: Maybe<Id>;
};

export type SubscriptionWithChildrenItemIdentifier = { dashboardId: Id; dataElementIds: Id[] };

export function getSubscriptionItemId(report: DataElementSubscriptionReport): string {
    return [report.dataElementId, report.section?.id].join("-");
}

export function getSubscriptionWithChildrenItemId(
    type: "dashboards" | "visualizations",
    report: SubscriptionWithChildrenReport
): string {
    return [[type, report.id].join("-"), report.children.map(child => child.dataElementId).join("-")].join("-");
}

export function parseSubscriptionItemId(string: string): Maybe<SubscriptionItemIdentifier> {
    const [dataElementId, sectionId] = string.split("-");
    if (!dataElementId) return undefined;

    return { dataElementId, sectionId: sectionId };
}

export function parseSubscriptionWithChildrenItemId(string: string): Maybe<SubscriptionWithChildrenItemIdentifier> {
    const ids = string.split("-");
    const dashboardId = _.first(ids) === "dashboard" ? ids[1] : "";
    const dataElementIds = _.first(ids) === "dashboard" ? ids.slice(2) : ids;

    if (dashboardId === undefined || !dataElementIds) return undefined;

    return { dashboardId, dataElementIds };
}
