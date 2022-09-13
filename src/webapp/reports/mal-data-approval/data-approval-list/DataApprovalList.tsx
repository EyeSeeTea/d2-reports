import {
    ObjectsList,
    TableColumn,
    TableConfig,
    TablePagination,
    TableSorting,
    useObjectsTable,
    useSnackbar,
} from "@eyeseetea/d2-ui-components";
import ClearAllIcon from "@material-ui/icons/ClearAll";
import DoneIcon from "@material-ui/icons/Done";
import DoneAllIcon from "@material-ui/icons/DoneAll";
import RemoveIcon from "@material-ui/icons/Remove";
import _ from "lodash";
import { format } from "date-fns";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { sortByName } from "../../../../domain/common/entities/Base";
import { Config } from "../../../../domain/common/entities/Config";
import { getOrgUnitIdsFromPaths } from "../../../../domain/common/entities/OrgUnit";
import { Sorting } from "../../../../domain/common/entities/PaginatedObjects";
import {
    MalDataApprovalItem,
    parseDataDuplicationItemId,
} from "../../../../domain/reports/mal-data-approval/entities/MalDataApprovalItem";
import i18n from "../../../../locales";
import { useAppContext } from "../../../contexts/app-context";
import { ConfirmationDialog } from "@eyeseetea/d2-ui-components";
import { useBooleanState } from "../../../utils/use-boolean";
import { useReload } from "../../../utils/use-reload";
import { DataApprovalViewModel, getDataApprovalViews } from "../DataApprovalViewModel";
import { DataSetsFilter, Filters } from "./Filters";
import { DataDifferencesList } from "../DataDifferencesList";
import { PlaylistAddCheck, ThumbUp } from "@material-ui/icons";
import { Namespaces } from "../../../../data/common/clients/storage/Namespaces";

