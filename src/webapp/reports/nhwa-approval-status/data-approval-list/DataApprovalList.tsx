import { ObjectsList, TableConfig, TablePagination, TableSorting, useObjectsTable } from "@eyeseetea/d2-ui-components";
import DoneIcon from "@material-ui/icons/Done";
import DoneAllIcon from "@material-ui/icons/DoneAll";
import StorageIcon from "@material-ui/icons/Storage";
import _ from "lodash";
import React, { useMemo, useState } from "react";
import { sortByName } from "../../../../domain/common/entities/Base";
import { Config, getMainUserPaths } from "../../../../domain/common/entities/Config";
import { getOrgUnitIdsFromPaths } from "../../../../domain/common/entities/OrgUnit";
import { Sorting } from "../../../../domain/common/entities/PaginatedObjects";
import { DataApprovalItem } from "../../../../domain/nhwa-approval-status/entities/DataApprovalItem";
import i18n from "../../../../locales";
import { useAppContext } from "../../../contexts/app-context";
import { DataApprovalViewModel, getDataApprovalViews } from "../DataApprovalViewModel";
import { DataSetsFilter, Filters } from "./Filters";

export const DataApprovalList: React.FC = React.memo(() => {
    const { compositionRoot, config } = useAppContext();
    const [filters, setFilters] = useState(() => getEmptyDataValuesFilter(config));

    const getDataApprovalItems = React.useCallback(
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
                await compositionRoot.dataApproval.get.execute({
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
                { name: "dataSetUid", text: i18n.t("datasetUid"), sortable: false, hidden: true },
                { name: "dataSet", text: i18n.t("Data set"), sortable: true },
                { name: "orgUnitUid", text: i18n.t("orgUnitUid"), sortable: false, hidden: true },
                { name: "orgUnit", text: i18n.t("Organisation unit"), sortable: true },
                { name: "period", text: i18n.t("Period"), sortable: true },
                { name: "attribute", text: i18n.t("Attribute"), sortable: true, hidden: true },
                { name: "approvalWorkflow", text: i18n.t("Workflow"), sortable: true, hidden: true },
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
                    name: "goToDataEntry",
                    text: i18n.t("Go to data entry"),
                    icon: <StorageIcon />,
                    multiple: false,
                    primary: true,
                    onClick: async (selectedIds: string[]) => {
                        if (selectedIds.length === 0) return;
                        //const dataApprovalItem = await compositionRoot.dataApproval.get.execute(selectedIds[0]);
                        //compositionRoot.router.goToDataEntry(dataApprovalItem.dataSetId, dataApprovalItem.period);
                    },
                },
                {
                    name: "complete",
                    text: i18n.t("Complete"),
                    icon: <DoneIcon />,
                    multiple: true,
                    onClick: async (selectedIds: string[]) => {
                        if (selectedIds.length === 0) return;

                        const dataApprovalItems = await getDataApprovalItems(selectedIds);
                        const success = await compositionRoot.dataApproval.complete.execute(dataApprovalItems);
                    },
                },
                {
                    name: "completeAllBelow",
                    text: i18n.t("Complete all below"),
                    icon: <DoneAllIcon />,
                    multiple: true,
                    onClick: async (selectedIds: string[]) => {
                        if (selectedIds.length === 0) return;
                        //await compositionRoot.dataApproval.completeAllBelow.execute(selectedIds);
                    },
                },
                {
                    name: "approve",
                    text: i18n.t("Approve"),
                    icon: <DoneIcon />,
                    multiple: true,
                    onClick: async (selectedIds: string[]) => {
                        if (selectedIds.length === 0) return;

                        const dataApprovalItems = await getDataApprovalItems(selectedIds);
                        const success = await compositionRoot.dataApproval.approve.execute(dataApprovalItems);
                    },
                },
                {
                    name: "approveAllBelow",
                    text: i18n.t("Approve all below"),
                    icon: <DoneAllIcon />,
                    multiple: true,
                    onClick: async (selectedIds: string[]) => {
                        if (selectedIds.length === 0) return;
                        //await compositionRoot.dataApproval.approveAllBelow.execute(selectedIds);
                    },
                },
            ],
            // TODO: To be validated with Nacho
            initialSorting: {
                field: "dataSet" as const,
                order: "asc" as const,
            },
            paginationOptions: {
                pageSizeOptions: [10, 20, 50],
                pageSizeInitialValue: 20,
            },
        }),
        [getDataApprovalItems, compositionRoot]
    );

    const getRows = useMemo(
        () => async (_search: string, paging: TablePagination, sorting: TableSorting<DataApprovalViewModel>) => {
            const { pager, objects } = await compositionRoot.dataApproval.get.execute({
                config,
                paging: { page: paging.page, pageSize: paging.pageSize },
                sorting: getSortingFromTableSorting(sorting),
                ...getUseCaseOptions(filters),
            });

            return { pager, objects: getDataApprovalViews(config, objects) };
        },
        [config, compositionRoot, filters]
    );

    const tableProps = useObjectsTable(baseConfig, getRows);
    const filterOptions = React.useMemo(() => getFilterOptions(config), [config]);

    return (
        <ObjectsList<DataApprovalViewModel> {...tableProps} onChangeSearch={undefined}>
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

function getEmptyDataValuesFilter(config: Config): DataSetsFilter {
    return {
        dataSetIds: [],
        orgUnitPaths: getMainUserPaths(config),
        periods: [],
        approvalWorkflow: [],
        completionStatus: undefined,
        approvalStatus: undefined,
    };
}
