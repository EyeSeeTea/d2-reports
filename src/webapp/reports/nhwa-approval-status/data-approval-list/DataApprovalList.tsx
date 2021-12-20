import {
    ObjectsList,
    TableConfig,
    TableColumn,
    TablePagination,
    TableSorting,
    useObjectsTable,
} from "@eyeseetea/d2-ui-components";
import DoneIcon from "@material-ui/icons/Done";
import DoneAllIcon from "@material-ui/icons/DoneAll";
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

const allColumns: TableColumn<DataApprovalViewModel>[] = [
    { name: "orgUnit", text: i18n.t("Organisation unit"), sortable: true },
    { name: "period", text: i18n.t("Period"), sortable: true },
    { name: "dataSet", text: i18n.t("Data set"), sortable: true },
    { name: "attribute", text: i18n.t("Attribute"), sortable: true, hidden: true },
    {
        name: "completed",
        text: i18n.t("Completion status"),
        sortable: true,
        getValue: (row: DataApprovalViewModel) => (row.completed ? "Completed" : "Not completed"),
    },
    {
        name: "validated",
        text: i18n.t("Approval status"),
        sortable: true,
        getValue: (row: DataApprovalViewModel) => (row.validated ? "Approved" : "Ready for approval"),
    },
    { name: "lastUpdatedValue", text: i18n.t("Last updated value"), sortable: true },
];

export const DataApprovalList: React.FC = React.memo(() => {
    const { compositionRoot, config } = useAppContext();
    const [filters, setFilters] = useState(() => getEmptyDataValuesFilter(config));

    const getTableConfigColumns = () => {
        return allColumns;
    };

    const baseConfig: TableConfig<DataApprovalViewModel> = useMemo(
        () => ({
            columns: getTableConfigColumns(),
            actions: [
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
                    name: "approve",
                    text: i18n.t("Approve"),
                    icon: <DoneAllIcon />,
                    multiple: true,
                    onClick: async (selectedIds: string[]) => {
                        if (selectedIds.length === 0) return;
                        //await compositionRoot.dataApproval.approve.execute(selectedIds);
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
                pageSizeInitialValue: 10,
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

            return { pager, objects: getDataApprovalViews(config, objects) };
        },
        [config, compositionRoot, filters]
    );

    /*
    MUST always save all the columns, but the ones selected in columnNames
    are the only visible ones
    */
    const saveoReorderedColumns = (columnNames: Array<keyof DataApprovalViewModel>) => {
        const selectedColumns = columnNames.map(name => allColumns.find(column => name === column.name));

        console.debug(JSON.stringify(selectedColumns));
    };

    const tableProps = useObjectsTable(baseConfig, getRows);
    const filterOptions = React.useMemo(() => getFilterOptions(config), [config]);

    return (
        <ObjectsList<DataApprovalViewModel>
            {...tableProps}
            onChangeSearch={undefined}
            onReorderColumns={saveoReorderedColumns}
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
