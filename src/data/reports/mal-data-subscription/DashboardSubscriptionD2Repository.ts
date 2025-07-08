import { D2Api, MetadataPick } from "../../../types/d2-api";
import { DashboardSubscription } from "../../../domain/reports/mal-data-subscription/entities/DashboardSubscription";
import {
    DashboardSubscriptionOptions,
    DashboardSubscriptionRepository,
} from "../../../domain/reports/mal-data-subscription/repositories/DashboardSubscriptionRepository";
import { D2DataElement, dataElementFields } from "./DataElementSubscriptionD2Repository";
import { getDataElementsInParent } from "./utils/DataSubscriptionMapper";
import { visualizationFields } from "./VisualizationSubscriptionD2Repository";

export class DashboardSubscriptionD2Repository implements DashboardSubscriptionRepository {
    constructor(private api: D2Api) {}

    async get(options: DashboardSubscriptionOptions): Promise<DashboardSubscription[]> {
        const dashboards = await this.getD2Dashboards(options);
        const dataElements = await this.getD2DataElements(options);

        return dashboards.map(dashboard =>
            getDataElementsInParent({ type: "dashboards", entity: dashboard, dataElements: dataElements })
        );
    }

    private async getD2Dashboards(options: DashboardSubscriptionOptions): Promise<D2Dashboard[]> {
        const { paging } = options;
        const { objects: d2Dashboards } = await this.api.models.dashboards
            .get({
                fields: dashboardFields,
                page: paging.page,
                pageSize: paging.pageSize,
            })
            .getData();

        return d2Dashboards;
    }

    private async getD2DataElements(options: DashboardSubscriptionOptions): Promise<D2DataElement[]> {
        const { paging } = options;

        const { objects: dataElements } = await this.api.models.dataElements
            .get({
                fields: dataElementFields,
                page: paging.page,
                pageSize: paging.pageSize,
            })
            .getData();

        return dataElements;
    }
}

const dashboardFields = {
    id: true,
    name: true,
    dashboardItems: {
        visualization: visualizationFields,
    },
} as const;

export type D2Dashboard = MetadataPick<{
    dashboards: { fields: typeof dashboardFields };
}>["dashboards"][number];

export type D2DataDimensionItem = {
    indicator: {
        numerator: string;
        denominator: string;
    };
};
