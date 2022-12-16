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
import { Config } from "../../../../domain/common/entities/Config";
import { Sorting } from "../../../../domain/common/entities/PaginatedObjects";
import { MalDataSubscriptionItem } from "../../../../domain/reports/mal-data-subscription/entities/MalDataSubscriptionItem";
import i18n from "../../../../locales";
import { useAppContext } from "../../../contexts/app-context";
import { useReload } from "../../../utils/use-reload";
import { DataSubscriptionViewModel, getDataSubscriptionViews } from "../DataSubscriptionViewModel";
import { Namespaces } from "../../../../data/common/clients/storage/Namespaces";

interface DataSetsFilter {
    dataElementNames: string[];
    sectionNames: string[];
    lastDateOfSubscription: string[];
}

export const DataSubscriptionList: React.FC = React.memo(() => {
    const { compositionRoot, config } = useAppContext();

    const [filters, _setFilters] = useState(() => getEmptyDataValuesFilter(config));
    const [visibleColumns, setVisibleColumns] = useState<string[]>();
    const [reloadKey] = useReload();

    useEffect(() => {
        compositionRoot.malDataSubscription.getColumns(Namespaces.MAL_APPROVAL_STATUS_USER_COLUMNS).then(columns => {
            setVisibleColumns(columns);
        });
    }, [compositionRoot]);

    const baseConfig: TableConfig<DataSubscriptionViewModel> = useMemo(
        () => ({
            columns: [
                { name: "dataElementName", text: i18n.t("Data Element"), sortable: true },
                { name: "subscription", text: i18n.t("Subscription status"), sortable: true },
                { name: "sectionName", text: i18n.t("Sections"), sortable: true },
                {
                    name: "lastDateOfSubscription",
                    text: i18n.t("Last Date of Subscription"),
                    sortable: true,
                    hidden: true,
                },
            ],
            actions: [],
            initialSorting: {
                field: "dataElementName" as const,
                order: "asc" as const,
            },
            paginationOptions: {
                pageSizeOptions: [10, 20, 50],
                pageSizeInitialValue: 10,
            },
        }),
        []
    );

    const getRows = useMemo(
        () => async (_search: string, paging: TablePagination, sorting: TableSorting<DataSubscriptionViewModel>) => {
            const { pager, objects } = await compositionRoot.malDataSubscription.get({
                config,
                paging: { page: paging.page, pageSize: paging.pageSize },
                sorting: getSortingFromTableSorting(sorting),
                ...filters,
            });

            console.debug("Reloading", reloadKey);
            return { pager, objects: getDataSubscriptionViews(config, objects) };
        },
        [config, compositionRoot, filters, reloadKey]
    );

    const saveReorderedColumns = useCallback(
        async (columnKeys: Array<keyof DataSubscriptionViewModel>) => {
            if (!visibleColumns) return;

            await compositionRoot.malDataSubscription.saveColumns(
                Namespaces.MAL_APPROVAL_STATUS_USER_COLUMNS,
                columnKeys
            );
        },
        [compositionRoot, visibleColumns]
    );

    const tableProps = useObjectsTable(baseConfig, getRows);

    const columnsToShow = useMemo<TableColumn<DataSubscriptionViewModel>[]>(() => {
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

    return (
        <ObjectsList<DataSubscriptionViewModel>
            {...tableProps}
            columns={columnsToShow}
            onChangeSearch={undefined}
            onReorderColumns={saveReorderedColumns}
        />
    );
});

function getSortingFromTableSorting(
    sorting: TableSorting<DataSubscriptionViewModel>
): Sorting<MalDataSubscriptionItem> {
    return {
        field: sorting.field === "id" ? "dataElementName" : sorting.field,
        direction: sorting.order,
    };
}

function getEmptyDataValuesFilter(_config: Config): DataSetsFilter {
    return {
        dataElementNames: [],
        sectionNames: [],
        lastDateOfSubscription: [],
    };
}
