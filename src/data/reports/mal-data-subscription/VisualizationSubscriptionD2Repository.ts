import { D2Api } from "../../../types/d2-api";
import { D2Dashboard } from "./DashboardSubscriptionD2Repository";
import {
    VisualizationSubscriptionOptions,
    VisualizationSubscriptionRepository,
} from "../../../domain/reports/mal-data-subscription/repositories/VisualizationSubscriptionRepository";
import { VisualizationSubscription } from "../../../domain/reports/mal-data-subscription/entities/DashboardSubscription";
import { D2DataElement, dataElementFields } from "./DataElementSubscriptionD2Repository";
import { getDataElementsInParent } from "./utils/DataSubscriptionMapper";

export class VisualizationD2SubscriptionRepository implements VisualizationSubscriptionRepository {
    constructor(private api: D2Api) {}

    async get(options: VisualizationSubscriptionOptions): Promise<VisualizationSubscription[]> {
        const visualizations = await this.getD2Visualizations(options);
        const dataElements = await this.getD2DataElements(options);

        return visualizations.map(visualization =>
            getDataElementsInParent({ type: "visualizations", entity: visualization, dataElements: dataElements })
        );
    }

    private async getD2Visualizations(options: VisualizationSubscriptionOptions): Promise<D2Visualization[]> {
        const { paging } = options;
        const { objects: d2Visualizations } = await this.api.models.visualizations
            .get({
                fields: visualizationFields,
                page: paging.page,
                pageSize: paging.pageSize,
            })
            .getData();

        return d2Visualizations;
    }

    private async getD2DataElements(options: VisualizationSubscriptionOptions): Promise<D2DataElement[]> {
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

export const visualizationFields = {
    id: true,
    name: true,
    dataDimensionItems: {
        indicator: {
            numerator: true,
            denominator: true,
        },
    },
} as const;

export type D2Visualization = D2Dashboard["dashboardItems"][number]["visualization"];
