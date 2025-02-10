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
import { format } from "date-fns";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { sortByName } from "../../../../domain/common/entities/Base";
import { Config } from "../../../../domain/common/entities/Config";
import { getOrgUnitIdsFromPaths } from "../../../../domain/common/entities/OrgUnit";
import { Sorting } from "../../../../domain/common/entities/PaginatedObjects";
import {
    CountryCode,
    MalDataApprovalItem,
    Monitoring,
    MonitoringValue,
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
import { Notifications, NotificationsOff, PlaylistAddCheck, ThumbUp } from "@material-ui/icons";
import { Namespaces } from "../../../../data/common/clients/storage/Namespaces";
import { MAL_WMR_FORM } from "../../../../data/reports/mal-data-approval/MalDataApprovalDefaultRepository";
import { emptySubmissionFilter } from "./useDataApprovalFilters";

export const DataApprovalList: React.FC = React.memo(() => {
    const { compositionRoot, config, api } = useAppContext();
    const { currentUser } = config;
    const [isDialogOpen, { enable: openDialog, disable: closeDialog }] = useBooleanState(false);
    const snackbar = useSnackbar();

    const [filters, setFilters] = useState(emptySubmissionFilter);

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

    const [selected, setSelected] = useState<string[]>([""]);
    const [visibleColumns, setVisibleColumns] = useState<string[]>();
    const [reloadKey, reload] = useReload();
    const [revoke, { enable: enableRevoke, disable: disableRevoke }] = useBooleanState(false);
    const [__, setDiffState] = useState<string>("");

    const [oldPeriods, setOldPeriods] = useState(false);

    const selectablePeriods = React.useMemo(() => {
        const currentYear = new Date().getFullYear();

        return oldPeriods
            ? _.range(2000, currentYear - 5).map(n => n.toString())
            : _.range(currentYear - 5, currentYear).map(n => n.toString());
    }, [oldPeriods]);

    const [countryCodes, setCountryCodes] = useState<CountryCode[]>([]);
    const [dataNotificationsUserGroup, setDataNotificationsUserGroup] = useState<string>("");

    useEffect(() => {
        async function getMalNotificationsUserGroup() {
            const { userGroups } = await api
                .get<{ userGroups: { id: string }[] }>("/userGroups?fields=id&filter=name:eq:MAL_Data%20Notifications")
                .getData();

            return _.first(userGroups)?.id ?? "";
        }
        getMalNotificationsUserGroup().then(userGroup => {
            setDataNotificationsUserGroup(userGroup);
        });
    }, [api, compositionRoot.malDataApproval]);

    const getMonitoringValue = useMemo(
        () => async () => {
            return await compositionRoot.malDataApproval.getMonitoring(Namespaces.MONITORING);
        },
        [compositionRoot.malDataApproval]
    );

    useEffect(() => {
        compositionRoot.malDataApproval.getColumns(Namespaces.MAL_APPROVAL_STATUS_USER_COLUMNS).then(columns => {
            setVisibleColumns(columns);
        });
    }, [compositionRoot]);

    useEffect(() => {
        compositionRoot.malDataApproval.getCountryCodes().then(countryCodes => {
            setCountryCodes(countryCodes);
        });
    }, [compositionRoot.malDataApproval]);

    const getMonitoringJson = React.useMemo(
        () =>
            (
                initialMonitoringValues: MonitoringValue | Monitoring[],
                addedMonitoringValues: Monitoring[],
                elementType: string,
                dataSet: string,
                userGroups: string[]
            ): MonitoringValue => {
                if (!_.isArray(initialMonitoringValues) && initialMonitoringValues) {
                    const initialMonitoring =
                        _.first(initialMonitoringValues[elementType]?.[dataSet])?.monitoring ?? [];

                    const newDataSets = _.merge({}, initialMonitoringValues[elementType], {
                        [dataSet]: [
                            _.omit(
                                {
                                    monitoring: combineMonitoringValues(initialMonitoring, addedMonitoringValues).map(
                                        monitoring => {
                                            return {
                                                ...monitoring,
                                                orgUnit:
                                                    monitoring.orgUnit.length > 3
                                                        ? countryCodes.find(
                                                              countryCode => countryCode.id === monitoring.orgUnit
                                                          )?.code
                                                        : monitoring.orgUnit,
                                            };
                                        }
                                    ),
                                    userGroups,
                                },
                                "userGroup"
                            ),
                        ],
                    });

                    return {
                        ...initialMonitoringValues,
                        dataSets: newDataSets,
                    };
                } else {
                    const initialMonitoring: Monitoring[] = initialMonitoringValues.map(initialMonitoringValue => {
                        return {
                            orgUnit:
                                countryCodes.find(countryCode => countryCode.id === initialMonitoringValue.orgUnit)
                                    ?.code ?? initialMonitoringValue.orgUnit,
                            period: initialMonitoringValue.period,
                            enable: initialMonitoringValue.monitoring,
                        };
                    });

                    return {
                        [elementType]: {
                            [dataSet]: [
                                {
                                    monitoring: combineMonitoringValues(initialMonitoring, addedMonitoringValues),
                                    userGroups,
                                },
                            ],
                        },
                    };
                }
            },
        [countryCodes]
    );

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
                            _.every(rows, row => row.approved === false && row.lastUpdatedValue) &&
                            (isMalApprover || isMalAdmin)
                        );
                    },
                },
                {
                    name: "revoke",
                    text: i18n.t("Revoke"),
                    icon: <ClearAllIcon />,
                    multiple: true,
                    onClick: async (selectedIds: string[]) => {
                        const items = _.compact(selectedIds.map(item => parseDataDuplicationItemId(item)));
                        if (items.length === 0) return;

                        const result = await compositionRoot.malDataApproval.updateStatus(items, "revoke");
                        if (!result) snackbar.error(i18n.t("Error when trying to unsubmit data set"));

                        reload();
                    },
                    isActive: rows => _.every(rows, row => row.approved === true),
                },
                {
                    name: "approve",
                    text: i18n.t("Approve"),
                    icon: <ThumbUp />,
                    multiple: true,
                    onClick: async (selectedIds: string[]) => {
                        const items = _.compact(selectedIds.map(item => parseDataDuplicationItemId(item)));
                        if (items.length === 0) return;

                        const monitoringValues = items.map(item => {
                            return {
                                orgUnit: item.orgUnit,
                                period: item.period,
                                enable: true,
                            };
                        });
                        const monitoring = await getMonitoringValue();

                        await compositionRoot.malDataApproval.saveMonitoring(
                            Namespaces.MONITORING,
                            getMonitoringJson(
                                monitoring,
                                monitoringValues,
                                "dataSets",
                                config.dataSets[MAL_WMR_FORM]?.name ?? "",
                                [dataNotificationsUserGroup]
                            )
                        );

                        const result = await compositionRoot.malDataApproval.updateStatus(items, "duplicate");
                        if (!result) snackbar.error(i18n.t("Error when trying to approve data values"));

                        reload();
                    },
                    isActive: rows => _.every(rows, row => row.lastUpdatedValue) && isMalAdmin,
                },
                {
                    name: "activate",
                    text: i18n.t("Activate monitoring"),
                    icon: <Notifications />,
                    multiple: true,
                    onClick: async (selectedIds: string[]) => {
                        const items = _.compact(selectedIds.map(item => parseDataDuplicationItemId(item)));
                        if (items.length === 0) return;

                        const monitoringValues = items.map(item => {
                            return {
                                orgUnit: item.orgUnitCode ?? item.orgUnit,
                                period: item.period,
                                enable: true,
                            };
                        });
                        const monitoring = await getMonitoringValue();

                        await compositionRoot.malDataApproval.saveMonitoring(
                            Namespaces.MONITORING,
                            getMonitoringJson(
                                monitoring,
                                monitoringValues,
                                "dataSets",
                                config.dataSets[MAL_WMR_FORM]?.name ?? "",
                                [dataNotificationsUserGroup]
                            )
                        );

                        reload();
                    },
                    isActive: rows => _.every(rows, row => !row.monitoring) && isMalAdmin,
                },
                {
                    name: "deactivate",
                    text: i18n.t("Deactivate monitoring"),
                    icon: <NotificationsOff />,
                    multiple: true,
                    onClick: async (selectedIds: string[]) => {
                        const items = _.compact(selectedIds.map(item => parseDataDuplicationItemId(item)));
                        if (items.length === 0) return;

                        const monitoringValues = items.map(item => {
                            return {
                                orgUnit: item.orgUnitCode ?? item.orgUnit,
                                period: item.period,
                                enable: false,
                            };
                        });
                        const monitoring = await getMonitoringValue();

                        await compositionRoot.malDataApproval.saveMonitoring(
                            Namespaces.MONITORING,
                            getMonitoringJson(
                                monitoring,
                                monitoringValues,
                                "dataSets",
                                config.dataSets[MAL_WMR_FORM]?.name ?? "",
                                [dataNotificationsUserGroup]
                            )
                        );

                        reload();
                    },
                    isActive: rows => _.every(rows, row => row.monitoring) && isMalAdmin,
                },
                {
                    name: "getDiff",
                    text: i18n.t("Check Difference"),
                    icon: <PlaylistAddCheck />,
                    onClick: async (selectedIds: string[]) => {
                        disableRevoke();
                        openDialog();
                        setSelected(selectedIds);
                    },
                    isActive: rows =>
                        _.every(rows, row => row.lastUpdatedValue && row.validated === false) &&
                        (isMalApprover || isMalAdmin),
                },
                {
                    name: "getDiffAndRevoke",
                    text: i18n.t("Check Difference"),
                    icon: <PlaylistAddCheck />,
                    onClick: async (selectedIds: string[]) => {
                        enableRevoke();
                        openDialog();
                        setSelected(selectedIds);
                    },
                    isActive: rows =>
                        _.every(rows, row => row.lastUpdatedValue && row.validated === true) &&
                        (isMalApprover || isMalAdmin),
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
            compositionRoot.malDataApproval,
            snackbar,
            reload,
            isMalApprover,
            isMalAdmin,
            getMonitoringJson,
            config.dataSets,
            dataNotificationsUserGroup,
            getMonitoringValue,
            disableRevoke,
            openDialog,
            enableRevoke,
        ]
    );

    const getRows = useMemo(
        () => async (_search: string, paging: TablePagination, sorting: TableSorting<DataApprovalViewModel>) => {
            const { pager, objects } = await compositionRoot.malDataApproval.get({
                config: config,
                paging: { page: paging.page, pageSize: paging.pageSize },
                sorting: getSortingFromTableSorting(sorting),
                useOldPeriods: oldPeriods,
                ...getUseCaseOptions(filters, selectablePeriods),
            });
            const monitoring = await getMonitoringValue();

            console.debug("Reloading", reloadKey);
            return { pager, objects: getDataApprovalViews(config, objects, monitoring) };
        },
        [compositionRoot.malDataApproval, config, oldPeriods, filters, selectablePeriods, reloadKey, getMonitoringValue]
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

    function closeDiffDialog() {
        closeDialog();
        disableRevoke();
        reload();
    }

    function combineMonitoringValues(
        initialMonitoringValues: Monitoring[],
        addedMonitoringValues: Monitoring[]
    ): Monitoring[] {
        const combinedMonitoringValues = addedMonitoringValues.map(added => {
            return initialMonitoringValues.filter(
                initial => initial.orgUnit !== added.orgUnit || initial.period !== added.period
            );
        });
        const combinedMonitoring = _.union(_.intersection(...combinedMonitoringValues), addedMonitoringValues);

        return _.union(combinedMonitoring);
    }

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
                onCancel={closeDiffDialog}
                cancelText={i18n.t("Close")}
                maxWidth="md"
                fullWidth
            >
                <DataDifferencesList
                    selectedIds={selected}
                    revoke={revoke}
                    isMalAdmin={isMalAdmin}
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
