import _ from "lodash";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Sorting } from "../../../../domain/common/entities/PaginatedObjects";
import i18n from "../../../../locales";
import { useAppContext } from "../../../contexts/app-context";
import { useReload } from "../../../utils/use-reload";
import { getTwoFactorMonitoringViews, TwoFactorViewModel } from "./TwoFactorViewModel";
import { Namespaces } from "../../../../data/common/clients/storage/Namespaces";
import { MonitoringTwoFactorUser } from "../../../../domain/reports/twofactor-monitoring/entities/MonitoringTwoFactorUser";
import {
    ObjectsList,
    TableColumn,
    TableConfig,
    TableGlobalAction,
    TablePagination,
    TableSorting,
    useObjectsTable,
} from "@eyeseetea/d2-ui-components";

export const TwoFactorMonitorList: React.FC = React.memo(() => {
    const { compositionRoot, config } = useAppContext();
    const [visibleColumns, setVisibleColumns] = useState<string[]>();
    const [sorting, setSorting] = React.useState<TableSorting<TwoFactorViewModel>>();
    useReload();
    const baseConfig: TableConfig<TwoFactorViewModel> = useMemo(
        () => ({
            columns: [
                { name: "id", text: i18n.t("uid"), sortable: true },
                { name: "name", text: i18n.t("Name"), sortable: true },
                { name: "username", text: i18n.t("Username"), sortable: true },
                { name: "externalAuth", text: i18n.t("External auth"), sortable: true },
                { name: "twoFA", text: i18n.t("TwoFA"), sortable: true },
                { name: "email", text: i18n.t("Email"), sortable: true, hidden: true },
                { name: "disabled", text: i18n.t("Disabled"), sortable: true, hidden: true },
            ],
            actions: [],
            initialSorting: {
                field: "id" as const,
                order: "asc" as const,
            },
            paginationOptions: {
                pageSizeOptions: [10, 20, 50],
                pageSizeInitialValue: 10,
            },
        }),
        []
    );
    const getRowsList = React.useMemo(
        () => async (_search: string, paging: TablePagination, sorting: TableSorting<TwoFactorViewModel>) => {
            const { pager, objects } = await compositionRoot.user2fa.get(Namespaces.USER_2FA, {
                paging: { page: paging.page, pageSize: paging.pageSize },
                sorting: getSortingFromTableSorting(sorting),
                ...filters,
            });

            setSorting(sorting);
            return { pager, objects: getTwoFactorMonitoringViews(objects) };
        },
        [compositionRoot.user2fa, filters, reloadKey]
    );

    const tableProps = useObjectsTable<TwoFactorViewModel>(baseConfig, getRowsList);

    function getSortingFromTableSorting(sorting: TableSorting<TwoFactorViewModel>): Sorting<MonitoringTwoFactorUser> {
        return {
            field: sorting.field === "id" ? "username" : sorting.field,
            direction: sorting.order,
        };
    }

    const saveReorderedColumns = useCallback(
        async (columnKeys: Array<keyof TwoFactorViewModel>) => {
            if (!visibleColumns) return;

            await compositionRoot.user2fa.saveColumns(columnKeys);
        },
        [compositionRoot, visibleColumns]
    );

    const columnsToShow = useMemo<TableColumn<TwoFactorViewModel>[]>(() => {
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

    useEffect(() => {
        compositionRoot.dataApproval.getColumns().then(columns => setVisibleColumns(columns));
    }, [compositionRoot]);

    return (
        <ObjectsList<TwoFactorViewModel>
            {...tableProps}
            columns={columnsToShow}
            onReorderColumns={saveReorderedColumns}
            onChangeSearch={value => {
                setUsernameQuery(value);
                setFilters({ ...filters, usernameQuery: value });
            }}
            globalActions={[downloadCsv]}
        >
            <Filters values={filters} options={filterOptions} onChange={setFilters} />
        </ObjectsList>
    );
});
