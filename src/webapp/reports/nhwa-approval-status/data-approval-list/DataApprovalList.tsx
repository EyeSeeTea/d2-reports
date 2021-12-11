import {
    PaginationOptions, TableColumn, TableGlobalAction,
    TablePagination, TableSorting
} from "@eyeseetea/d2-ui-components";
import StorageIcon from "@material-ui/icons/Storage";
import _ from "lodash";
import React from "react";
import { sortByName } from "../../../../domain/common/entities/Base";
import { Config } from "../../../../domain/common/entities/Config";
import { getOrgUnitIdsFromPaths } from "../../../../domain/common/entities/OrgUnit";
import { Sorting } from "../../../../domain/common/entities/PaginatedObjects";
import { DataApprovalItem } from "../../../../domain/nhwa-approval-status/entities/DataApprovalItem";
import i18n from "../../../../locales";
import { TableConfig, useObjectsTable } from "../../../components/objects-list/objects-list-hooks";
import { ObjectsList } from "../../../components/objects-list/ObjectsList";
import { useAppContext } from "../../../contexts/app-context";
import { useSnackbarOnError } from "../../../utils/snackbar";
import { DataApprovalViewModel, getDataApprovalViews } from "../DataApprovalViewModel";
import { DataSetsFilter } from "./Filters";
import { FiltersBox } from "./FiltersBox";

export const DataApprovalList: React.FC = React.memo(() => {
    const { compositionRoot, config } = useAppContext();
    const [filters, setFilters] = React.useState(() => getEmptyDataValuesFilter(config));
    const baseConfig = React.useMemo(getBaseListConfig, []);
    const [sorting, setSorting] = React.useState<TableSorting<DataApprovalViewModel>>();

    const getRows = React.useMemo(
        () => async (paging: TablePagination, sorting: TableSorting<DataApprovalViewModel>) => {
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

    const getRowsWithSnackbarOrError = useSnackbarOnError(getRows);
    const tableProps = useObjectsTable(baseConfig, getRowsWithSnackbarOrError);
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
        <ObjectsList<DataApprovalViewModel> {...tableProps} globalActions={[downloadCsv]}>
            <FiltersBox showToggleButton={false} values={filters} options={filterOptions} onChange={setFilters} />
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

function getBaseListConfig(): TableConfig<DataApprovalViewModel> {
    const paginationOptions: PaginationOptions = {
        pageSizeOptions: [10, 20, 50],
        pageSizeInitialValue: 20,
    };

    const initialSorting: TableSorting<DataApprovalViewModel> = {
        field: "dataSet" as const,
        order: "asc" as const,
    };

    const columns: TableColumn<DataApprovalViewModel>[] = [
        { name: "dataSet", text: i18n.t("Data set"), sortable: true },
        { name: "orgUnit", text: i18n.t("Organisation unit"), sortable: true },
        { name: "period", text: i18n.t("Period"), sortable: true },
        { name: "completed", text: i18n.t("Completed"), sortable: true, getValue: (row) => row.completed ? "Yes" : "No" },
        { name: "validated", text: i18n.t("Validated"), sortable: true, getValue: (row) => row.validated ? "Yes" : "No" },
        { name: "lastUpdatedValue", text: i18n.t("Last updated value"), sortable: true },
    ];

    return { columns, initialSorting, paginationOptions };
}

function getFilterOptions(config: Config) {
    console.log("GET FILTER OPTIONS", config);
    return {
        dataSets: sortByName(_.values(config.dataSets)),
        periods: config.years,
        completionStatus: config.completionStatus,
    };
}

function getEmptyDataValuesFilter(config: Config): DataSetsFilter {
    return {
        dataSetIds: [],
        orgUnitPaths: [],
        periods: [],
        completionStatus: [],
    };
}
