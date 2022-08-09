import { TablePagination, TableSorting, useSnackbar } from "@eyeseetea/d2-ui-components";
import React, { useMemo, useState } from "react";
import i18n from "../../../../locales";
import DoneIcon from "@material-ui/icons/Done";
import { useAppContext } from "../../../contexts/app-context";
import { TableConfig, useObjectsTable } from "../../../components/objects-list/objects-list-hooks";
import { ObjectsList } from "../../../components/objects-list/ObjectsList";
import { getYesNoPartialViewModels, YesNoPartialViewModel } from "../ValidateYesNoPartialnReportViewModel";
import { DataValueItem, parseDataValueItemId } from "../../../../domain/validate-yesnopartial/entities/DataValueItem";
import _ from "lodash";
import { useReload } from "../../../utils/use-reload";
import { useSnackbarOnError } from "../../../utils/snackbar";
import { Sorting } from "../../../../domain/common/entities/PaginatedObjects";
import { getOrgUnitIdsFromPaths } from "../../../../domain/common/entities/OrgUnit";
import { DataValuesFilter } from "./Filters";

export const ValidateYesNoPartialList: React.FC = React.memo(() => {
    const { compositionRoot, config } = useAppContext();
    const snackbar = useSnackbar();

    const [reloadKey, reload] = useReload();
    // eslint-disable-next-line
    const [sorting, setSorting] = React.useState<TableSorting<YesNoPartialViewModel>>();
    // eslint-disable-next-line
    const [filters, setFilters] = useState(() => getEmptyDataValuesFilter());

    const baseConfig: TableConfig<YesNoPartialViewModel> = useMemo(
        () => ({
            columns: [
                { name: "ou_name", text: i18n.t("Org unit"), sortable: true },
                { name: "ou_uid", text: i18n.t("Org unit uid"), sortable: true },
                { name: "de_name", text: i18n.t("DataElement"), sortable: true },
                { name: "de_uid", text: i18n.t("DataElement uid"), sortable: true },
                { name: "yes", text: i18n.t("Yes"), sortable: true },
                { name: "no", text: i18n.t("No"), sortable: true },
                { name: "partial", text: i18n.t("Partial"), sortable: true },
                { name: "period", text: i18n.t("period"), sortable: true },
                { name: "count", text: i18n.t("count"), sortable: true },
            ],
            actions: [
                {
                    name: "yes",
                    text: i18n.t("Yes"),
                    icon: <DoneIcon />,
                    multiple: true,
                    onClick: async (selectedIds: string[]) => {
                        const items = _.compact(selectedIds.map(item => parseDataValueItemId(item)));
                        if (items.length === 0) return;

                        const result = await compositionRoot.validateYesNoPartial.push(items, "yes");
                        if (!result) snackbar.error(i18n.t("Error when trying to complete data set"));

                        reload();
                    },
                    isActive: (rows: any) => _.every(rows, true),
                },
                {
                    name: "no",
                    text: i18n.t("No"),
                    icon: <DoneIcon />,
                    multiple: true,
                    onClick: async (selectedIds: string[]) => {
                        const items = _.compact(selectedIds.map(item => parseDataValueItemId(item)));
                        if (items.length === 0) return;

                        const result = await compositionRoot.validateYesNoPartial.push(items, "no");
                        if (!result) snackbar.error(i18n.t("Error when trying to incomplete data set"));

                        reload();
                    },
                    isActive: rows => _.every(rows, true),
                },
                {
                    name: "approve",
                    text: i18n.t("Approve"),
                    icon: <DoneIcon />,
                    multiple: true,
                    onClick: async (selectedIds: string[]) => {
                        const items = _.compact(selectedIds.map(item => parseDataValueItemId(item)));
                        if (items.length === 0) return;

                        const result = await compositionRoot.validateYesNoPartial.push(items, "partial");
                        if (!result) snackbar.error(i18n.t("Error when trying to approve data set"));

                        reload();
                    },
                    isActive: rows => _.every(rows, true),
                },
            ],
            initialSorting: {
                field: "id" as const,
                order: "asc" as const,
            },
            paginationOptions: {
                pageSizeOptions: [10, 20, 50],
                pageSizeInitialValue: 10,
            },
        }),
        // eslint-disable-next-line
        [compositionRoot, reloadKey, snackbar]
    );

    const getRows = useMemo(
        () => async (paging: TablePagination, sorting: TableSorting<YesNoPartialViewModel>) => {
            const { pager, objects } = await compositionRoot.validateYesNoPartial.get({
                config,
                paging: { page: paging.page, pageSize: paging.pageSize },
                sorting: getSortingFromTableSorting(sorting),
                ...getUseCaseOptions(filters),
            });
            setSorting(sorting);
            return {
                objects: getYesNoPartialViewModels(objects),
                pager,
            };
        },
        [config, compositionRoot, filters]
    );

    function getSortingFromTableSorting(sorting: TableSorting<YesNoPartialViewModel>): Sorting<DataValueItem> {
        return {
            field: sorting.field === "id" ? "ou_uid" : sorting.field,
            direction: sorting.order,
        };
    }

    function getUseCaseOptions(filter: DataValuesFilter) {
        return {
            ...filter,
            orgUnitIds: getOrgUnitIdsFromPaths(filter.orgUnitPaths),
        };
    }

    function getEmptyDataValuesFilter(): DataValuesFilter {
        return {
            orgUnitPaths: [],
            periods: [],
        };
    }
    /*     const getRows = React.useMemo(
        () => async (paging: TablePagination, sorting: TableSorting<DataCommentsViewModel>) => {
            const { pager, objects } = await compositionRoot.dataComments.get({
                config,
                paging: { page: paging.page, pageSize: paging.pageSize },
                sorting: getSortingFromTableSorting(sorting),
                ...getUseCaseOptions(filters),
            });
            setSorting(sorting);
            return { pager, objects: getDataCommentsViews(config, objects) };
        },
        [config, compositionRoot, filters]
    ); */

    /*     const saveReorderedColumns = useCallback(
        async (columnKeys: Array<keyof YesNoPartialViewModel>) => {
            await compositionRoot.dataApproval.saveColumns(columnKeys);
        },
        [compositionRoot, visibleColumns]
    );
 */

    /*     useEffect(() => {
        compositionRoot.validateYesNoPartial.get(
            config
            //                 sorting: getSortingFromTableSorting(sorting),
        );
    }, [compositionRoot]); */

    const getRowsWithSnackbarOrError = useSnackbarOnError(getRows);
    const tableProps = useObjectsTable(baseConfig, getRowsWithSnackbarOrError);
    //const tableProps = useObjectsTable(baseConfig, getRows);

    /*     const columnsToShow = useMemo<TableColumn<YesNoPartialViewModel>[]>(() => {
        if (!visibleColumns || _.isEmpty(visibleColumns)) return tableProps.columns;

        const indexes = _(visibleColumns)
            .map((columnName, idx) => [columnName, idx] as [string, number])
            .fromPairs()
            .value();

        return _(tableProps.columns)
            .map(column => ({ ...column, hidden: !visibleColumns.includes(column.name) }))
            .sortBy(column => indexes[column.name] || 0)
            .value();
    }, [tableProps.columns, visibleColumns]); */
    /* 
    const filterOptions = useMemo(() => getFilterOptions(config), [config]);

    useEffect(() => {
        compositionRoot.dataApproval.getColumns().then(columns => setVisibleColumns(columns));
    }, [compositionRoot]); */

    return <ObjectsList<YesNoPartialViewModel> {...tableProps} columns={tableProps.columns}></ObjectsList>;
});
