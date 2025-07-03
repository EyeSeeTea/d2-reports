import { D2Api, MetadataPick } from "@eyeseetea/d2-api/2.36";
import { DataElementSubscription } from "../../../domain/reports/mal-data-subscription/entities/DataElementSubscription";
import {
    DataElementSubscriptionOptions,
    DataElementSubscriptionRepository,
} from "../../../domain/reports/mal-data-subscription/repositories/DataElementSubscriptionRepository";
import { paginate, PaginatedObjects } from "../../../domain/common/entities/PaginatedObjects";
import _ from "lodash";

export class DataElementSubscriptionD2Repository implements DataElementSubscriptionRepository {
    constructor(private api: D2Api) {}

    async get(options: DataElementSubscriptionOptions): Promise<PaginatedObjects<DataElementSubscription>> {
        const { sorting, paging } = options;

        const filter = this.getDataElementFilter(options);
        const d2DataElements = await this.getD2DataElements(options, filter);
        const rows = this.mapD2DataElementsToSubscription(d2DataElements);
        const { objects, pager } = paginate(rows, paging, sorting);

        return { objects: objects, pager: pager };
    }

    private getDataElementFilter(options: DataElementSubscriptionOptions): Filter {
        const { dataElementGroups, sections } = options;

        return {
            name: {
                ilike: "apvd",
            },
            "dataElementGroups.id": {
                in: dataElementGroups,
            },
            "dataSetElements.dataSet.sections.id": {
                in: sections,
            },
        };
    }

    async getAll(): Promise<DataElementSubscription[]> {
        const { objects: d2DataElements } = await this.api.models.dataElements
            .get({
                fields: dataElementFields,
                paging: false,
            })
            .getData();

        return this.mapD2DataElementsToSubscription(d2DataElements);
    }

    private mapD2DataElementsToSubscription(dataElements: D2DataElement[]): DataElementSubscription[] {
        return dataElements.map(dataElement => {
            const section = dataElement.dataSetElements
                .flatMap(dataSetElement => dataSetElement.dataSet.sections)
                .find(section => _.some(section.dataElements, { id: dataElement.id }));

            return {
                dataElement: dataElement,
                section: section,
                dataElementGroups: dataElement.dataElementGroups,
            };
        });
    }

    private async getD2DataElements(
        options: DataElementSubscriptionOptions,
        filter?: Filter
    ): Promise<D2DataElement[]> {
        const { paging } = options;

        const { objects: dataElements } = await this.api.models.dataElements
            .get({
                filter: filter,
                fields: dataElementFields,
                page: paging.page,
                pageSize: paging.pageSize,
            })
            .getData();

        return dataElements;
    }
}

export const dataElementFields = {
    id: true,
    name: true,
    code: true,
    dataElementGroups: {
        id: true,
        name: true,
    },
    dataSetElements: {
        dataSet: {
            id: true,
            name: true,
            sections: {
                id: true,
                name: true,
                dataElements: {
                    id: true,
                },
            },
        },
    },
} as const;

export type D2DataElement = MetadataPick<{
    dataElements: { fields: typeof dataElementFields };
}>["dataElements"][number];

type Filter = Record<string, object>;
