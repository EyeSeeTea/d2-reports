import {
    PaginationOptions,
    TableColumn,
    TableGlobalAction,
    TablePagination,
    TableSorting,
} from "@eyeseetea/d2-ui-components";
import StorageIcon from "@material-ui/icons/Storage";
import RestartAltIcon from "@material-ui/icons/Storage";
import _ from "lodash";
import React from "react";
import { sortByName } from "../../../../domain/common/entities/Base";
import { Config, getMainUserPaths } from "../../../../domain/common/entities/Config";
import { getOrgUnitIdsFromPaths } from "../../../../domain/common/entities/OrgUnit";
import { Sorting } from "../../../../domain/common/entities/PaginatedObjects";
import { DataCommentsItem } from "../../../../domain/nhwa-comments/entities/DataCommentsItem";
import i18n from "../../../../locales";
import { TableConfig, useObjectsTable } from "../../../components/objects-list/objects-list-hooks";
import { ObjectsList } from "../../../components/objects-list/ObjectsList";
import { useAppContext } from "../../../contexts/app-context";
import { useSnackbarOnError } from "../../../utils/snackbar";
import { DataCommentsViewModel, getDataCommentsViews } from "../DataCommentsViewModel";
import { DataValuesFilter } from "./Filters";
import { FiltersBox } from "./FiltersBox";

export const DataCommentsList: React.FC = React.memo(() => {
    let oldYears = false;
    const { compositionRoot, config } = useAppContext();
    const [filters, setFilters] = React.useState(() => getEmptyDataValuesFilter(config));
    const baseConfig = React.useMemo(getBaseListConfig, []);
    const [sorting, setSorting] = React.useState<TableSorting<DataCommentsViewModel>>();
    const getRows = React.useMemo(
        () => async (paging: TablePagination, sorting: TableSorting<DataCommentsViewModel>) => {
            switchYears(oldYears, config, filters);

            const { pager, objects } = await compositionRoot.dataComments.get({
                config,
                paging: { page: paging.page, pageSize: paging.pageSize },
                sorting: getSortingFromTableSorting(sorting),
                ...getUseCaseOptions(filters),
            });
            setSorting(sorting);
            return { pager, objects: getDataCommentsViews(config, objects) };
        },
        // eslint-disable-next-line
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

            const { objects: dataValues } = await compositionRoot.dataComments.get({
                config,
                paging: { page: 1, pageSize: 100000 },
                sorting: getSortingFromTableSorting(sorting),
                ...getUseCaseOptions(filters),
            });
            compositionRoot.dataComments.save("data-values.csv", dataValues);
        },
    };

    const allYearsToggle: TableGlobalAction = {
        name: "allyears",
        text: "Switch Years",
        icon: <RestartAltIcon />,
        onClick: async () => {
            if (!sorting) return;
            oldYears = !oldYears;
            switchYears(oldYears, config, filters);

            const { pager, objects } = await compositionRoot.dataComments.get({
                config,
                paging: { page: 1, pageSize: 20 },
                sorting: getSortingFromTableSorting(sorting),
                ...getUseCaseOptions(filters),
            });
            setSorting(sorting);
            setFilters(filters);

            return { pager, objects: getDataCommentsViews(config, objects) };
        },
    };
    return (
        <ObjectsList<DataCommentsViewModel> {...tableProps} globalActions={[downloadCsv, allYearsToggle]}>
            <FiltersBox showToggleButton={false} values={filters} options={filterOptions} onChange={setFilters} />
        </ObjectsList>
    );
});

function switchYears(oldYears: boolean, config: Config, filters: DataValuesFilter) {
    const currentYear = new Date().getFullYear();
    const years = oldYears
        ? _.range(currentYear - 40, currentYear - 10).map(n => n.toString())
        : _.range(currentYear - 10, currentYear + 1).map(n => n.toString());
    config.years = years;
    filters.periods = config.years.slice(config.years.length, config.years.length) ?? filters.periods;
}

function getUseCaseOptions(filter: DataValuesFilter) {
    return {
        ...filter,
        orgUnitIds: getOrgUnitIdsFromPaths(filter.orgUnitPaths),
    };
}

function getSortingFromTableSorting(sorting: TableSorting<DataCommentsViewModel>): Sorting<DataCommentsItem> {
    return {
        field: sorting.field === "id" ? "period" : sorting.field,
        direction: sorting.order,
    };
}

function getBaseListConfig(): TableConfig<DataCommentsViewModel> {
    const paginationOptions: PaginationOptions = {
        pageSizeOptions: [10, 20, 50],
        pageSizeInitialValue: 10,
    };

    const initialSorting: TableSorting<DataCommentsViewModel> = {
        field: "dataSet" as const,
        order: "asc" as const,
    };

    const columns: TableColumn<DataCommentsViewModel>[] = [
        { name: "dataSet", text: i18n.t("Data set"), sortable: true },
        { name: "period", text: i18n.t("Period"), sortable: true },
        { name: "orgUnit", text: i18n.t("Organisation unit"), sortable: true },
        { name: "section", text: i18n.t("Section"), sortable: true },
        { name: "dataElement", text: i18n.t("Data Element"), sortable: true },
        { name: "categoryOptionCombo", text: i18n.t("Category option combo"), sortable: true },
        { name: "value", text: i18n.t("Value"), sortable: true },
        { name: "comment", text: i18n.t("Comment"), sortable: true },
        { name: "lastUpdated", text: i18n.t("Last updated"), sortable: true, hidden: true },
        { name: "storedBy", text: i18n.t("Stored by"), sortable: true, hidden: true },
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
