import { D2Api, MetadataPick } from "@eyeseetea/d2-api/2.36";
import { paginate, PaginatedObjects } from "../../../domain/common/entities/PaginatedObjects";
import { DashboardSubscription } from "../../../domain/reports/mal-data-subscription/entities/DashboardSubscription";
import {
    DashboardSubscriptionOptions,
    DashboardSubscriptionRepository,
} from "../../../domain/reports/mal-data-subscription/repositories/DashboardSubscriptionRepository";
import { D2DataElement, dataElementFields } from "./DataElementSubscriptionD2Repository";
import _ from "lodash";
import { mapD2DataElementsToSubscription } from "./utils/DataSubscriptionMapper";

export class DashboardSubscriptionD2Repository implements DashboardSubscriptionRepository {
    constructor(private api: D2Api) {}

    async get(options: DashboardSubscriptionOptions): Promise<PaginatedObjects<DashboardSubscription>> {
        const { sorting, paging } = options;

        const dashboards = await this.getD2Dashboards(options);
        const dataElements = await this.getD2DataElements(options);
        const rows = dashboards.map(dashboard => getDataElementsInParent(dashboard, dataElements));
        const { objects, pager } = paginate(rows, paging, sorting);

        return { pager, objects };
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
        visualization: {
            dataDimensionItems: {
                indicator: {
                    id: true,
                    name: true,
                    numerator: true,
                    denominator: true,
                },
            },
        },
    },
} as const;

type D2Dashboard = MetadataPick<{
    dashboards: { fields: typeof dashboardFields };
}>["dashboards"][number];

type D2DataDimensionItem = {
    indicator: {
        numerator: string;
        denominator: string;
    };
};

function getDataElementsInParent(parent: D2Dashboard, dataElements: D2DataElement[]): DashboardSubscription {
    const dataDimensionItems = _(parent.dashboardItems)
        .map(item => item.visualization.dataDimensionItems as D2DataDimensionItem[]) // ? is this right, dataDimensionItems is unknown[]
        .flattenDeep()
        .compact()
        .value();

    const indicatorVariables = _(dataDimensionItems)
        .map(dimensionItem => [dimensionItem.indicator?.numerator, dimensionItem.indicator?.denominator])
        .flattenDeep()
        .compact()
        .value();

    const dataElementVariables = _.uniq(
        _.compact(_.flatMap(indicatorVariables, str => str.match(/#{([a-zA-Z0-9]+)}/g)))
    );

    const dataElementIds = dataElementVariables
        .map(token => token.slice(2, -1))
        .filter(id => /^[a-zA-Z0-9]+$/.test(id));

    const dataElementsWithGroups = _.filter(dataElements, dataElement => dataElementIds.includes(dataElement.id));

    return {
        dashboard: {
            id: parent.id,
            name: parent.name,
        },
        children: mapD2DataElementsToSubscription(dataElementsWithGroups),
    };
}
