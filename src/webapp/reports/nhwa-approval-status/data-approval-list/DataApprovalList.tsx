import {
    ObjectsList,
    TableColumn,
    TableConfig,
    TablePagination,
    TableSorting,
    useObjectsTable,
    useSnackbar,
} from "@eyeseetea/d2-ui-components";
import DoneIcon from "@material-ui/icons/Done";
import DoneAllIcon from "@material-ui/icons/DoneAll";
import _ from "lodash";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { sortByName } from "../../../../domain/common/entities/Base";
import { Config } from "../../../../domain/common/entities/Config";
import { getOrgUnitIdsFromPaths } from "../../../../domain/common/entities/OrgUnit";
import { Sorting } from "../../../../domain/common/entities/PaginatedObjects";
import { DataApprovalItem } from "../../../../domain/nhwa-approval-status/entities/DataApprovalItem";
import i18n from "../../../../locales";
import { useAppContext } from "../../../contexts/app-context";
import { useReload } from "../../../utils/use-reload";
import { DataApprovalViewModel, getDataApprovalViews } from "../DataApprovalViewModel";
import { DataSetsFilter, Filters } from "./Filters";

export const DataApprovalList: React.FC = React.memo(() => {
    const { compositionRoot, config } = useAppContext();
    const snackbar = useSnackbar();

    const [filters, setFilters] = useState(() => getEmptyDataValuesFilter(config));
    const [visibleColumns, setVisibleColumns] = useState<string[]>();
    const [reloadKey, reload] = useReload();

    const getDataApprovalItems = useCallback(
        async (selectedIds: string[]): Promise<DataApprovalItem[]> => {
            const dataSetIds = [],
                periods = [],
                orgUnitIds = [];

            for (const selectedId of selectedIds) {
                const [dataSetUid, period, orgUnitUid] = selectedId.split("-");

                dataSetIds.push(dataSetUid ?? "");
                periods.push(period ?? "");
                orgUnitIds.push(orgUnitUid ?? "");
            }

            return (
                await compositionRoot.dataApproval.get({
                    config,
                    paging: { page: 1, pageSize: selectedIds.length },
                    sorting: { field: "dataSetUid", direction: "asc" },
                    ...getUseCaseOptions(filters),
                    dataSetIds,
                    periods,
                    orgUnitIds,
                })
            ).objects;
        },
        [compositionRoot, config, filters]
    );

    const baseConfig: TableConfig<DataApprovalViewModel> = useMemo(
        () => ({
            columns: [
                { name: "dataSet", text: i18n.t("Data set"), sortable: true },
                { name: "orgUnit", text: i18n.t("Organisation unit"), sortable: true },
                { name: "period", text: i18n.t("Period"), sortable: true },
                { name: "dataSet", text: i18n.t("Data set"), sortable: true },
                { name: "attribute", text: i18n.t("Attribute"), sortable: true, hidden: true },
                {
                    name: "completed",
                    text: i18n.t("Completion status"),
                    sortable: true,
                    getValue: row => (row.completed ? "Completed" : "Not completed"),
                },
                {
                    name: "validated",
                    text: i18n.t("Approval status"),
                    sortable: true,
                    getValue: row => (row.validated ? "Approved" : "Ready for approval"),
                },
                { name: "lastUpdatedValue", text: i18n.t("Last updated value"), sortable: true },
            ],
            actions: [
                {
                    name: "complete",
                    text: i18n.t("Complete"),
                    icon: <DoneIcon />,
                    multiple: true,
                    onClick: async (selectedIds: string[]) => {
                        if (selectedIds.length === 0) return;

                        const dataApprovalItems = await getDataApprovalItems(selectedIds);
                        const completed = await compositionRoot.dataApproval.complete(dataApprovalItems);

                        if (!completed) {
                            return snackbar.error(i18n.t("Error when trying to complete data set"));
                        }

                        reload();
                    },
                },
                {
                    name: "approve",
                    text: i18n.t("Approve"),
                    icon: <DoneAllIcon />,
                    multiple: true,
                    onClick: async (selectedIds: string[]) => {
                        if (selectedIds.length === 0) return;

                        const dataApprovalItems = await getDataApprovalItems(selectedIds);
                        const approved = await compositionRoot.dataApproval.approve(dataApprovalItems);

                        if (!approved) {
                            return snackbar.error(i18n.t("Error when trying to complete data set"));
                        }

                        reload();
                    },
                },
            ],
            initialSorting: {
                field: "dataSet" as const,
                order: "asc" as const,
            },
            paginationOptions: {
                pageSizeOptions: [10, 20, 50],
                pageSizeInitialValue: 10,
            },
        }),
        [getDataApprovalItems, compositionRoot, reload, snackbar]
    );

    const getRows = useMemo(
        () => async (_search: string, paging: TablePagination, sorting: TableSorting<DataApprovalViewModel>) => {
            const { pager, objects } = await compositionRoot.dataApproval.get({
                config,
                paging: { page: paging.page, pageSize: paging.pageSize },
                sorting: getSortingFromTableSorting(sorting),
                ...getUseCaseOptions(filters),
            });

            console.debug("Reloading", reloadKey);

            return { pager, objects: getDataApprovalViews(config, objects) };
        },
        [config, compositionRoot, filters, reloadKey]
    );

    const saveReorderedColumns = useCallback(
        async (columnKeys: Array<keyof DataApprovalViewModel>) => {
            if (!visibleColumns) return;

            await compositionRoot.dataApproval.saveColumns(columnKeys);
        },
        [compositionRoot, visibleColumns]
    );

    const tableProps = useObjectsTable(baseConfig, getRows);

    const columnsToShow = useMemo<TableColumn<DataApprovalViewModel>[]>(() => {
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

    const filterOptions = useMemo(() => getFilterOptions(config), [config]);

    useEffect(() => {
        compositionRoot.dataApproval.getColumns().then(columns => setVisibleColumns(columns));
    }, [compositionRoot]);

    return (
        <ObjectsList<DataApprovalViewModel>
            {...tableProps}
            columns={columnsToShow}
            onChangeSearch={undefined}
            onReorderColumns={saveReorderedColumns}
        >
            <Filters values={filters} options={filterOptions} onChange={setFilters} />
        </ObjectsList>
    );
});

function getUseCaseOptions(filter: DataSetsFilter) {
    return {
        ...filter,
        orgUnitIds: getOrgUnitIdsFromPaths(filter.orgUnitPaths),
    };
}

function getSortingFromTableSorting(sorting: TableSorting<DataApprovalViewModel>): Sorting<DataApprovalItem> {
    return {
        field: sorting.field === "id" ? "period" : sorting.field,
        direction: sorting.order,
    };
}

function getFilterOptions(config: Config) {
    return {
        dataSets: sortByName(_.values(config.dataSets)),
        periods: config.years,
        approvalWorkflow: config.approvalWorkflow,
    };
}

function getEmptyDataValuesFilter(_config: Config): DataSetsFilter {
    return {
        dataSetIds: [],
        orgUnitPaths: [],
        periods: [],
        completionStatus: undefined,
        approvalStatus: undefined,
    };
}
