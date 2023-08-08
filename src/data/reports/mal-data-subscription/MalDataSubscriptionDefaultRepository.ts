import _ from "lodash";
import { D2Api, Id, Pager, PaginatedObjects } from "../../../types/d2-api";
import { promiseMap } from "../../../utils/promises";
import { DataStoreStorageClient } from "../../common/clients/storage/DataStoreStorageClient";
import { StorageClient } from "../../common/clients/storage/StorageClient";
import { Dhis2SqlViews } from "../../common/Dhis2SqlViews";
import { Instance } from "../../common/entities/Instance";
import { getSqlViewId } from "../../../domain/common/entities/Config";
import { SQL_VIEW_MAL_DATAELEMENTS_NAME } from "../../common/Dhis2ConfigRepository";
import {
    DashboardSubscriptionItem,
    DataElementsSubscriptionItem,
    SubscriptionStatus,
} from "../../../domain/reports/mal-data-subscription/entities/MalDataSubscriptionItem";
import {
    MalDataSubscriptionOptions,
    MalDataSubscriptionRepository,
} from "../../../domain/reports/mal-data-subscription/repositories/MalDataSubscriptionRepository";
import { Namespaces } from "../../common/clients/storage/Namespaces";
import { NamedRef } from "../../../domain/common/entities/Base";

export interface Pagination {
    page: number;
    pageSize: number;
}

export function paginate<Obj>(objects: Obj[], pagination: Pagination) {
    const pager = {
        page: pagination.page,
        pageSize: pagination.pageSize,
        pageCount: Math.ceil(objects.length / pagination.pageSize),
        total: objects.length,
    };
    const { page, pageSize } = pagination;
    const start = (page - 1) * pageSize;

    const paginatedObjects = _(objects)
        .slice(start, start + pageSize)
        .value();

    return { pager: pager, objects: paginatedObjects };
}

interface Variables {
    dataSets: string;
    dataElementId: string;
    sectionId: string;
    elementType: string;
    orderByColumn: SqlField;
    orderByDirection: "asc" | "desc";
}

type dataElementsType = { id: string; name: string };

type dataSetElementsType = { dataElement: dataElementsType };

type SqlField =
    | "dataelementname"
    | "dataelementuid"
    | "sectionname"
    | "sectionuid"
    | "lastdateofsubscription"
    | "subscription";

const fieldMapping: Record<keyof DataElementsSubscriptionItem, SqlField> = {
    dataElementName: "dataelementname",
    dataElementId: "dataelementuid",
    subscription: "subscription",
    sectionName: "sectionname",
    sectionId: "sectionuid",
    lastDateOfSubscription: "lastdateofsubscription",
};

export class MalDataSubscriptionDefaultRepository implements MalDataSubscriptionRepository {
    private storageClient: StorageClient;
    private globalStorageClient: StorageClient;

    constructor(private api: D2Api) {
        const instance = new Instance({ url: this.api.baseUrl });
        this.storageClient = new DataStoreStorageClient("user", instance);
        this.globalStorageClient = new DataStoreStorageClient("global", instance);
    }

    async get(options: MalDataSubscriptionOptions): Promise<PaginatedObjects<DataElementsSubscriptionItem>> {
        const { config, elementType, dataElementIds, sections, sorting, paging } = options;
        if (!sorting) return { pager: { page: 1, pageCount: 1, pageSize: 10, total: 1 }, objects: [] };

        const sqlViews = new Dhis2SqlViews(this.api);
        const allDataSetIds = _.values(config.dataSets).map(ds => ds.id); // ?

        const { pager, rows } = await sqlViews
            .query<Variables, SqlField>(
                getSqlViewId(config, SQL_VIEW_MAL_DATAELEMENTS_NAME),
                {
                    dataSets: sqlViewJoinIds(allDataSetIds),
                    elementType,
                    sectionId: sqlViewJoinIds(sections),
                    dataElementId: sqlViewJoinIds(dataElementIds),
                    orderByColumn: fieldMapping[sorting.field],
                    orderByDirection: sorting.direction,
                },
                paging
            )
            .getData();

        const items: Array<DataElementsSubscriptionItem> = rows.map(
            (item): DataElementsSubscriptionItem => ({
                dataElementName: item.dataelementname,
                subscription: Boolean(item.subscription),
                sectionName: item.sectionname,
                sectionId: item.sectionuid,
                dataElementId: item.dataelementuid,
                lastDateOfSubscription: item.lastdateofsubscription,
            })
        );

        return { pager, objects: items };
    }

