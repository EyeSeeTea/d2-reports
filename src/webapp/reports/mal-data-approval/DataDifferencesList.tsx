import {
    ObjectsList,
    TableColumn,
    TableConfig,
    TablePagination,
    TableSorting,
    useObjectsTable,
    useSnackbar,
} from "@eyeseetea/d2-ui-components";
import _ from "lodash";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Namespaces } from "../../../data/common/clients/storage/Namespaces";
import { parseDataDiffItemId } from "../../../domain/reports/mal-data-approval/entities/DataDiffItem";

import i18n from "../../../locales";
import { useAppContext } from "../../contexts/app-context";
import { getSortingFromTableSorting } from "./data-approval-list/DataApprovalList";
import { DataApprovalViewModel } from "./DataApprovalViewModel";
import { DataDiffViewModel, getDataDiffViews } from "./DataDiffViewModel";
import { ThumbUp } from "@material-ui/icons";
import { parseDataDuplicationItemId } from "../../../domain/reports/mal-data-approval/entities/MalDataApprovalItem";

interface DataDifferencesListProps {
    selectedIds: string[];
    revoke: boolean;
    isMalAdmin: boolean;
    isUpdated: () => void;
}

export const DataDifferencesList: React.FC<DataDifferencesListProps> = ({ selectedIds, revoke, isMalAdmin, isUpdated }) => {
    const { compositionRoot, config } = useAppContext();
    const [visibleColumns, setVisibleColumns] = useState<string[]>();
    const snackbar = useSnackbar();

    const baseConfig: TableConfig<DataDiffViewModel> = useMemo(
        () => ({
            columns: [
                { name: "dataElement", text: i18n.t("Data Element"), sortable: true },
                { name: "value", text: i18n.t("Value entered"), sortable: false },
                { name: "comment", text: i18n.t("Comment"), sortable: false },
                { name: "apvdValue", text: i18n.t("Approved value"), sortable: false },
                { name: "apvdComment", text: i18n.t("Approved value comment"), sortable: false },
            ],
            actions: [
                {
                    name: "approve_value",
                    text: i18n.t("Approve value"),
                    icon: <ThumbUp />,
                    multiple: true,
                    onClick: async (selectedIds: string[]) => {
                        const items = _.compact(selectedIds.map(item => parseDataDiffItemId(item)));
                        if (items.length === 0) return;

                        const result = await compositionRoot.malDataApproval.duplicateValue(items, revoke);
                        if (!result) snackbar.error(i18n.t("Error when trying to approve data values"));

                        isUpdated();
                    },
                    isActive: () => isMalAdmin,
                },
            ],
            initialSorting: {
                field: "dataElement" as const,
                order: "asc" as const,
            },
            paginationOptions: {
                pageSizeOptions: [10, 20, 50],
                pageSizeInitialValue: 10,
            },
        }),
        [compositionRoot.malDataApproval, isMalAdmin, isUpdated, revoke, snackbar]
    );

    const getRows = useMemo(
        () => async (_search: string, paging: TablePagination, sorting: TableSorting<DataApprovalViewModel>) => {
            const items = _.compact(selectedIds.map(item => parseDataDuplicationItemId(item)));
            if (items.length === 0) return;

            const { pager, objects } = await compositionRoot.malDataApproval.getDiff({
                config,
                paging: { page: paging.page, pageSize: paging.pageSize },
                sorting: getSortingFromTableSorting(sorting),
                periods: items.map(item => item.period),
                orgUnitIds: items.map(item => item.orgUnit),
                dataSetIds: items.map(item => item.dataSet),
            });

            if (!pager || !objects) snackbar.error(i18n.t("Error when trying to check difference in data values"));

            return { pager, objects: getDataDiffViews(config, objects) };
        },
        [compositionRoot.malDataApproval, config, selectedIds, snackbar]
    );

    // @ts-ignore
    const tableProps = useObjectsTable(baseConfig, getRows);

    const saveReorderedColumns = useCallback(
        async (columnKeys: Array<keyof DataDiffViewModel>) => {
            await compositionRoot.malDataApproval.saveColumns(Namespaces.MAL_DIFF_STATUS_USER_COLUMNS, columnKeys);
        },
        [compositionRoot]
    );

    const columnsToShow = useMemo<TableColumn<DataDiffViewModel>[]>(() => {
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
        compositionRoot.malDataApproval.getColumns(Namespaces.MAL_DIFF_STATUS_USER_COLUMNS).then(columns => {
            columns = columns.length ? columns : ["dataElement", "value", "comment", "apvdValue", "apvdComment"];
            setVisibleColumns(columns);
        });
    }, [compositionRoot]);

    return (
        <ObjectsList<DataDiffViewModel>
            {...tableProps}
            columns={columnsToShow}
            onChangeSearch={undefined}
            onReorderColumns={saveReorderedColumns}
        ></ObjectsList>
    );
};
