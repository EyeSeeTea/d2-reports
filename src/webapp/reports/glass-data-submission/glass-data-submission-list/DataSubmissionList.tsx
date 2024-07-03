import React, { useMemo, useState } from "react";
import { DataSubmissionViewModel, EARDataSubmissionViewModel } from "../DataSubmissionViewModel";
import {
    ConfirmationDialog,
    ObjectsList,
    TableColumn,
    TableConfig,
    useObjectsTable,
    useSnackbar,
} from "@eyeseetea/d2-ui-components";
import {
    TextArea,
    // @ts-ignore
} from "@dhis2/ui";
import i18n from "../../../../locales";
import { useAppContext } from "../../../contexts/app-context";
import {
    EARSubmissionItemIdentifier,
    GLASSDataSubmissionItemIdentifier,
    parseDataSubmissionItemId,
    parseEARSubmissionItemId,
} from "../../../../domain/reports/glass-data-submission/entities/GLASSDataSubmissionItem";
import { Namespaces } from "../../../../data/common/clients/storage/Namespaces";
import _ from "lodash";
import { emptySubmissionFilter, Filters } from "./Filters";
import { Check, Dashboard, LockOpen, ThumbDown, ThumbUp } from "@material-ui/icons";
import { useBooleanState } from "../../../utils/use-boolean";
import { goToDhis2Url } from "../../../../utils/utils";
import { useDataSubmissionList } from "./useDataSubmissionList";

