import React, { useCallback, useEffect, useMemo, useState } from "react";
import { DataSubmissionViewModel, getDataSubmissionViews } from "../DataSubmissionViewModel";
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
    Input,
    // @ts-ignore
} from "@dhis2/ui";
import i18n from "../../../../locales";
import { useAppContext } from "../../../contexts/app-context";
import { useReload } from "../../../utils/use-reload";
import {
    GLASSDataSubmissionItem,
    GLASSDataSubmissionItemIdentifier,
    parseDataSubmissionItemId,
} from "../../../../domain/reports/glass-data-submission/entities/GLASSDataSubmissionItem";
import { Sorting } from "../../../../domain/common/entities/PaginatedObjects";
import { Namespaces } from "../../../../data/common/clients/storage/Namespaces";
import _ from "lodash";
import { Filter, Filters } from "./Filters";
import { Config } from "../../../../domain/common/entities/Config";
import { getOrgUnitIdsFromPaths } from "../../../../domain/common/entities/OrgUnit";
import { Check, LockOpen, ThumbDown, ThumbUp } from "@material-ui/icons";
import { useBooleanState } from "../../../utils/use-boolean";

export const DataSubmissionList: React.FC = React.memo(() => {
    const { compositionRoot, config } = useAppContext();

    const snackbar = useSnackbar();
    const [reloadKey, reload] = useReload();
    const [filters, setFilters] = useState(() => getEmptyDataValuesFilter(config));
    const [visibleColumns, setVisibleColumns] = useState<string[]>();
    const [rejectionReason, setRejectionReason] = useState<string>("");
    const [rejectedItems, setRejectedItems] = useState<GLASSDataSubmissionItemIdentifier[]>([]);
    const [rejectedState, setRejectedState] = useState<"loading" | "idle">("idle");
    const [isDatasetUpdate, setDatasetUpdate] = useState<boolean>(false);
    const [isDialogOpen, { enable: openDialog, disable: closeDialog }] = useBooleanState(false);

    const selectablePeriods = React.useMemo(() => {
        const currentYear = new Date().getFullYear();
        return _.range(currentYear - 5, currentYear + 1).map(n => n.toString());
    }, []);

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
                {
                    name: "questionnaireCompleted",
                    text: i18n.t("Questionnaire completed"),
                    sortable: true,
                    getValue: row => (row.questionnaireCompleted ? "Completed" : "Not completed"),
                },
                {
                    name: "module",
                    text: i18n.t("Datasets uploaded"),
                    sortable: true,
                    getValue: row => (row.module ? "Uploaded" : "Not uploaded"),
                },
                {
                    name: "submissionStatus",
                    text: i18n.t("Status"),
                    sortable: true,
                },
            ],
            actions: [
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

                        reload();
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
        [compositionRoot, openDialog, reload, snackbar]
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

    function getUseCaseOptions(filter: Filter, selectablePeriods: string[]) {
        return {
            ...filter,
            periods: _.isEmpty(filter.periods) ? selectablePeriods : filter.periods,
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

    const tableProps = useObjectsTable<DataSubmissionViewModel>(baseConfig, getRows);

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

    const closeRejectionDialog = () => {
        closeDialog();
        setRejectionReason("");
    };

    return (
        <ObjectsList<DataSubmissionViewModel>
            {...tableProps}
            columns={columnsToShow}
            onChangeSearch={undefined}
            onReorderColumns={saveReorderedColumns}
        >
            <Filters values={filters} options={filterOptions} onChange={setFilters} />
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
                <Input
                    type="text"
                    onChange={({ value }: { value: string }) => {
                        setRejectionReason(value);
                    }}
                    value={rejectionReason}
                />
            </ConfirmationDialog>
        </ObjectsList>
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

function getEmptyDataValuesFilter(_config: Config): Filter {
    return {
        orgUnitPaths: [],
        periods: [],
        completionStatus: undefined,
        submissionStatus: undefined,
    };
}
