import React, { useCallback, useEffect, useMemo, useState } from "react";
import { DataSubmissionViewModel, getDataSubmissionViews } from "../DataSubmissionViewModel";
import {
    ObjectsList,
    TableColumn,
    TableConfig,
    TablePagination,
    TableSorting,
    useObjectsTable,
} from "@eyeseetea/d2-ui-components";
import i18n from "../../../../locales";
import { useAppContext } from "../../../contexts/app-context";
import { useReload } from "../../../utils/use-reload";
import { GLASSDataSubmissionItem } from "../../../../domain/reports/glass-data-submission/entities/GLASSDataSubmissionItem";
import { Sorting } from "../../../../domain/common/entities/PaginatedObjects";
import { Namespaces } from "../../../../data/common/clients/storage/Namespaces";
import _ from "lodash";

export const DataSubmissionList: React.FC = React.memo(() => {
    const { compositionRoot, config } = useAppContext();
    const [reloadKey, _reload] = useReload();

    const [visibleColumns, setVisibleColumns] = useState<string[]>();

    useEffect(() => {
        compositionRoot.glassDataSubmission.getColumns(Namespaces.DATA_SUBMISSSIONS_USER_COLUMNS).then(columns => {
            setVisibleColumns(columns);
        });
    }, [compositionRoot]);

    const baseConfig: TableConfig<DataSubmissionViewModel> = useMemo(
        () => ({
            columns: [
                { name: "orgUnit", text: i18n.t("Country"), sortable: true },
                { name: "period", text: i18n.t("Year"), sortable: true },
                { name: "id", text: i18n.t("Id"), sortable: true },
                { name: "module", text: i18n.t("Module"), sortable: true },
                { name: "status", text: i18n.t("Status"), sortable: true },
            ],
            actions: [],
            initialSorting: {
                field: "orgUnit" as const,
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
        () => async (_search: string, paging: TablePagination, sorting: TableSorting<DataSubmissionViewModel>) => {
            const { pager, objects } = await compositionRoot.glassDataSubmission.get(
                {
                    config,
                    paging: { page: paging.page, pageSize: paging.pageSize },
                    sorting: getSortingFromTableSorting(sorting),
                },
                Namespaces.DATA_SUBMISSSIONS
            );

            console.debug("Reloading", reloadKey);

            return { pager, objects: getDataSubmissionViews(config, objects) };
        },
        [compositionRoot.glassDataSubmission, config, reloadKey]
    );

    const saveReorderedColumns = useCallback(
        async (columnKeys: Array<keyof DataSubmissionViewModel>) => {
            if (!visibleColumns) return;

            await compositionRoot.glassDataSubmission.saveColumns(
                Namespaces.DATA_SUBMISSSIONS_USER_COLUMNS,
                columnKeys
            );
        },
        [compositionRoot, visibleColumns]
    );

    const tableProps = useObjectsTable<DataSubmissionViewModel>(baseConfig, getRows);

    const columnsToShow = useMemo<TableColumn<DataSubmissionViewModel>[]>(() => {
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
        <ObjectsList<DataSubmissionViewModel>
            {...tableProps}
            columns={columnsToShow}
            onChangeSearch={undefined}
            onReorderColumns={saveReorderedColumns}
        />
    );
});

export function getSortingFromTableSorting(
    sorting: TableSorting<DataSubmissionViewModel>
): Sorting<GLASSDataSubmissionItem> {
    return {
        field: sorting.field === "id" ? "period" : sorting.field,
        direction: sorting.order,
    };
}
