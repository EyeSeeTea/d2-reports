import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    DataSubmissionViewModel,
    EARDataSubmissionViewModel,
    getDataSubmissionViews,
    getEARDataSubmissionViews,
} from "../DataSubmissionViewModel";
import {
    ConfirmationDialog,
    ObjectsList,
    TableColumn,
    TableConfig,
    TablePagination,
    TableSorting,
    useObjectsTable,
    useSnackbar,
} from "@eyeseetea/d2-ui-components";
import {
    TextArea,
    // @ts-ignore
} from "@dhis2/ui";
import i18n from "../../../../locales";
import { useAppContext } from "../../../contexts/app-context";
import { useReload } from "../../../utils/use-reload";
import {
    EARDataSubmissionItem,
    GLASSDataSubmissionItem,
    GLASSDataSubmissionItemIdentifier,
    GLASSUserPermission,
    parseDataSubmissionItemId,
} from "../../../../domain/reports/glass-data-submission/entities/GLASSDataSubmissionItem";
import { Sorting } from "../../../../domain/common/entities/PaginatedObjects";
import { Namespaces } from "../../../../data/common/clients/storage/Namespaces";
import _ from "lodash";
import { Filter, Filters } from "./Filters";
import { Config } from "../../../../domain/common/entities/Config";
import { getOrgUnitIdsFromPaths } from "../../../../domain/common/entities/OrgUnit";
import { Check, Dashboard, LockOpen, ThumbDown, ThumbUp } from "@material-ui/icons";
import { useBooleanState } from "../../../utils/use-boolean";
import { goToDhis2Url } from "../../../../utils/utils";

