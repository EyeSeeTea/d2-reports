import React from "react";
import _ from "lodash";
import {
    TableColumn,
    TableSorting,
    PaginationOptions,
    TableGlobalAction,
    TablePagination,
} from "@eyeseetea/d2-ui-components";
import StorageIcon from "@material-ui/icons/Storage";

import i18n from "../../../locales";
import { ObjectsList } from "../objects-list/ObjectsList";
import { TableConfig, useObjectsTable } from "../objects-list/objects-list-hooks";
import { useAppContext } from "../../contexts/app-context";
import { DataSet } from "../../../domain/entities/DataSet";
import { DataSetsFilter } from "./DataSetsFilters";
import { useSnackbarOnError } from "../../utils/snackbar";
import { Config, getMainUserPaths } from "../../../domain/entities/Config";
import { Sorting } from "../../../domain/entities/PaginatedObjects";
import { sortByName } from "../../../domain/entities/Base";
import { DataSetViewModel, getDataSetViews } from "../../view-models/DataSetViewModel";
import { getOrgUnitIdsFromPaths } from "../../../domain/entities/OrgUnit";
import { FiltersBox } from "./FiltersBox";

export const DataSetList: React.FC = React.memo(() => {
    const { compositionRoot, config } = useAppContext();
    const [filters, setFilters] = React.useState(() => getEmptyDataValuesFilter(config));
    const baseConfig = React.useMemo(getBaseListConfig, []);
    const [sorting, setSorting] = React.useState<TableSorting<DataSetViewModel>>();

    const getRows = React.useMemo(
        () => async (paging: TablePagination, sorting: TableSorting<DataSetViewModel>) => {
            const { pager, objects } = await compositionRoot.dataSets.get.execute({
                config,
                paging: { page: paging.page, pageSize: paging.pageSize },
                sorting: getSortingFromTableSorting(sorting),
                ...getUseCaseOptions(filters),
            });
            setSorting(sorting);
            return { pager, objects: getDataSetViews(config, objects) };
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
            const { objects: dataSets } = await compositionRoot.dataSets.get.execute({
                config,
                paging: { page: 1, pageSize: 100000 },
                sorting: getSortingFromTableSorting(sorting),
                ...getUseCaseOptions(filters),
            });
            compositionRoot.dataSets.save.execute("data-sets.csv", dataSets);
        },
    };

    return (
        <ObjectsList<DataSetViewModel> {...tableProps} globalActions={[downloadCsv]}>
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

function getSortingFromTableSorting(sorting: TableSorting<DataSetViewModel>): Sorting<DataSet> {
    return {
        field: sorting.field === "id" ? "period" : sorting.field,
        direction: sorting.order,
    };
}

function getBaseListConfig(): TableConfig<DataSetViewModel> {
    const paginationOptions: PaginationOptions = {
        pageSizeOptions: [10, 20, 50],
        pageSizeInitialValue: 20,
    };

    const initialSorting: TableSorting<DataSetViewModel> = {
        field: "dataSet" as const,
        order: "asc" as const,
    };

    const columns: TableColumn<DataSetViewModel>[] = [
        { name: "dataSet", text: i18n.t("Data set"), sortable: true },
        { name: "orgUnit", text: i18n.t("Organisation unit"), sortable: true },
        { name: "period", text: i18n.t("Period"), sortable: true },
        { name: "completed", text: i18n.t("Completed"), sortable: true },
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
        orgUnitPaths: getMainUserPaths(config),
        periods: [],
        completionStatus: [],
    };
}
