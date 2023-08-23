import {
    ObjectsList,
    TableColumn,
    TableConfig,
    TablePagination,
    TableSorting,
    useObjectsTable,
} from "@eyeseetea/d2-ui-components";
import _ from "lodash";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import DoneIcon from "@material-ui/icons/Done";
import { Config } from "../../../../domain/common/entities/Config";
import { Sorting } from "../../../../domain/common/entities/PaginatedObjects";
import {
    DashboardSubscriptionItem,
    DataElementsSubscriptionItem,
    SubscriptionStatus,
    parseDashboardSubscriptionItemId,
    parseDataElementSubscriptionItemId,
} from "../../../../domain/reports/mal-data-subscription/entities/MalDataSubscriptionItem";
import i18n from "../../../../locales";
import { useAppContext } from "../../../contexts/app-context";
import { useReload } from "../../../utils/use-reload";
import {
    DashboardSubscriptionViewModel,
    DataElementSubscriptionViewModel,
    getDashboardSubscriptionViews,
    getDataElementSubscriptionViews,
} from "../DataSubscriptionViewModel";
import { Namespaces } from "../../../../data/common/clients/storage/Namespaces";
import { DataSubscriptionFilter, Filters } from "./Filters";
import { NamedRef } from "../../../../domain/common/entities/Base";