    async getDashboardDataElements(options: MalDataSubscriptionOptions) {
        const { dashboardSorting, paging } = options;
        if (!dashboardSorting) return { pager: { page: 1, pageCount: 1, pageSize: 10, total: 1 }, objects: [] };

        const { dashboards } = await this.api
            .get<{ dashboards: NamedRef[]; pager: Pager }>("/dashboards?fields=id,name")
            .getData();

        const objects = dashboards.map(dashboard => ({
            id: dashboard.id,
            name: dashboard.name,
            subscription: false,
            subscribedElements: 1,
            lastDateOfSubscription: "",
            children: [],
        }));

        const pageRows = _(objects)
            .orderBy([row => row[dashboardSorting.field]], [dashboardSorting.direction])
            .drop((paging.page - 1) * paging.pageSize)
            .take(paging.pageSize)
            .value();

        const dataElementsInDashboard: Record<string, NamedRef[]>[] = await promiseMap(pageRows, async row => {
            const { dashboardItems } = await this.api
                .get<{
                    dashboardItems: {
                        visualization: {
                            dataDimensionItems:
                                | {
                                      indicator: { numerator: string; denominator: string } | undefined;
                                  }[]
                                | undefined;
                        };
                    }[];
                }>(
                    `/dashboards/${row.id}?fields=dashboardItems[visualization[dataDimensionItems[indicator[id,name,numerator,denominator]]]]`
                )
                .getData();

            const indicatorVariables = _(dashboardItems)
                .map(item =>
                    item.visualization?.dataDimensionItems?.map(dimensionItem => [
                        dimensionItem.indicator?.numerator,
                        dimensionItem.indicator?.denominator,
                    ])
                )
                .flattenDeep()
                .compact()
                .value();
            const dataElementVariables = _.uniq(
                _.compact(_.flatMap(indicatorVariables, str => str.match(/#{([a-zA-Z0-9]+)}/g)))
            );

            const dataElementIds = dataElementVariables
                .map(token => token.slice(2, -1))
                .filter(id => /^[a-zA-Z0-9]+$/.test(id));
            const dataElements = await promiseMap(dataElementIds, async dataElementId => {
                return await this.api.get<NamedRef>(`/dataElements/${dataElementId}?fields=id,name`).getData();
            });

            return _({
                dataElements,
            })
                .keyBy(_item => row.id)
                .value();
        });

        const rows: Array<DashboardSubscriptionItem> = pageRows.map(row => {
            return {
                ...row,
                children: findArrayValueById(row.id, dataElementsInDashboard) ?? [],
            };
        });

        const pager: Pager = {
            page: paging.page,
            pageSize: paging.pageSize,
            pageCount: Math.ceil(rows.length / paging.pageSize),
            total: rows.length,
        };

        return { pager, objects: rows };
    }

    async getColumns(namespace: string): Promise<string[]> {
        const columns = await this.storageClient.getObject<string[]>(namespace);

        return columns ?? [];
    }

    async saveColumns(namespace: string, columns: string[]): Promise<void> {
        return this.storageClient.saveObject<string[]>(namespace, columns);
    }

    async getSortOrder(): Promise<string[]> {
        const sortOrderArray = await this.storageClient.getObject<string[]>(Namespaces.MAL_DIFF_NAMES_SORT_ORDER);

        return sortOrderArray ?? [];
    }

    async generateSortOrder(): Promise<void> {
        try {
            const dataSetData: {
                dataSetElements: dataSetElementsType[];
                sections: { id: string }[];
            } = await this.api
                .get<any>(`/dataSets/PWCUb3Se1Ie`, { fields: "sections,dataSetElements[dataElement[id,name]]" })
                .getData();

            if (_.isEmpty(dataSetData.sections) || _.isEmpty(dataSetData.dataSetElements)) {
                return this.storageClient.saveObject<string[]>(Namespaces.MAL_DIFF_NAMES_SORT_ORDER, []);
            }

            const dataSetElements: dataElementsType[] = dataSetData.dataSetElements.map(item => item.dataElement);

            const sectionsDEs = await promiseMap(dataSetData.sections, async sections => {
                return this.api.get<any>(`/sections/${sections.id}`, { fields: "dataElements" }).getData();
            });

            const sectionsDEsIds: { id: string }[] = sectionsDEs.flatMap(item => {
                return item.dataElements.map((dataElementId: { id: string }) => {
                    return dataElementId;
                });
            });

            const sortOrderArray: string[] = sectionsDEsIds
                .map(obj =>
                    Object.assign(
                        obj,
                        dataSetElements.find(obj2 => obj.id === obj2.id)
                    )
                )
                .map(item => item.name);

            return this.storageClient.saveObject<string[]>(Namespaces.MAL_DIFF_NAMES_SORT_ORDER, sortOrderArray);
        } catch (error: any) {
            console.debug(error);
        }
    }

    async getSubscription(namespace: string): Promise<any[]> {
        const subscription = await this.globalStorageClient.getObject<SubscriptionStatus[]>(namespace);

        return subscription ?? [];
    }

    async saveSubscription(namespace: string, subscription: SubscriptionStatus[]): Promise<void> {
        return await this.globalStorageClient.saveObject<SubscriptionStatus[]>(namespace, subscription);
    }
}

/* From the docs: "The variables must contain alphanumeric, dash, underscore and
   whitespace characters only.". Use "-" as id separator and also "-" as empty value.
*/
function sqlViewJoinIds(ids: Id[]): string {
    return ids.join("-") || "-";
}

function findArrayValueById(id: string, record: Record<string, NamedRef[]>[]) {
    const entry = _.find(record, obj => id in obj);
    return entry ? entry[id] : [];
}