export const DataSubmissionList: React.FC = React.memo(() => {
    const { api, compositionRoot, config } = useAppContext();

    const snackbar = useSnackbar();
    const [reloadKey, reload] = useReload();
    const [filters, setFilters] = useState(() =>
        getEmptyDataValuesFilter(config, isEGASPUser, isAMRUser, isAMRIndividualUser)
    );
    const [userGroupPermissions, setUserGroupPermissions] = useState<GLASSUserPermission>();
    const [visibleColumns, setVisibleColumns] = useState<string[]>();
    const [rejectionReason, setRejectionReason] = useState<string>("");
    const [rejectedItems, setRejectedItems] = useState<GLASSDataSubmissionItemIdentifier[]>([]);
    const [rejectedState, setRejectedState] = useState<"loading" | "idle">("idle");
    const [isDatasetUpdate, setDatasetUpdate] = useState<boolean>(false);
    const [isDialogOpen, { enable: openDialog, disable: closeDialog }] = useBooleanState(false);

    const userGroupIds = config.currentUser.userGroups.map(ug => ug.id);
    const isAMRUser = userGroupIds.some(id =>
        userGroupPermissions?.amrPermissions.map(permission => permission.id).includes(id)
    );
    const isAMRIndividualUser = userGroupIds.some(id =>
        userGroupPermissions?.amrIndividualPermissions.map(permission => permission.id).includes(id)
    );
    const isEGASPUser = userGroupIds.some(id =>
        userGroupPermissions?.egaspPermissions.map(permission => permission.id).includes(id)
    );

    const selectablePeriods = React.useMemo(() => {
        const currentYear = new Date().getFullYear();
        return _.range(2016, currentYear + 1).map(n => n.toString());
    }, []);

    useEffect(() => {
        compositionRoot.glassDataSubmission.getUserGroupPermissions().then(permissions => {
            setUserGroupPermissions(permissions);
        });

        if (filters.module === "EAR") {
            compositionRoot.glassDataSubmission.getEARColumns(Namespaces.SIGNALS_USER_COLUMNS).then(columns => {
                setVisibleColumns(columns);
            });
        } else {
            compositionRoot.glassDataSubmission.getColumns(Namespaces.DATA_SUBMISSSIONS_USER_COLUMNS).then(columns => {
                setVisibleColumns(columns);
            });
        }
    }, [compositionRoot, filters.module]);

    const baseConfig: TableConfig<DataSubmissionViewModel> = useMemo(
        () => ({
            columns: [
                { name: "orgUnitName", text: i18n.t("Country"), sortable: true },
                { name: "period", text: i18n.t(isEGASPUser ? "Period" : "Year"), sortable: true },
                {
                    name: "questionnaireCompleted",
                    text: i18n.t("Questionnaire completed"),
                    sortable: true,
                    getValue: row => (row.questionnaireCompleted ? "Completed" : "Not completed"),
                },
                {
                    name: "dataSetsUploaded",
                    text: i18n.t("DataSets uploaded"),
                    sortable: true,
                },
                {
                    name: "submissionStatus",
                    text: i18n.t("Status"),
                    sortable: true,
                },
            ],
            actions: [
                {
                    name: "unapvdDashboard",
                    text: i18n.t("Go to GLASS Unapproved Dashboard"),
                    icon: <Dashboard />,
                    multiple: true,
                    onClick: async (selectedIds: string[]) => {
                        const items = _.compact(selectedIds.map(item => parseDataSubmissionItemId(item)));
                        if (items.length === 0) return;

                        const unapvdDashboardId = await compositionRoot.glassDataSubmission.updateStatus(
                            Namespaces.DATA_SUBMISSSIONS,
                            "unapvdDashboard",
                            items
                        );

                        goToDhis2Url(api.baseUrl, `/dhis-web-dashboard/index.html#/${unapvdDashboardId}`);
                    },
                    isActive: (rows: DataSubmissionViewModel[]) => {
                        return _.every(rows, row => row.status === "PENDING_APPROVAL");
                    },
                },
                {
                    name: "approve",
                    text: i18n.t("Approve"),
                    icon: <ThumbUp />,
                    multiple: true,
                    onClick: async (selectedIds: string[]) => {
                        const items = _.compact(selectedIds.map(item => parseDataSubmissionItemId(item)));
                        if (items.length === 0) return;

                        try {
                            await compositionRoot.glassDataSubmission.updateStatus(
                                Namespaces.DATA_SUBMISSSIONS,
                                "approve",
                                items
                            );
                        } catch {
                            snackbar.error(i18n.t("Error when trying to approve submission"));
                        }

                        reload();
                    },
                    isActive: (rows: DataSubmissionViewModel[]) => {
                        return _.every(rows, row => row.status === "PENDING_APPROVAL");
                    },
                },
                {
                    name: "accept",
                    text: i18n.t("Accept"),
                    icon: <Check />,
                    multiple: true,
                    onClick: async (selectedIds: string[]) => {
                        const items = _.compact(selectedIds.map(item => parseDataSubmissionItemId(item)));
                        if (items.length === 0) return;

                        try {
                            await compositionRoot.glassDataSubmission.updateStatus(
                                Namespaces.DATA_SUBMISSSIONS,
                                "accept",
                                items
                            );
                        } catch {
                            snackbar.error(i18n.t("Error when trying to accept submission"));
                        }

                        reload();
                    },
                    isActive: (rows: DataSubmissionViewModel[]) => {
                        return _.every(rows, row => row.status === "PENDING_UPDATE_APPROVAL");
                    },
                },
                {
                    name: "reject",
                    text: i18n.t("Reject"),
                    icon: <ThumbDown />,
                    multiple: true,
                    onClick: (selectedIds: string[]) => {
                        const items = _.compact(selectedIds.map(item => parseDataSubmissionItemId(item)));
                        if (items.length === 0) return;

                        setRejectedItems(items);
                        openDialog();
                    },
                    isActive: (rows: DataSubmissionViewModel[]) => {
                        return _.every(rows, row => {
                            setDatasetUpdate(row.status === "PENDING_UPDATE_APPROVAL");

                            return row.status === "PENDING_APPROVAL" || row.status === "PENDING_UPDATE_APPROVAL";
                        });
                    },
                },
                {
                    name: "reopen",
                    text: i18n.t("Reopen Submission"),
                    icon: <LockOpen />,
                    multiple: true,
                    onClick: async (selectedIds: string[]) => {
                        const items = _.compact(selectedIds.map(item => parseDataSubmissionItemId(item)));
                        if (items.length === 0) return;

                        try {
                            await compositionRoot.glassDataSubmission.updateStatus(
                                Namespaces.DATA_SUBMISSSIONS,
                                "reopen",
                                items
                            );
                        } catch {
                            snackbar.error(i18n.t("Error when trying to reopen submission"));
                        }

                        reload();
                    },
                    isActive: (rows: DataSubmissionViewModel[]) => {
                        return _.every(rows, row => row.status === "PENDING_APPROVAL");
                    },
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
        [api, compositionRoot.glassDataSubmission, isEGASPUser, openDialog, reload, snackbar]
    );

    const earBaseConfig: TableConfig<EARDataSubmissionViewModel> = useMemo(
        () => ({
            columns: [
                { name: "orgUnitName", text: i18n.t("Country"), sortable: true },
                { name: "creationDate", text: i18n.t("Creation Date"), sortable: true },
                { name: "status", text: i18n.t("Status"), sortable: true },
            ],
            actions: [
                {
                    name: "signalDashboard",
                    text: i18n.t("Go to Signal"),
                    icon: <Dashboard />,
                    multiple: true,
                    onClick: async (selectedIds: string[]) => {
                        const items = _.compact(selectedIds.map(item => parseDataSubmissionItemId(item)));
                        if (items.length === 0) return;

                        const unapvdDashboardId = await compositionRoot.glassDataSubmission.updateStatus(
                            Namespaces.DATA_SUBMISSSIONS,
                            "unapvdDashboard",
                            items
                        );

                        goToDhis2Url(api.baseUrl, `/dhis-web-dashboard/index.html#/${unapvdDashboardId}`);
                    },
                },
                {
                    name: "approve",
                    text: i18n.t("Approve"),
                    icon: <ThumbUp />,
                    multiple: true,
                    onClick: async (selectedIds: string[]) => {
                        const items = _.compact(selectedIds.map(item => parseDataSubmissionItemId(item)));
                        if (items.length === 0) return;

                        try {
                            await compositionRoot.glassDataSubmission.updateStatus(
                                Namespaces.DATA_SUBMISSSIONS,
                                "approve",
                                items
                            );
                        } catch {
                            snackbar.error(i18n.t("Error when trying to approve submission"));
                        }

                        reload();
                    },
                    isActive: (rows: EARDataSubmissionViewModel[]) => {
                        return _.every(rows, row => row.status === "PENDING_APPROVAL");
                    },
                },
                {
                    name: "reject",
                    text: i18n.t("Reject"),
                    icon: <ThumbDown />,
                    multiple: true,
                    onClick: (selectedIds: string[]) => {
                        const items = _.compact(selectedIds.map(item => parseDataSubmissionItemId(item)));
                        if (items.length === 0) return;

                        setRejectedItems(items);
                        openDialog();
                    },
                    isActive: (rows: EARDataSubmissionViewModel[]) => {
                        return _.every(rows, row => {
                            setDatasetUpdate(row.status === "PENDING_UPDATE_APPROVAL");

                            return row.status === "PENDING_APPROVAL" || row.status === "PENDING_UPDATE_APPROVAL";
                        });
                    },
                },
            ],
            initialSorting: {
                field: "orgUnitId" as const,
                order: "asc" as const,
            },
            paginationOptions: {
                pageSizeOptions: [10, 20, 50],
                pageSizeInitialValue: 10,
            },
        }),
        [api, compositionRoot.glassDataSubmission, openDialog, reload, snackbar]
    );

    const getRows = useMemo(
        () => async (_search: string, paging: TablePagination, sorting: TableSorting<DataSubmissionViewModel>) => {
            const { pager, objects } = await compositionRoot.glassDataSubmission.get(
                {
                    config,
                    paging: { page: paging.page, pageSize: paging.pageSize },
                    sorting: getSortingFromTableSorting(sorting),
                    ...getUseCaseOptions(filters, selectablePeriods),
                },
                Namespaces.DATA_SUBMISSSIONS
            );

            console.debug("Reloading", reloadKey);

            return { pager, objects: getDataSubmissionViews(config, objects) };
        },
        [compositionRoot, config, filters, reloadKey, selectablePeriods]
    );

    const getEARRows = useMemo(
        () => async (_search: string, paging: TablePagination, sorting: TableSorting<EARDataSubmissionViewModel>) => {
            const { pager, objects } = await compositionRoot.glassDataSubmission.getEAR(
                {
                    config,
                    paging: { page: paging.page, pageSize: paging.pageSize },
                    sorting: getEARSortingFromTableSorting(sorting),
                    ...getUseCaseOptions(filters, selectablePeriods),
                },
                Namespaces.SIGNALS
            );

            console.debug("Reloading", reloadKey);

            return { pager, objects: getEARDataSubmissionViews(config, objects) };
        },
        [compositionRoot, config, filters, reloadKey, selectablePeriods]
    );

    function getUseCaseOptions(filter: Filter, selectablePeriods: string[]) {
        return {
            ...filter,
            periods: _.isEmpty(filter.periods) ? selectablePeriods : filter.periods,
            quarters: _.isEmpty(filter.quarters) ? ["Q1", "Q2", "Q3", "Q4"] : filter.quarters,
            orgUnitIds: getOrgUnitIdsFromPaths(filter.orgUnitPaths),
        };
    }

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

    const saveReorderedEARColumns = useCallback(
        async (columnKeys: Array<keyof EARDataSubmissionViewModel>) => {
            if (!visibleColumns) return;

            await compositionRoot.glassDataSubmission.saveEARColumns(Namespaces.SIGNALS_USER_COLUMNS, columnKeys);
        },
        [compositionRoot, visibleColumns]
    );

    const tableProps = useObjectsTable<DataSubmissionViewModel>(baseConfig, getRows);
    const earTableProps = useObjectsTable<EARDataSubmissionViewModel>(earBaseConfig, getEARRows);

    function getFilterOptions(selectablePeriods: string[]) {
        return {
            periods: selectablePeriods,
        };
    }
    const filterOptions = useMemo(() => getFilterOptions(selectablePeriods), [selectablePeriods]);

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

    const earColumnsToShow = useMemo<TableColumn<EARDataSubmissionViewModel>[]>(() => {
        if (!visibleColumns || _.isEmpty(visibleColumns)) return earTableProps.columns;

        const indexes = _(visibleColumns)
            .map((columnName, idx) => [columnName, idx] as [string, number])
            .fromPairs()
            .value();

        return _(earTableProps.columns)
            .map(column => ({ ...column, hidden: !visibleColumns.includes(column.name) }))
            .sortBy(column => indexes[column.name] || 0)
            .value();
    }, [earTableProps.columns, visibleColumns]);

    const closeRejectionDialog = () => {
        closeDialog();
        setRejectionReason("");
    };

    if (filters.module === "EAR") {
        return (
            <ObjectsList<EARDataSubmissionViewModel>
                {...earTableProps}
                columns={earColumnsToShow}
                onChangeSearch={undefined}
                onReorderColumns={saveReorderedEARColumns}
            >
                <Filters
                    values={filters}
                    options={filterOptions}
                    onChange={setFilters}
                    userPermissions={{ isAMRUser, isEGASPUser, isAMRIndividualUser }}
                />
                <ConfirmationDialog
                    isOpen={isDialogOpen}
                    title={i18n.t("Reject Data Submission")}
                    onCancel={closeRejectionDialog}
                    cancelText={i18n.t("Cancel")}
                    onSave={async () => {
                        setRejectedState("loading");
                        try {
                            await compositionRoot.glassDataSubmission.updateStatus(
                                Namespaces.DATA_SUBMISSSIONS,
                                "reject",
                                rejectedItems,
                                rejectionReason,
                                isDatasetUpdate
                            );

                            setRejectedState("idle");
                            closeRejectionDialog();
                            snackbar.success(i18n.t("Data submissions have been successfully rejected"));

                            reload();
                        } catch {
                            snackbar.error(i18n.t("Error when trying to reject submission"));
                        }
                    }}
                    saveText={rejectedState === "idle" ? "Reject" : "Rejecting"}
                    maxWidth="md"
                    disableSave={!rejectionReason || rejectedState === "loading"}
                    fullWidth
                >
                    <p>{i18n.t("Please provide a reason for rejecting this data submission:")}</p>
                    <TextArea
                        type="text"
                        rows={4}
                        onChange={({ value }: { value: string }) => {
                            setRejectionReason(value);
                        }}
                        value={rejectionReason}
                    />
                </ConfirmationDialog>
            </ObjectsList>
        );
    } else {
        return (
            <ObjectsList<DataSubmissionViewModel>
                {...tableProps}
                columns={columnsToShow}
                onChangeSearch={undefined}
                onReorderColumns={saveReorderedColumns}
            >
                <Filters
                    values={filters}
                    options={filterOptions}
                    onChange={setFilters}
                    userPermissions={{ isAMRUser, isEGASPUser, isAMRIndividualUser }}
                />
                <ConfirmationDialog
                    isOpen={isDialogOpen}
                    title={i18n.t("Reject Data Submission")}
                    onCancel={closeRejectionDialog}
                    cancelText={i18n.t("Cancel")}
                    onSave={async () => {
                        setRejectedState("loading");
                        try {
                            await compositionRoot.glassDataSubmission.updateStatus(
                                Namespaces.DATA_SUBMISSSIONS,
                                "reject",
                                rejectedItems,
                                rejectionReason,
                                isDatasetUpdate
                            );

                            setRejectedState("idle");
                            closeRejectionDialog();
                            snackbar.success(i18n.t("Data submissions have been successfully rejected"));

                            reload();
                        } catch {
                            snackbar.error(i18n.t("Error when trying to reject submission"));
                        }
                    }}
                    saveText={rejectedState === "idle" ? "Reject" : "Rejecting"}
                    maxWidth="md"
                    disableSave={!rejectionReason || rejectedState === "loading"}
                    fullWidth
                >
                    <p>{i18n.t("Please provide a reason for rejecting this data submission:")}</p>
                    <TextArea
                        type="text"
                        rows={4}
                        onChange={({ value }: { value: string }) => {
                            setRejectionReason(value);
                        }}
                        value={rejectionReason}
                    />
                </ConfirmationDialog>
            </ObjectsList>
        );
    }
});

export function getSortingFromTableSorting(
    sorting: TableSorting<DataSubmissionViewModel>
): Sorting<GLASSDataSubmissionItem> {
    return {
        field: sorting.field === "id" ? "period" : sorting.field,
        direction: sorting.order,
    };
}

export function getEARSortingFromTableSorting(
    sorting: TableSorting<EARDataSubmissionViewModel>
): Sorting<EARDataSubmissionItem> {
    return {
        field: sorting.field === "id" ? "creationDate" : sorting.field,
        direction: sorting.order,
    };
}

function getEmptyDataValuesFilter(
    _config: Config,
    isEGASPUser: boolean,
    isAMRUser: boolean,
    isAMRIndividualUser: boolean
): Filter {
    const allPermissions = isEGASPUser && isAMRIndividualUser && isAMRUser;
    const amrIndividualPermissions = isAMRIndividualUser && (!isEGASPUser || !isAMRUser);
    const egaspPermissions = isEGASPUser && (!isAMRUser || !isAMRIndividualUser);

    return {
        module: allPermissions
            ? "AMR"
            : amrIndividualPermissions
            ? "AMRIndividual"
            : egaspPermissions
            ? "EGASP"
            : "AMR",
        orgUnitPaths: [],
        periods: [],
        quarters: ["Q1"],
        completionStatus: undefined,
        submissionStatus: undefined,
    };
}