export const DataApprovalList: React.FC = React.memo(() => {
    const { compositionRoot, config } = useAppContext();
    const { currentUser } = config;
    const [isDialogOpen, { enable: openDialog, disable: closeDialog }] = useBooleanState(false);
    const snackbar = useSnackbar();

    const isMalApprover =
        _.intersection(
            currentUser.userGroups.map(userGroup => userGroup.name),
            ["MAL_Country Approver"]
        ).length > 0;

    const isMalAdmin =
        _.intersection(
            currentUser.userGroups.map(userGroup => userGroup.name),
            ["MAL_Malaria admin"]
        ).length > 0;

    const [filters, setFilters] = useState(() => getEmptyDataValuesFilter(config));
    const [selected, setSelected] = useState<string[]>([""]);
    const [visibleColumns, setVisibleColumns] = useState<string[]>();
    const [reloadKey, reload] = useReload();

    const selectablePeriods = React.useMemo(() => {
        const currentYear = new Date().getFullYear();
        return _.range(currentYear - 5, currentYear).map(n => n.toString());
    }, []);

    const baseConfig: TableConfig<DataApprovalViewModel> = useMemo(
        () => ({
            columns: [
                { name: "orgUnit", text: i18n.t("Organisation unit"), sortable: true },
                { name: "period", text: i18n.t("Period"), sortable: true },
                { name: "dataSet", text: i18n.t("Data set"), sortable: true, hidden: true },
                { name: "attribute", text: i18n.t("Attribute"), sortable: true, hidden: true },
                {
                    name: "completed",
                    text: i18n.t("Completion status"),
                    sortable: true,
                    getValue: row => (row.completed ? "Completed" : "Not completed"),
                },
                {
                    name: "validated",
                    text: i18n.t("Submission status"),
                    sortable: true,
                    getValue: row =>
                        row.validated ? "Submitted" : row.completed ? "Ready for submission" : "Not completed",
                },
                { name: "modificationCount", text: i18n.t("Modification Count"), sortable: true },
                {
                    name: "lastUpdatedValue",
                    text: i18n.t("Last modification date"),
                    sortable: true,
                    getValue: row =>
                        row.lastUpdatedValue ? format(row.lastUpdatedValue, "yyyy-MM-dd' 'HH:mm:ss") : "No data",
                },
                {
                    name: "lastDateOfSubmission",
                    text: i18n.t("Last date of submission"),
                    sortable: true,
                    getValue: row =>
                        row.lastDateOfSubmission
                            ? format(row.lastDateOfSubmission, "yyyy-MM-dd' 'HH:mm:ss")
                            : "Never submitted",
                },
                {
                    name: "lastDateOfApproval",
                    text: i18n.t("Last date of approval"),
                    sortable: true,
                    getValue: row =>
                        row.lastDateOfApproval
                            ? format(row.lastDateOfApproval, "yyyy-MM-dd' 'HH:mm:ss")
                            : "Never approved",
                },
            ],
            actions: [
                {
                    name: "complete",
                    text: i18n.t("Complete"),
                    icon: <DoneIcon />,
                    multiple: true,
                    onClick: async (selectedIds: string[]) => {
                        const items = _.compact(selectedIds.map(item => parseDataDuplicationItemId(item)));
                        if (items.length === 0) return;

                        const result = await compositionRoot.malDataApproval.updateStatus(items, "complete");
                        if (!result) snackbar.error(i18n.t("Error when trying to complete data set"));

                        reload();
                    },
                    isActive: (rows: DataApprovalViewModel[]) => {
                        return (
                            _.every(rows, row => row.completed === false && row.lastUpdatedValue) &&
                            (isMalApprover || isMalAdmin)
                        );
                    },
                },
                {
                    name: "incomplete",
                    text: i18n.t("Incomplete"),
                    icon: <RemoveIcon />,
                    multiple: true,
                    onClick: async (selectedIds: string[]) => {
                        const items = _.compact(selectedIds.map(item => parseDataDuplicationItemId(item)));
                        if (items.length === 0) return;

                        const result = await compositionRoot.malDataApproval.updateStatus(items, "incomplete");
                        if (!result) snackbar.error(i18n.t("Error when trying to incomplete data set"));

                        reload();
                    },
                    isActive: rows => _.every(rows, row => row.completed === true && !row.validated),
                },
                {
                    name: "submit",
                    text: i18n.t("Submit"),
                    icon: <DoneAllIcon />,
                    multiple: true,
                    onClick: async (selectedIds: string[]) => {
                        const items = _.compact(selectedIds.map(item => parseDataDuplicationItemId(item)));
                        if (items.length === 0) return;

                        const result = await compositionRoot.malDataApproval.updateStatus(items, "approve");
                        if (!result) snackbar.error(i18n.t("Error when trying to submit data set"));

                        reload();
                    },
                    isActive: (rows: DataApprovalViewModel[]) => {
                        return (
                            _.every(rows, row => row.validated === false && row.lastUpdatedValue) &&
                            (isMalApprover || isMalAdmin)
                        );
                    },
                },
                {
                    name: "unapprove",
                    text: i18n.t("Revoke"),
                    icon: <ClearAllIcon />,
                    multiple: true,
                    onClick: async (selectedIds: string[]) => {
                        const items = _.compact(selectedIds.map(item => parseDataDuplicationItemId(item)));
                        if (items.length === 0) return;

                        const result = await compositionRoot.malDataApproval.updateStatus(items, "unapprove");
                        if (!result) snackbar.error(i18n.t("Error when trying to unsubmit data set"));

                        reload();
                    },
                    isActive: rows => _.every(rows, row => row.validated === true),
                },
                {
                    name: "approve",
                    text: i18n.t("Approve"),
                    icon: <ThumbUp />,
                    multiple: true,
                    onClick: async (selectedIds: string[]) => {
                        const items = _.compact(selectedIds.map(item => parseDataDuplicationItemId(item)));
                        if (items.length === 0) return;

                        const result = await compositionRoot.malDataApproval.updateStatus(items, "duplicate");
                        if (!result) snackbar.error(i18n.t("Error when trying to approve data values"));

                        reload();
                    },
                    isActive: rows => _.every(rows, row => row.lastUpdatedValue) && isMalAdmin,
                },
                {
                    name: "getDiff",
                    text: i18n.t("Check Difference"),
                    icon: <PlaylistAddCheck />,
                    multiple: true,
                    onClick: async (selectedIds: string[]) => {
                        openDialog();
                        setSelected(selectedIds);
                    },
                    isActive: rows => _.every(rows, row => row.lastUpdatedValue) && (isMalApprover || isMalAdmin),
                },
            ],
            initialSorting: {
                field: "orgUnit" as const,
                order: "asc" as const,
            },
            paginationOptions: {
                pageSizeOptions: [10, 20, 50],
                pageSizeInitialValue: 10,
            },
        }),
        [compositionRoot.malDataApproval, isMalAdmin, isMalApprover, openDialog, reload, snackbar]
    );

    const getRows = useMemo(
        () => async (_search: string, paging: TablePagination, sorting: TableSorting<DataApprovalViewModel>) => {
            const { pager, objects } = await compositionRoot.malDataApproval.get({
                config,
                paging: { page: paging.page, pageSize: paging.pageSize },
                sorting: getSortingFromTableSorting(sorting),
                ...getUseCaseOptions(filters, selectablePeriods),
            });

            console.debug("Reloading", reloadKey);
            return { pager, objects: getDataApprovalViews(config, objects) };
        },
        [config, compositionRoot, filters, reloadKey, selectablePeriods]
    );

    function getUseCaseOptions(filter: DataSetsFilter, selectablePeriods: string[]) {
        return {
            ...filter,
            periods: _.isEmpty(filter.periods) ? selectablePeriods : filter.periods,
            orgUnitIds: getOrgUnitIdsFromPaths(filter.orgUnitPaths),
        };
    }
    const saveReorderedColumns = useCallback(
        async (columnKeys: Array<keyof DataApprovalViewModel>) => {
            if (!visibleColumns) return;

            await compositionRoot.malDataApproval.saveColumns(Namespaces.MAL_APPROVAL_STATUS_USER_COLUMNS, columnKeys);
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

    function getFilterOptions(config: Config, selectablePeriods: string[]) {
        return {
            dataSets: sortByName(_.values(config.dataSets)),
            periods: selectablePeriods,
            approvalWorkflow: config.approvalWorkflow,
        };
    }
    const filterOptions = React.useMemo(() => getFilterOptions(config, selectablePeriods), [config, selectablePeriods]);

    useEffect(() => {
        compositionRoot.malDataApproval.getColumns(Namespaces.MAL_APPROVAL_STATUS_USER_COLUMNS).then(columns => {
            columns = columns.length
                ? columns
                : [
                      "orgUnit",
                      "period",
                      "completed",
                      "validated",
                      "lastUpdatedValue",
                      "lastDateOfSubmission",
                      "lastDateOfApproval",
                      "modificationCount",
                  ];
            setVisibleColumns(columns);
        });
    }, [compositionRoot]);

    return (
        <React.Fragment>
            <ObjectsList<DataApprovalViewModel>
                {...tableProps}
                columns={columnsToShow}
                onChangeSearch={undefined}
                onReorderColumns={saveReorderedColumns}
            >
                <Filters values={filters} options={filterOptions} onChange={setFilters} />
            </ObjectsList>
            <ConfirmationDialog
                isOpen={isDialogOpen}
                title={i18n.t("Check differences")}
                onCancel={closeDialog}
                cancelText={i18n.t("Close")}
                maxWidth="md"
                fullWidth
            >
                <DataDifferencesList selectedIds={selected} />
            </ConfirmationDialog>
        </React.Fragment>
    );
});

export function getSortingFromTableSorting(sorting: TableSorting<DataApprovalViewModel>): Sorting<MalDataApprovalItem> {
    return {
        field: sorting.field === "id" ? "period" : sorting.field,
        direction: sorting.order,
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