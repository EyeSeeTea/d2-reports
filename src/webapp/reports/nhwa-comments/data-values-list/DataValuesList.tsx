import {
    PaginationOptions,
    TableColumn,
    TableGlobalAction,
    TablePagination,
    TableSorting,
} from "@eyeseetea/d2-ui-components";
import StorageIcon from "@material-ui/icons/Storage";
import _ from "lodash";
import React from "react";
import { sortByName } from "../../../../domain/entities/Base";
import { Config, getMainUserPaths } from "../../../../domain/entities/Config";
import { DataValue } from "../../../../domain/entities/DataValue";
import { getOrgUnitIdsFromPaths } from "../../../../domain/entities/OrgUnit";
import { Sorting } from "../../../../domain/entities/PaginatedObjects";
import i18n from "../../../../locales";
import { TableConfig, useObjectsTable } from "../../../components/objects-list/objects-list-hooks";
import { ObjectsList } from "../../../components/objects-list/ObjectsList";
import { useAppContext } from "../../../contexts/app-context";
import { useSnackbarOnError } from "../../../utils/snackbar";
import { DataValueViewModel, getDataValueViews } from "../../../view-models/DataValueViewModel";
import { DataValuesFilter } from "./DataValuesFilters";
import { FiltersBox } from "./FiltersBox";

export const DataValuesList: React.FC = React.memo(() => {
    const { compositionRoot, config } = useAppContext();
    const [filters, setFilters] = React.useState(() => getEmptyDataValuesFilter(config));
    const baseConfig = React.useMemo(getBaseListConfig, []);
    const [sorting, setSorting] = React.useState<TableSorting<DataValueViewModel>>();

    const getRows = React.useMemo(
        () => async (paging: TablePagination, sorting: TableSorting<DataValueViewModel>) => {
            const { pager, objects } = await compositionRoot.dataValues.get.execute({
                config,
                paging: { page: paging.page, pageSize: paging.pageSize },
                sorting: getSortingFromTableSorting(sorting),
                ...getUseCaseOptions(filters),
            });
            setSorting(sorting);
            return { pager, objects: getDataValueViews(config, objects) };
        },
        [config, compositionRoot, filters]
    );

    const getRowsWithSnackbarOrError = useSnackbarOnError(getRows);
    const tableProps = useObjectsTable(baseConfig, getRowsWithSnackbarOrError);
    const filterOptions = React.useMemo(() => getFilterOptions(config, filters), [config, filters]);

    const downloadCsv: TableGlobalAction = {
        name: "downloadCsv",
        text: "Download CSV",
        icon: <StorageIcon />,
        onClick: async () => {
            if (!sorting) return;
            // FUTURE: create a single use case that performs the get+saveCSV
            const { objects: dataValues } = await compositionRoot.dataValues.get.execute({
                config,
                paging: { page: 1, pageSize: 100000 },
                sorting: getSortingFromTableSorting(sorting),
                ...getUseCaseOptions(filters),
            });
            compositionRoot.dataValues.save.execute("data-values.csv", dataValues);
        },
    };

    return (
        <ObjectsList<DataValueViewModel> {...tableProps} globalActions={[downloadCsv]}>
            <FiltersBox showToggleButton={false} values={filters} options={filterOptions} onChange={setFilters} />
        </ObjectsList>
    );
});

function getUseCaseOptions(filter: DataValuesFilter) {
    return {
        ...filter,
        orgUnitIds: getOrgUnitIdsFromPaths(filter.orgUnitPaths),
    };
}

function getSortingFromTableSorting(sorting: TableSorting<DataValueViewModel>): Sorting<DataValue> {
    return {
        field: sorting.field === "id" ? "period" : sorting.field,
        direction: sorting.order,
    };
}

function getBaseListConfig(): TableConfig<DataValueViewModel> {
    const paginationOptions: PaginationOptions = {
        pageSizeOptions: [10, 20, 50, 1000],
        pageSizeInitialValue: 1000,
    };

    const initialSorting: TableSorting<DataValueViewModel> = {
        field: "dataSet" as const,
        order: "asc" as const,
    };

    const columns: TableColumn<DataValueViewModel>[] = [
        { name: "dataSet", text: i18n.t("Data set"), sortable: true },
        { name: "orgUnit", text: i18n.t("Organisation unit"), sortable: true },
        { name: "period", text: i18n.t("Period"), sortable: true },
        { name: "section", text: i18n.t("Section"), sortable: true, hidden: true },
        { name: "dataElement", text: i18n.t("Data Element"), sortable: true, hidden: true },
        { name: "categoryOptionCombo", text: i18n.t("Category option combo"), sortable: true, hidden: true },
        { name: "value", text: i18n.t("Value"), sortable: true, hidden: true },
        { name: "comment", text: i18n.t("Comment"), sortable: true, hidden: true },
        { name: "lastUpdated", text: i18n.t("Last updated"), sortable: true, hidden: true },
        { name: "storedBy", text: i18n.t("Stored by"), sortable: true, hidden: true },
        {
            name: "completed",
            text: i18n.t("Completed"),
            sortable: true,
            hidden: false,
            getValue: () => (Math.random() > 0.5 ? "Yes" : "No"),
        },
        {
            name: "validated",
            text: i18n.t("Validated"),
            sortable: true,
            hidden: false,
            getValue: () => (Math.random() > 0.5 ? "Yes" : "No"),
        },
    ];

    return { columns, initialSorting, paginationOptions };
}

function getFilterOptions(config: Config, filters: DataValuesFilter) {
    const { dataSetIds } = filters;
    const sections = _(config.sectionsByDataSet)
        .at(_.isEmpty(dataSetIds) ? _.keys(config.sectionsByDataSet) : dataSetIds)
        .flatten()
        .compact()
        .uniqBy(section => section.id)
        .value();

    return {
        periods: config.years,
        dataSets: sortByName(_.values(config.dataSets)),
        sections: sortByName(sections),
    };
}

function getEmptyDataValuesFilter(config: Config): DataValuesFilter {
    return {
        orgUnitPaths: getMainUserPaths(config),
        periods: [],
        dataSetIds: [],
        sectionIds: [],
    };
}