export const DataSubmissionList: React.FC = React.memo(() => {
    const { api, compositionRoot } = useAppContext();

    const snackbar = useSnackbar();
    const [filters, setFilters] = useState(emptySubmissionFilter);
    const [rejectionReason, setRejectionReason] = useState<string>("");
    const [rejectedItems, setRejectedItems] = useState<GLASSDataSubmissionItemIdentifier[]>([]);
    const [rejectedSignals, setRejectedSignals] = useState<EARSubmissionItemIdentifier[]>([]);
    const [rejectedState, setRejectedState] = useState<"loading" | "idle">("idle");
    const [isDatasetUpdate, setDatasetUpdate] = useState<boolean>(false);
    const [isDialogOpen, { enable: openDialog, disable: closeDialog }] = useBooleanState(false);

    const {
        dataSubmissionPeriod,
        initialSorting,
        isEARModule,
        isEGASPUser,
        pagination,
        selectablePeriods,
        visibleColumns,
        visibleEARColumns,
        getEARRows,
        getRows,
        reload,
        saveReorderedColumns,
        saveReorderedEARColumns,
    } = useDataSubmissionList(filters);

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
            initialSorting: initialSorting,
            paginationOptions: pagination,
        }),
        [
            api.baseUrl,
            compositionRoot.glassDataSubmission,
            initialSorting,
            isEGASPUser,
            openDialog,
            pagination,
            reload,
            snackbar,
        ]
    );

    const earBaseConfig: TableConfig<EARDataSubmissionViewModel> = useMemo(
        () => ({
            columns: [
                { name: "orgUnitName", text: i18n.t("Country"), sortable: true },
                { name: "creationDate", text: i18n.t("Creation Date"), sortable: true },
                {
                    name: "levelOfConfidentiality",
                    text: i18n.t("Level of Confidentiality"),
                    sortable: true,
                    getValue: row =>
                        row.levelOfConfidentiality === "CONFIDENTIAL" ? "Confidential" : "Non-Confidential",
                },
                { name: "submissionStatus", text: i18n.t("Status"), sortable: true },
            ],
            actions: [
                {
                    name: "signalDashboard",
                    text: i18n.t("Go to Signal"),
                    icon: <Dashboard />,
                    multiple: false,
                    onClick: (selectedIds: string[]) => {
                        const items = _.compact(selectedIds.map(item => parseEARSubmissionItemId(item)));
                        if (items.length === 0) return;

                        const signals = items.map(item => {
                            return {
                                orgUnit: item.orgUnit,
                                module: item.module,
                                id: item.id,
                            };
                        });

                        goToDhis2Url(
                            api.baseUrl,
                            `api/apps/glass/index.html#/signal?orgUnit=${signals[0]?.orgUnit}&period=${signals[0]?.module}&eventId=${signals[0]?.id}`
                        );
                    },
                },
                {
                    name: "approve",
                    text: i18n.t("Approve"),
                    icon: <ThumbUp />,
                    multiple: true,
                    onClick: async (selectedIds: string[]) => {
                        const items = _.compact(selectedIds.map(item => parseEARSubmissionItemId(item)));
                        if (items.length === 0) return;

                        try {
                            await compositionRoot.glassDataSubmission.updateStatus(
                                Namespaces.SIGNALS,
                                "approve",
                                [],
                                undefined,
                                undefined,
                                items
                            );
                        } catch {
                            snackbar.error(i18n.t("Error when trying to approve signal"));
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
                    onClick: async (selectedIds: string[]) => {
                        const items = _.compact(selectedIds.map(item => parseEARSubmissionItemId(item)));
                        if (items.length === 0) return;

                        setRejectedSignals(items);
                        openDialog();
                    },
                    isActive: (rows: EARDataSubmissionViewModel[]) => {
                        return _.every(rows, row => row.status === "PENDING_APPROVAL");
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
        [api.baseUrl, compositionRoot.glassDataSubmission, openDialog, reload, snackbar]
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
        if (!visibleEARColumns || _.isEmpty(visibleEARColumns)) return earTableProps.columns;

        const indexes = _(visibleEARColumns)
            .map((columnName, idx) => [columnName, idx] as [string, number])
            .fromPairs()
            .value();

        return _(earTableProps.columns)
            .map(column => ({ ...column, hidden: !visibleEARColumns.includes(column.name) }))
            .sortBy(column => indexes[column.name] || 0)
            .value();
    }, [earTableProps.columns, visibleEARColumns]);

    const closeRejectionDialog = () => {
        closeDialog();
        setRejectionReason("");
    };

    return isEARModule ? (
        <ObjectsList<EARDataSubmissionViewModel>
            {...earTableProps}
            columns={earColumnsToShow}
            onChangeSearch={undefined}
            onReorderColumns={saveReorderedEARColumns}
        >
            <Filters isEARModule={isEARModule} values={filters} options={filterOptions} onChange={setFilters} />

            <ConfirmationDialog
                isOpen={isDialogOpen}
                title={i18n.t("Reject Signal")}
                onCancel={closeRejectionDialog}
                cancelText={i18n.t("Cancel")}
                onSave={async () => {
                    setRejectedState("loading");
                    try {
                        await compositionRoot.glassDataSubmission.updateStatus(
                            Namespaces.SIGNALS,
                            "reject",
                            [],
                            rejectionReason,
                            false,
                            rejectedSignals
                        );

                        setRejectedState("idle");
                        closeRejectionDialog();
                        snackbar.success(i18n.t("Signals have been successfully rejected"));

                        reload();
                    } catch {
                        snackbar.error(i18n.t("Error when trying to reject signal"));
                    }
                }}
                saveText={rejectedState === "idle" ? "Reject" : "Rejecting"}
                maxWidth="md"
                disableSave={!rejectionReason || rejectedState === "loading"}
                fullWidth
            >
                <p>{i18n.t("Please provide a reason for rejecting this signal:")}</p>
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
    ) : (
        <ObjectsList<DataSubmissionViewModel>
            {...tableProps}
            columns={columnsToShow}
            onChangeSearch={undefined}
            onReorderColumns={saveReorderedColumns}
        >
            <Filters
                dataSubmissionPeriod={dataSubmissionPeriod}
                values={filters}
                options={filterOptions}
                onChange={setFilters}
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
});
