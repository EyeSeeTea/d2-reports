import _ from "lodash";
import { D2Api, Pager } from "../../../types/d2-api";
import { promiseMap } from "../../../utils/promises";
import { DataStoreStorageClient } from "../../common/clients/storage/DataStoreStorageClient";
import { StorageClient } from "../../common/clients/storage/StorageClient";
import { Instance } from "../../common/entities/Instance";
import {
    ChildrenDataElements,
    DashboardSubscriptionItem,
    DataElementsSubscriptionItem,
    MalSubscriptionPaginatedObjects,
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

type dataSetElementsType = { dataElement: NamedRef };

export class MalDataSubscriptionDefaultRepository implements MalDataSubscriptionRepository {
    private storageClient: StorageClient;
    private globalStorageClient: StorageClient;

    constructor(private api: D2Api) {
        const instance = new Instance({ url: this.api.baseUrl });
        this.storageClient = new DataStoreStorageClient("user", instance);
        this.globalStorageClient = new DataStoreStorageClient("global", instance);
    }

    async get(
        options: MalDataSubscriptionOptions
    ): Promise<MalSubscriptionPaginatedObjects<DataElementsSubscriptionItem>> {
        const {
            dataElementGroups: dataElementGroupIds,
            subscriptionStatus,
            sections: sectionIds,
            sorting,
            paging,
        } = options;
        if (!sorting)
            return {
                pager: { page: 1, pageCount: 1, pageSize: 10, total: 1 },
                objects: [],
                totalRows: [],
            };

        const subscriptionValues =
            (await this.globalStorageClient.getObject<SubscriptionStatus[]>(Namespaces.MAL_SUBSCRIPTION_STATUS)) ?? [];

        const { dataElements } = await this.api
            .get<{
                dataElements: {
                    id: string;
                    name: string;
                    dataElementGroups: NamedRef[];
                    dataSetElements: {
                        dataSet: {
                            id: string;
                            name: string;
                            sections: { id: string; name: string; dataElements: { id: string }[] }[];
                        };
                    }[];
                }[];
            }>(
                `/dataElements?filter=name:ilike:apvd&fields=id,name,dataElementGroups[id,name],dataSetElements[dataSet[id,name,sections[id,name,dataElements]]]&paging=false`
            )
            .getData();

        const rows = dataElements
            .map(dataElement => {
                const subscriptionValue = subscriptionValues.find(
                    subscription => subscription.dataElementId === dataElement.id
                );

                const section: NamedRef | undefined = _.chain(dataElement.dataSetElements)
                    .flatMap("dataSet.sections")
                    .find(section => _.some(section.dataElements, { id: dataElement.id }))
                    .value();

                return {
                    dataElementId: dataElement.id,
                    dataElementName: dataElement.name,
                    subscription: !!subscriptionValue?.subscribed,
                    lastDateOfSubscription: subscriptionValue?.lastDateOfSubscription ?? "",
                    section,
                    dataElementGroups: dataElement.dataElementGroups,
                };
            })
            .filter(row => {
                const isSubscribed = !!(!subscriptionStatus
                    ? row
                    : (subscriptionStatus === "Subscribed") === row.subscription);
                const isInSection = !!(_.isEmpty(sectionIds) ? row : _.includes(sectionIds, row.section?.id));
                const isInDataElementGroup = !!(_.isEmpty(dataElementGroupIds)
                    ? row
                    : _.intersection(
                          dataElementGroupIds,
                          row.dataElementGroups.map(dataElementGroup => dataElementGroup.id)
                      ).length > 0);

                return isSubscribed && isInSection && isInDataElementGroup;
            });

        const sections = _(rows)
            .map(row => row.section)
            .compact()
            .uniqBy("id")
            .value();

        const dataElementGroups = _(rows)
            .flatMap(row => row.dataElementGroups)
            .uniqBy("id")
            .value();

        const objects = _(rows)
            .orderBy([row => row[sorting.field]], [sorting.direction])
            .drop((paging.page - 1) * paging.pageSize)
            .take(paging.pageSize)
            .value();

        const pager: Pager = {
            page: paging.page,
            pageSize: paging.pageSize,
            pageCount: Math.ceil(rows.length / paging.pageSize),
            total: rows.length,
        };

        return { pager, objects, sections, dataElementGroups, totalRows: rows };
    }

    async getChildrenDataElements(
        options: MalDataSubscriptionOptions
    ): Promise<MalSubscriptionPaginatedObjects<DashboardSubscriptionItem>> {
        const { dashboardSorting, subscriptionStatus, elementType, paging } = options;
        if (!dashboardSorting)
            return { pager: { page: 1, pageCount: 1, pageSize: 10, total: 1 }, objects: [], totalRows: [] };

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
                        subscriptionValues
                            .filter(subscription => subscription.subscribed)
                            .map(subscription => subscription.dataElementId),
                        children.map(child => child.id)
                    ).length;

                    const subscription =
                        subscribedElements !== 0 && subscribedElements !== children.length
                            ? "Subscribed to some elements"
                            : subscribedElements !== 0 && subscribedElements === children.length
                            ? "Subscribed"
                            : "Not Subscribed";

                    return {
                        ...dashboard,
                        children,
                        subscribedElements: !_.isEmpty(children)
                            ? `${subscribedElements} / ${children.length}`
                            : String(subscribedElements),
                        subscription,
                        lastDateOfSubscription:
                            _.maxBy(
                                children.map(child => child.lastDateOfSubscription),
                                dateString => new Date(dateString).getTime()
                            ) ?? "",
                    };
                })
                .filter(row => (!subscriptionStatus ? row : subscriptionStatus === row.subscription));

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

            return { pager, objects, totalRows: rows };
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
                        subscriptionValues
                            .filter(subscription => subscription.subscribed)
                            .map(subscription => subscription.dataElementId),
                        children.map(child => child.id)
                    ).length;

                    const subscription =
                        subscribedElements !== 0 && subscribedElements !== children.length
                            ? "Subscribed to some elements"
                            : subscribedElements !== 0 && subscribedElements === children.length
                            ? "Subscribed"
                            : "Not subscribed";

                    return {
                        ...visualization,
                        children,
                        subscribedElements: !_.isEmpty(children)
                            ? `${subscribedElements} / ${children.length}`
                            : String(subscribedElements),
                        subscription,
                        lastDateOfSubscription:
                            _.maxBy(
                                children.map(child => child.lastDateOfSubscription),
                                dateString => new Date(dateString).getTime()
                            ) ?? "",
                    };
                })
                .filter(row => (!subscriptionStatus ? row : subscriptionStatus === row.subscription));

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

            return { pager, objects, totalRows: rows };
        } else {
            return { pager: { page: 1, pageCount: 1, pageSize: 10, total: 1 }, objects: [], totalRows: [] };
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

            const dataSetElements: NamedRef[] = dataSetData.dataSetElements.map(item => item.dataElement);

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

function findArrayValueById(id: string, record: Record<string, ChildrenDataElements[]>[]) {
    const entry = _.find(record, obj => id in obj);
    return entry ? entry[id] : [];
}
