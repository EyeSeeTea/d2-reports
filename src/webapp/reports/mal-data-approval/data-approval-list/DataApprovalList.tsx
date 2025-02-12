import {
    ObjectsList,
    TableColumn,
    TableConfig,
    TableGlobalAction,
    TablePagination,
    TableSorting,
    useObjectsTable,
    useSnackbar,
} from "@eyeseetea/d2-ui-components";
import ClearAllIcon from "@material-ui/icons/ClearAll";
import DoneIcon from "@material-ui/icons/Done";
import DoneAllIcon from "@material-ui/icons/DoneAll";
import RemoveIcon from "@material-ui/icons/Remove";
import RestartAltIcon from "@material-ui/icons/Storage";
import _ from "lodash";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { sortByName } from "../../../../domain/common/entities/Base";
import { Config } from "../../../../domain/common/entities/Config";
import { getOrgUnitIdsFromPaths } from "../../../../domain/common/entities/OrgUnit";
import { emptyPage, Sorting } from "../../../../domain/common/entities/PaginatedObjects";
import { MalDataApprovalItem } from "../../../../domain/reports/mal-data-approval/entities/MalDataApprovalItem";
import i18n from "../../../../locales";
import { useAppContext } from "../../../contexts/app-context";
import { ConfirmationDialog } from "@eyeseetea/d2-ui-components";
import { DataApprovalViewModel, getDataApprovalViews } from "../DataApprovalViewModel";
import { DataSetsFilter, Filters } from "./Filters";
import { DataDifferencesList } from "../DataDifferencesList";
import { Notifications, NotificationsOff, PlaylistAddCheck, ThumbUp } from "@material-ui/icons";
import { Namespaces } from "../../../../data/common/clients/storage/Namespaces";
import { emptyApprovalFilter } from "./hooks/useDataApprovalFilters";
import { useDataApprovalListColumns } from "./hooks/useDataApprovalListColumns";
import { useActiveDataApprovalActions } from "./hooks/useActiveDataApprovalActions";
import { useDataApprovalActions } from "./hooks/useDataApprovalActions";
import { useDataMonitoring } from "./hooks/useDataMonitoring";

