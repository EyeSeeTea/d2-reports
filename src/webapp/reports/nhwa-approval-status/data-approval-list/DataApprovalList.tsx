import {
    ObjectsList,
    TableConfig,
    TableGlobalAction,
    TablePagination,
    TableSorting,
    useObjectsTable
} from "@eyeseetea/d2-ui-components";
import DoneIcon from "@material-ui/icons/Done";
import DoneAllIcon from "@material-ui/icons/DoneAll";
import StorageIcon from "@material-ui/icons/Storage";
import _ from "lodash";
import React, { useMemo, useState } from "react";
import { sortByName } from "../../../../domain/common/entities/Base";
import { Config } from "../../../../domain/common/entities/Config";
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
    const [sorting, setSorting] = useState<TableSorting<DataApprovalViewModel>>();

    const baseConfig: TableConfig<DataApprovalViewModel> = useMemo(
        () => ({
            columns: [
                { name: "dataSet", text: i18n.t("Data set"), sortable: true },
                { name: "orgUnit", text: i18n.t("Organisation unit"), sortable: true },
                { name: "period", text: i18n.t("Period"), sortable: true },
                {
                    name: "completed",
                    text: i18n.t("Completed"),
                    sortable: true,
                    getValue: row => (row.completed ? "Yes" : "No"),
                },
                {
                    name: "validated",
                    text: i18n.t("Validated"),
                    sortable: true,
                    getValue: row => (row.validated ? "Yes" : "No"),
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
                        //await compositionRoot.dataApproval.complete.execute(selectedIds);
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
                        //await compositionRoot.dataApproval.approve.execute(selectedIds);
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
            initialSorting: {
                field: "dataSet" as const,
                order: "asc" as const,
            },
            paginationOptions: {
                pageSizeOptions: [10, 20, 50],
                pageSizeInitialValue: 20,
            },
        }),
        []
    );

    const getRows = useMemo(
        () => async (_search: string, paging: TablePagination, sorting: TableSorting<DataApprovalViewModel>) => {
            const { pager, objects } = await compositionRoot.dataApproval.get.execute({
                config,
                paging: { page: paging.page, pageSize: paging.pageSize },
                sorting: getSortingFromTableSorting(sorting),
                ...getUseCaseOptions(filters),
            });
            setSorting(sorting);
            return { pager, objects: getDataApprovalViews(config, objects) };
        },
        [config, compositionRoot, filters]
    );

    const tableProps = useObjectsTable(baseConfig, getRows);
    const filterOptions = React.useMemo(() => getFilterOptions(config), [config]);

    const downloadCsv: TableGlobalAction = {
        name: "downloadCsv",
        text: "Download CSV",
        icon: <StorageIcon />,
        onClick: async () => {
            if (!sorting) return;
            // FUTURE: create a single use case that performs the get+saveCSV
            const { objects: dataSets } = await compositionRoot.dataApproval.get.execute({
                config,
                paging: { page: 1, pageSize: 100000 },
                sorting: getSortingFromTableSorting(sorting),
                ...getUseCaseOptions(filters),
            });
            compositionRoot.dataApproval.save.execute("data-sets.csv", dataSets);
        },
    };

    return (
        <ObjectsList<DataApprovalViewModel> {...tableProps} globalActions={[downloadCsv]} onChangeSearch={undefined}>
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
        completionStatus: config.completionStatus,
        approvalWorkflow: config.approvalWorkflow,
    };
}

function getEmptyDataValuesFilter(_config: Config): DataSetsFilter {
    return {
        dataSetIds: [],
        orgUnitPaths: [],
        periods: [],
        completionStatus: [],
        approvalWorkflow: [],
    };
}