export const DataSubscriptionList: React.FC = React.memo(() => {
    const { compositionRoot, config } = useAppContext();

    const [filters, setFilters] = useState(() => getEmptyDataValuesFilter(config));
    const [visibleColumns, setVisibleColumns] = useState<string[]>();
    const [visibleDashboardColumns, setVisibleDashboardColumns] = useState<string[]>();
    const [dataElementGroups, setDataElementGroups] = useState<NamedRef[]>([]);
    const [sections, setSections] = useState<NamedRef[]>([]);
    const [subscription, setSubscription] = useState<SubscriptionStatus[]>([]);
    const [reloadKey, reload] = useReload();

    useEffect(() => {
        async function getSubscriptionValues() {
            compositionRoot.malDataSubscription
                .getSubscription(Namespaces.MAL_SUBSCRIPTION_STATUS)
                .then(subscriptionValues => {
                    subscriptionValues = subscriptionValues.length ? subscriptionValues : [];
                    setSubscription(subscriptionValues);
                });
        }
        getSubscriptionValues();
    }, [compositionRoot.malDataApproval, compositionRoot.malDataSubscription]);

    useEffect(() => {
        compositionRoot.malDataSubscription
            .getColumns(Namespaces.MAL_SUBSCRIPTION_STATUS_USER_COLUMNS)
            .then(columns => {
                setVisibleColumns(columns);
            });

        compositionRoot.malDataSubscription
            .getColumns(Namespaces.MAL_DASHBOARD_SUBSCRIPTION_USER_COLUMNS)
            .then(columns => {
                setVisibleDashboardColumns(columns);
            });
    }, [compositionRoot.malDataSubscription]);

    const baseConfig: TableConfig<DataElementSubscriptionViewModel> = useMemo(
        () => ({
            columns: [
                { name: "dataElementName", text: i18n.t("Data Element"), sortable: true },
                {
                    name: "subscription",
                    text: i18n.t("Subscription status"),
                    sortable: true,
                    getValue: row => (row.subscription ? "Subscribed" : "Not subscribed"),
                },
                { name: "sectionName", text: i18n.t("Sections"), sortable: true },
                {
                    name: "lastDateOfSubscription",
                    text: i18n.t("Last Date of Subscription"),
                    sortable: true,
                    hidden: true,
                },
            ],
            actions: [
                {
                    name: "subscribe",
                    text: i18n.t("Subscribe"),
                    icon: <DoneIcon />,
                    multiple: true,
                    onClick: async (selectedIds: string[]) => {
                        const items = _.compact(selectedIds.map(item => parseDataElementSubscriptionItemId(item)));
                        if (items.length === 0) return;

                        const subscriptionValues = items.map(item => {
                            return {
                                dataElementId: item.dataElementId,
                                subscribed: true,
                                lastDateOfSubscription: new Date().toISOString(),
                            };
                        });

                        await compositionRoot.malDataSubscription.saveSubscription(
                            Namespaces.MAL_SUBSCRIPTION_STATUS,
                            combineSubscriptionValues(subscription, subscriptionValues)
                        );

                        reload();
                    },
                    isActive: rows => _.every(rows, row => !row.subscription),
                },
                {
                    name: "unsubscribe",
                    text: i18n.t("Unsubscribe"),
                    icon: <DoneIcon />,
                    multiple: true,
                    onClick: async (selectedIds: string[]) => {
                        const items = _.compact(selectedIds.map(item => parseDataElementSubscriptionItemId(item)));
                        if (items.length === 0) return;

                        const subscriptionValues = items.map(item => {
                            return {
                                dataElementId: item.dataElementId,
                                subscribed: false,
                                lastDateOfSubscription: new Date().toISOString(),
                            };
                        });

                        await compositionRoot.malDataSubscription.saveSubscription(
                            Namespaces.MAL_SUBSCRIPTION_STATUS,
                            combineSubscriptionValues(subscription, subscriptionValues)
                        );

                        reload();
                    },
                    isActive: rows => _.every(rows, row => row.subscription),
                },
            ],
            initialSorting: {
                field: "dataElementName" as const,
                order: "asc" as const,
            },
            paginationOptions: {
                pageSizeOptions: [10, 20, 50],
                pageSizeInitialValue: 10,
            },
        }),
        [compositionRoot.malDataSubscription, reload, subscription]
    );

    const dashboardBaseConfig: TableConfig<DashboardSubscriptionViewModel> = useMemo(
        () => ({
            columns: [
                {
                    name: "name",
                    text: i18n.t(filters.elementType === "dashboards" ? "Dashboard" : "Visualization"),
                    sortable: true,
                },
                {
                    name: "subscription",
                    text: i18n.t("Subscription status"),
                },
                {
                    name: "subscribedElements",
                    text: i18n.t("Subscribed raw elements"),
                },
                {
                    name: "lastDateOfSubscription",
                    text: i18n.t("Last Date of Subscription"),
                    hidden: true,
                },
            ],
            actions: [
                {
                    name: "subscribe",
                    text: i18n.t("Subscribe"),
                    icon: <DoneIcon />,
                    multiple: true,
                    onClick: async (selectedIds: string[]) => {
                        const items = _.compact(selectedIds.map(item => parseDashboardSubscriptionItemId(item)));
                        if (items.length === 0) return;

                        const subscriptionValues = items.flatMap(item =>
                            item.dataElementIds.map(dataElementId => {
                                return {
                                    dataElementId,
                                    lastDateOfSubscription: new Date().toISOString(),
                                    subscribed: true,
                                };
                            })
                        );

                        await compositionRoot.malDataSubscription.saveSubscription(
                            Namespaces.MAL_SUBSCRIPTION_STATUS,
                            combineSubscriptionValues(subscription, subscriptionValues)
                        );

                        reload();
                    },
                    isActive: rows =>
                        _.every(
                            rows,
                            row =>
                                ((row.subscription === "Not Subscribed" ||
                                    row.subscription === "Subscribed to some elements") &&
                                    !_.isEmpty(row.children)) ||
                                (row.subscription === "Not Subscribed" && row.id.split("-")[0] !== "dashboard")
                        ),
                },
                {
                    name: "unsubscribe",
                    text: i18n.t("Unsubscribe"),
                    icon: <DoneIcon />,
                    multiple: true,
                    onClick: async (selectedIds: string[]) => {
                        const items = _.compact(selectedIds.map(item => parseDashboardSubscriptionItemId(item)));
                        if (items.length === 0) return;

                        const subscriptionValues = items.flatMap(item =>
                            item.dataElementIds.map(dataElementId => {
                                return {
                                    dataElementId,
                                    lastDateOfSubscription: new Date().toISOString(),
                                    subscribed: false,
                                };
                            })
                        );

                        await compositionRoot.malDataSubscription.saveSubscription(
                            Namespaces.MAL_SUBSCRIPTION_STATUS,
                            combineSubscriptionValues(subscription, subscriptionValues)
                        );

                        reload();
                    },
                    isActive: rows =>
                        _.every(
                            rows,
                            row =>
                                ((row.subscription === "Subscribed" ||
                                    row.subscription === "Subscribed to some elements") &&
                                    !_.isEmpty(row.children)) ||
                                (row.subscription === "Subscribed" && row.id.split("-")[0] !== "dashboard")
                        ),
                },
            ],
            initialSorting: {
                field: "name" as const,
                order: "asc" as const,
            },
            paginationOptions: {
                pageSizeOptions: [10, 20, 50],
                pageSizeInitialValue: 10,
            },
        }),
        [compositionRoot.malDataSubscription, filters.elementType, reload, subscription]
    );

    const getRows = useMemo(
        () =>
            async (
                _search: string,
                paging: TablePagination,
                sorting: TableSorting<DataElementSubscriptionViewModel>
            ) => {
                const { pager, objects } = await compositionRoot.malDataSubscription.get({
                    config,
                    paging: { page: paging.page, pageSize: paging.pageSize },
                    sorting: getSortingFromTableSorting(sorting),
                    ...filters,
                });

                const sections = _.uniqBy(
                    objects.map(object => {
                        return { id: object.sectionId, name: object.sectionName };
                    }),
                    "id"
                );

                setSections(sections);

                console.debug("Reloading", reloadKey);
                return { pager, objects: getDataElementSubscriptionViews(config, objects) };
            },
        [compositionRoot.malDataSubscription, config, filters, reloadKey]
    );

    const getDashboardRows = useMemo(
        () =>
            async (_search: string, paging: TablePagination, sorting: TableSorting<DashboardSubscriptionViewModel>) => {
                const { pager, objects } = await compositionRoot.malDataSubscription.getDashboardDataElements({
                    config,
                    paging: { page: paging.page, pageSize: paging.pageSize },
                    dashboardSorting: getSortingFromDashboardTableSorting(sorting),
                    ...filters,
                });

                const dataElementGroups = _(objects)
                    .map(object => object.children.map(child => child.dataElementGroups))
                    .flattenDeep()
                    .uniqWith(_.isEqual)
                    .value();

                setDataElementGroups(dataElementGroups);

                console.debug("Reloading", reloadKey);
                return { pager, objects: getDashboardSubscriptionViews(config, objects) };
            },
        [compositionRoot.malDataSubscription, config, filters, reloadKey]
    );

    const saveReorderedColumns = useCallback(
        async (columnKeys: Array<keyof DataElementSubscriptionViewModel>) => {
            if (!visibleColumns) return;

            await compositionRoot.malDataSubscription.saveColumns(
                Namespaces.MAL_SUBSCRIPTION_STATUS_USER_COLUMNS,
                columnKeys
            );
        },
        [compositionRoot.malDataSubscription, visibleColumns]
    );

    const saveReorderedDashboardColumns = useCallback(
        async (columnKeys: Array<keyof DashboardSubscriptionViewModel>) => {
            if (!visibleDashboardColumns) return;

            await compositionRoot.malDataSubscription.saveColumns(
                Namespaces.MAL_DASHBOARD_SUBSCRIPTION_USER_COLUMNS,
                columnKeys
            );
        },
        [compositionRoot.malDataSubscription, visibleDashboardColumns]
    );

    const tableProps = useObjectsTable(baseConfig, getRows);
    const dashboardTableProps = useObjectsTable(dashboardBaseConfig, getDashboardRows);

    const columnsToShow = useMemo<TableColumn<DataElementSubscriptionViewModel>[]>(() => {
        if (!visibleColumns || _.isEmpty(visibleColumns)) return tableProps.columns;

        const indexes = _(visibleColumns)
            .map((columnName, idx) => [columnName, idx] as [string, number])
            .fromPairs()
            .value();

        return _(tableProps.columns)
            .map(column => ({ ...column, hidden: !visibleColumns.includes(column.name) }))
            .sortBy(column => indexes[column.name] || 0)
            .value();
    }, [tableProps.columns, visibleColumns]);

    const dashboardColumnsToShow = useMemo<TableColumn<DashboardSubscriptionViewModel>[]>(() => {
        if (!visibleDashboardColumns || _.isEmpty(visibleDashboardColumns)) return dashboardTableProps.columns;

        const indexes = _(visibleDashboardColumns)
            .map((columnName, idx) => [columnName, idx] as [string, number])
            .fromPairs()
            .value();

        return _(dashboardTableProps.columns)
            .map(column => ({ ...column, hidden: !visibleDashboardColumns.includes(column.name) }))
            .sortBy(column => indexes[column.name] || 0)
            .value();
    }, [dashboardTableProps.columns, visibleDashboardColumns]);

    const getFilterOptions = useCallback(
        (_config: Config) => {
            return {
                sections,
                dataElementGroups,
                subscription: ["Subscribed", "Not Subscribed"],
            };
        },
        [sections, dataElementGroups]
    );

    const filterOptions = React.useMemo(() => getFilterOptions(config), [config, getFilterOptions]);

    function combineSubscriptionValues(
        initialSubscriptionValues: SubscriptionStatus[],
        addedSubscriptionValues: SubscriptionStatus[]
    ): SubscriptionStatus[] {
        const combinedSubscriptionValues = addedSubscriptionValues.map(added => {
            return initialSubscriptionValues.filter(initial => initial.dataElementId !== added.dataElementId);
        });
        const combinedSubscription = _.union(_.intersection(...combinedSubscriptionValues), addedSubscriptionValues);
        setSubscription(combinedSubscription);

        return _.union(combinedSubscription);
    }

    return (
        <>
            {filters.elementType === "dataElements" ? (
                <ObjectsList<DataElementSubscriptionViewModel>
                    {...tableProps}
                    columns={columnsToShow}
                    onChangeSearch={undefined}
                    onReorderColumns={saveReorderedColumns}
                >
                    <Filters values={filters} options={filterOptions} onChange={setFilters} />
                </ObjectsList>
            ) : (
                <ObjectsList<DashboardSubscriptionViewModel>
                    {...dashboardTableProps}
                    columns={dashboardColumnsToShow}
                    onChangeSearch={undefined}
                    onReorderColumns={saveReorderedDashboardColumns}
                    childrenKeys={["children"]}
                >
                    <Filters values={filters} options={filterOptions} onChange={setFilters} />
                </ObjectsList>
            )}
        </>
    );
});

function getSortingFromTableSorting(
    sorting: TableSorting<DataElementSubscriptionViewModel>
): Sorting<DataElementsSubscriptionItem> {
    return {
        field: sorting.field === "id" ? "dataElementName" : sorting.field,
        direction: sorting.order,
    };
}

function getSortingFromDashboardTableSorting(
    sorting: TableSorting<DashboardSubscriptionViewModel>
): Sorting<DashboardSubscriptionItem> {
    return {
        field: sorting.field === "id" ? "name" : sorting.field,
        direction: sorting.order,
    };
}

function getEmptyDataValuesFilter(_config: Config): DataSubscriptionFilter {
    return {
        sections: [],
        dataElementIds: [],
        elementType: "dataElements",
        dataElementGroups: [],
        subscriptionStatus: undefined,
    };
}
