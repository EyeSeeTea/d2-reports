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
    ChildrenDataElements,
    DashboardSubscriptionItem,
    DataElementsSubscriptionItem,
    SubscriptionStatus,
} from "../../../domain/reports/mal-data-subscription/entities/MalDataSubscriptionItem";
import {
    MalDataSubscriptionOptions,
    MalDataSubscriptionRepository,
} from "../../../domain/reports/mal-data-subscription/repositories/MalDataSubscriptionRepository";
import { Namespaces } from "../../common/clients/storage/Namespaces";

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
        const { config, elementType, dataElementIds, subscriptionStatus, sections, sorting, paging } = options;
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

        const items: Array<DataElementsSubscriptionItem> = rows
            .map(
                (item): DataElementsSubscriptionItem => ({
                    dataElementName: item.dataelementname,
                    subscription: Boolean(item.subscription),
                    sectionName: item.sectionname,
                    sectionId: item.sectionuid,
                    dataElementId: item.dataelementuid,
                    lastDateOfSubscription: item.lastdateofsubscription,
                })
            )
            .filter(row => (subscriptionStatus === "Subscribed") === row.subscription);

        return { pager, objects: items };
    }

    async getChildrenDataElements(options: MalDataSubscriptionOptions) {
        const { dashboardSorting, subscriptionStatus, dataElementGroups, elementType, paging } = options;
        if (!dashboardSorting) return { pager: { page: 1, pageCount: 1, pageSize: 10, total: 1 }, objects: [] };

        const subscriptionValues =
            (await this.globalStorageClient.getObject<SubscriptionStatus[]>(Namespaces.MAL_SUBSCRIPTION_STATUS)) ?? [];

        const { dataElements } = await this.api
            .get<{ dataElements: ChildrenDataElements[] }>(
                "/dataElements?fields=id,name,dataElementGroups[id,name]&paging=false"
            )
            .getData();

        if (elementType === "dashboards") {
            const { dashboards } = await this.api
                .get<{
                    dashboards: {
                        id: string;
                        name: string;
                        dashboardItems: {
                            visualization: {
                                dataDimensionItems:
                                    | {
                                          indicator: { numerator: string; denominator: string } | undefined;
                                      }[]
                                    | undefined;
                            };
                        }[];
                    }[];
                    pager: Pager;
                }>(
                    "/dashboards?fields=id,name,dashboardItems[visualization[dataDimensionItems[indicator[id,name,numerator,denominator]]]]"
                )
                .getData();

            const dataElementsInDashboard: Record<string, ChildrenDataElements[]>[] = dashboards.map(dashboard => {
                const indicatorVariables = _(dashboard.dashboardItems)
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

                const dataElementsWithGroups = _.filter(dataElements, dataElement =>
                    dataElementIds.includes(dataElement.id)
                );

                return _({
                    dataElementsWithGroups,
                })
                    .keyBy(_item => dashboard.id)
                    .value();
            });

            const rows: Array<DashboardSubscriptionItem> = dashboards
                .map(dashboard => {
                    const subscriptionValue = subscriptionValues.find(
                        subscriptionValue =>
                            dashboard.id === subscriptionValue.dashboardId && subscriptionValue.subscribed
                    );

                    const children: ChildrenDataElements[] = (
                        findArrayValueById(dashboard.id, dataElementsInDashboard) ?? []
                    ).map(child => {
                        return {
                            ...child,
                            subscription: subscriptionValues.find(
                                subscription => subscription.dataElementId === child.id
                            )?.subscribed
                                ? "Subscribed"
                                : "Not Subscribed",
                            lastDateOfSubscription:
                                subscriptionValues.find(subscription => subscription.dataElementId === child.id)
                                    ?.lastDateOfSubscription ?? "",
                        };
                    });

                    const subscribedElements = _.intersection(
                        subscriptionValues.map(subscription => subscription.dataElementId),
                        children.map(child => child.id)
                    ).length;

                    const subscription =
                        subscribedElements !== 0 && subscribedElements !== children.length
                            ? "Subscribed to some elements"
                            : subscribedElements === children.length && subscriptionValue
                            ? "Subscribed"
                            : "Not Subscribed";

                    return {
                        ...dashboard,
                        children,
                        subscribedElements,
                        subscription,
                        lastDateOfSubscription:
                            _.maxBy(
                                children.map(child => child.lastDateOfSubscription),
                                dateString => new Date(dateString).getTime()
                            ) ?? "",
                    };
                })
                .filter(row =>
                    (!subscriptionStatus
                        ? row
                        : subscriptionStatus === "Subscribed"
                        ? row.subscription === "Subscribed" || row.subscription === "Subscribed to some elements"
                        : row.subscription === "Not Subscribed") && _.isEmpty(dataElementGroups)
                        ? row
                        : _.intersection(
                              dataElementGroups,
                              _.flattenDeep(
                                  row.children.map(child => child.dataElementGroups.map(deGroup => deGroup.id))
                              )
                          ).length > 0
                );

            const objects = _(rows)
                .orderBy([row => row[dashboardSorting.field]], [dashboardSorting.direction])
                .drop((paging.page - 1) * paging.pageSize)
                .take(paging.pageSize)
                .value();

            const pager: Pager = {
                page: paging.page,
                pageSize: paging.pageSize,
                pageCount: Math.ceil(rows.length / paging.pageSize),
                total: rows.length,
            };

            return { pager, objects };
        } else if (elementType === "visualizations") {
            const { visualizations } = await this.api
                .get<{
                    visualizations: {
                        id: string;
                        name: string;
                        dataDimensionItems:
                            | {
                                  indicator: { numerator: string; denominator: string } | undefined;
                              }[]
                            | undefined;
                    }[];
                    pager: Pager;
                }>("/visualizations?fields=id,name,dataDimensionItems[indicator[id,name,numerator,denominator]]")
                .getData();

            const dataElementsInVisualization: Record<string, ChildrenDataElements[]>[] = visualizations.map(
                visualization => {
                    const indicatorVariables = _(
                        visualization.dataDimensionItems?.map(dimensionItem => [
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

                    const dataElementsWithGroups = _.filter(dataElements, dataElement =>
                        dataElementIds.includes(dataElement.id)
                    );

                    return _({
                        dataElementsWithGroups,
                    })
                        .keyBy(_item => visualization.id)
                        .value();
                }
            );

            const rows: Array<DashboardSubscriptionItem> = visualizations
                .map(visualization => {
                    const subscriptionValue = subscriptionValues.find(
                        subscriptionValue =>
                            visualization.id === subscriptionValue.dashboardId && subscriptionValue.subscribed
                    );

                    const children: ChildrenDataElements[] = (
                        findArrayValueById(visualization.id, dataElementsInVisualization) ?? []
                    ).map(child => {
                        return {
                            ...child,
                            subscription: subscriptionValues.find(
                                subscription => subscription.dataElementId === child.id
                            )?.subscribed
                                ? "Subscribed"
                                : "Not Subscribed",
                            lastDateOfSubscription:
                                subscriptionValues.find(subscription => subscription.dataElementId === child.id)
                                    ?.lastDateOfSubscription ?? "",
                        };
                    });

                    const subscribedElements = _.intersection(
                        subscriptionValues.map(subscription => subscription.dataElementId),
                        children.map(child => child.id)
                    ).length;

                    const subscription =
                        subscribedElements !== 0 && subscribedElements !== children.length
                            ? "Subscribed to some elements"
                            : subscribedElements === children.length && subscriptionValue
                            ? "Subscribed"
                            : "Not subscribed";

                    return {
                        ...visualization,
                        children,
                        subscribedElements,
                        subscription,
                        lastDateOfSubscription:
                            _.maxBy(
                                children.map(child => child.lastDateOfSubscription),
                                dateString => new Date(dateString).getTime()
                            ) ?? "",
                    };
                })
                .filter(row =>
                    (!subscriptionStatus
                        ? row
                        : subscriptionStatus === "Subscribed"
                        ? row.subscription === "Subscribed" || row.subscription === "Subscribed to some elements"
                        : row.subscription === "Not Subscribed") && _.isEmpty(dataElementGroups)
                        ? row
                        : _.intersection(
                              dataElementGroups,
                              _.flattenDeep(
                                  row.children.map(child => child.dataElementGroups.map(deGroup => deGroup.id))
                              )
                          ).length > 0
                );

            const objects = _(rows)
                .orderBy([row => row[dashboardSorting.field]], [dashboardSorting.direction])
                .drop((paging.page - 1) * paging.pageSize)
                .take(paging.pageSize)
                .value();

            const pager: Pager = {
                page: paging.page,
                pageSize: paging.pageSize,
                pageCount: Math.ceil(rows.length / paging.pageSize),
                total: rows.length,
            };

            return { pager, objects };
        } else {
            return { pager: { page: 1, pageCount: 1, pageSize: 10, total: 1 }, objects: [] };
        }
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

function findArrayValueById(id: string, record: Record<string, ChildrenDataElements[]>[]) {
    const entry = _.find(record, obj => id in obj);
    return entry ? entry[id] : [];
}