export const DataApprovalList: React.FC = React.memo(() => {
    const { compositionRoot, config } = useAppContext();
    const snackbar = useSnackbar();

    const activeActions = useActiveDataApprovalActions();
    const {
        globalMessage,
        modalActions: { closeDataDifferencesDialog, isDialogOpen, revoke },
        onTableActionClick,
        reloadKey,
        selectedIds,
    } = useDataApprovalActions();
    const { columns } = useDataApprovalListColumns();
    const { monitoringValue } = useDataMonitoring();

    useEffect(() => {
        if (globalMessage?.type === "error") snackbar.error(globalMessage.message);
        else if (globalMessage?.type === "success") snackbar.success(globalMessage.message);
    }, [globalMessage, snackbar]);

    const [filters, setFilters] = useState(emptyApprovalFilter);
    const [visibleColumns, setVisibleColumns] = useState<string[]>();
    const [__, setDiffState] = useState<string>("");
    const [oldPeriods, setOldPeriods] = useState(false);

    const selectablePeriods = useMemo(() => {
        const currentYear = new Date().getFullYear();

        return oldPeriods
            ? _.range(2000, currentYear - 5).map(n => n.toString())
            : _.range(currentYear - 5, currentYear).map(n => n.toString());
    }, [oldPeriods]);

    useEffect(() => {
        compositionRoot.malDataApproval.getColumns(Namespaces.MAL_APPROVAL_STATUS_USER_COLUMNS).then(columns => {
            setVisibleColumns(columns);
        });
    }, [compositionRoot]);

    const baseConfig: TableConfig<DataApprovalViewModel> = useMemo(
        () => ({
            columns: columns,
            actions: [
                {
                    name: "complete",
                    text: i18n.t("Complete"),
                    icon: <DoneIcon />,
                    multiple: true,
                    onClick: onTableActionClick.completeAction,
                    isActive: activeActions.isCompleteActionVisible,
                },
                {
                    name: "incomplete",
                    text: i18n.t("Incomplete"),
                    icon: <RemoveIcon />,
                    multiple: true,
                    onClick: onTableActionClick.incompleteAction,
                    isActive: activeActions.isIncompleteActionVisible,
                },
                {
                    name: "submit",
                    text: i18n.t("Submit"),
                    icon: <DoneAllIcon />,
                    multiple: true,
                    onClick: onTableActionClick.submitAction,
                    isActive: activeActions.isSubmitActionVisible,
                },
                {
                    name: "revoke",
                    text: i18n.t("Revoke"),
                    icon: <ClearAllIcon />,
                    multiple: true,
                    onClick: onTableActionClick.revokeAction,
                    isActive: activeActions.isRevokeActionVisible,
                },
                {
                    name: "approve",
                    text: i18n.t("Approve"),
                    icon: <ThumbUp />,
                    multiple: true,
                    onClick: onTableActionClick.approveAction,
                    isActive: activeActions.isApproveActionVisible,
                },
                {
                    name: "activate",
                    text: i18n.t("Activate monitoring"),
                    icon: <Notifications />,
                    multiple: true,
                    onClick: onTableActionClick.activateMonitoringAction,
                    isActive: activeActions.isActivateMonitoringActionVisible,
                },
                {
                    name: "deactivate",
                    text: i18n.t("Deactivate monitoring"),
                    icon: <NotificationsOff />,
                    multiple: true,
                    onClick: onTableActionClick.deactivateMonitoringAction,
                    isActive: activeActions.isDeactivateMonitoringActionVisible,
                },
                {
                    name: "getDiff",
                    text: i18n.t("Check Difference"),
                    icon: <PlaylistAddCheck />,
                    onClick: onTableActionClick.getDifferenceAction,
                    isActive: activeActions.isGetDifferenceActionVisible,
                },
                {
                    name: "getDiffAndRevoke",
                    text: i18n.t("Check Difference"),
                    icon: <PlaylistAddCheck />,
                    onClick: onTableActionClick.getDifferenceAndRevokeAction,
                    isActive: activeActions.isGetDifferenceAndRevokeActionVisible,
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
        [
            columns,
            onTableActionClick.completeAction,
            onTableActionClick.incompleteAction,
            onTableActionClick.submitAction,
            onTableActionClick.revokeAction,
            onTableActionClick.approveAction,
            onTableActionClick.activateMonitoringAction,
            onTableActionClick.deactivateMonitoringAction,
            onTableActionClick.getDifferenceAction,
            onTableActionClick.getDifferenceAndRevokeAction,
            activeActions.isCompleteActionVisible,
            activeActions.isIncompleteActionVisible,
            activeActions.isSubmitActionVisible,
            activeActions.isRevokeActionVisible,
            activeActions.isApproveActionVisible,
            activeActions.isActivateMonitoringActionVisible,
            activeActions.isDeactivateMonitoringActionVisible,
            activeActions.isGetDifferenceActionVisible,
            activeActions.isGetDifferenceAndRevokeActionVisible,
        ]
    );

    const getRows = useCallback(
        async (_search: string, paging: TablePagination, sorting: TableSorting<DataApprovalViewModel>) => {
            if (!monitoringValue) return emptyPage;

            const { pager, objects } = await compositionRoot.malDataApproval.get({
                config: config,
                paging: { page: paging.page, pageSize: paging.pageSize },
                sorting: getSortingFromTableSorting(sorting),
                useOldPeriods: oldPeriods,
                ...getUseCaseOptions(filters, selectablePeriods),
            });

            console.debug("Reloading", reloadKey);
            return { pager, objects: getDataApprovalViews(config, objects, monitoringValue) };
        },
        [compositionRoot.malDataApproval, config, oldPeriods, filters, selectablePeriods, reloadKey, monitoringValue]
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
    const filterOptions = useMemo(() => getFilterOptions(config, selectablePeriods), [config, selectablePeriods]);

    const periodsToggle: TableGlobalAction = {
        name: "switchPeriods",
        text: i18n.t(oldPeriods ? "Use recent periods" : "Use old periods"),
        icon: <RestartAltIcon />,
        onClick: async () => {
            setOldPeriods(oldYears => !oldYears);
            // setFilters(currentFilters => ({ ...currentFilters, periods: [] }));
        },
    };

    return (
        <React.Fragment>
            <ObjectsList<DataApprovalViewModel>
                {...tableProps}
                globalActions={[periodsToggle]}
                columns={columnsToShow}
                onChangeSearch={undefined}
                onReorderColumns={saveReorderedColumns}
            >
                <Filters
                    hideDataSets={false} // perhaps show datasets based on user permissions?
                    values={filters}
                    options={filterOptions}
                    onChange={setFilters}
                />
            </ObjectsList>
            <ConfirmationDialog
                isOpen={isDialogOpen}
                title={i18n.t("Check differences")}
                onCancel={closeDataDifferencesDialog}
                cancelText={i18n.t("Close")}
                maxWidth="md"
                fullWidth
            >
                <DataDifferencesList
                    selectedIds={selectedIds}
                    revoke={revoke}
                    isUpdated={() => setDiffState(`${new Date().getTime()}`)}
                    key={new Date().getTime()}
                />
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
