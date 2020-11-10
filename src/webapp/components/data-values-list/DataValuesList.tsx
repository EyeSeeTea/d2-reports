import React from "react";
import _ from "lodash";
import {
    TableColumn,
    TableSorting,
    PaginationOptions,
    TableGlobalAction,
    TablePagination,
} from "d2-ui-components";
import StorageIcon from "@material-ui/icons/Storage";

import i18n from "../../../locales";
import { ObjectsList } from "../objects-list/ObjectsList";
import { TableConfig, useObjectsTable } from "../objects-list/objects-list-hooks";
import { useAppContext } from "../../contexts/app-context";
import { DataValue } from "../../../domain/entities/DataValue";
import { DataValuesFilters, DataValuesFilter, emptyDataValuesFilter } from "./DataValuesFilters";
import { OrgUnitsFilter } from "./OrgUnitsFilter";
import { useSnackbarOnError } from "../../utils/snackbar";
import {
    getRootIds,
    getPath as getMainPath,
    getOrgUnitIdsFromPaths,
} from "../../../domain/entities/OrgUnit";
import { Config } from "../../../domain/entities/Config";
import { Sorting } from "../../../domain/entities/PaginatedObjects";
import { sortByName } from "../../../domain/entities/Base";
import { Typography, makeStyles } from "@material-ui/core";
import { DataValueViewModel, getDataValueViews } from "../../view-models/DataValueViewModel";

export const DataValuesList: React.FC = React.memo(() => {
    const { compositionRoot, config, api } = useAppContext();
    const [filters, setFilters] = React.useState<DataValuesFilter>(emptyDataValuesFilter);
    const rootIds = React.useMemo(() => getRootIds(config.currentUser.orgUnits), [config]);
    const [orgUnitPathsSelected, setOrgUnitPathsSelected] = React.useState(() =>
        getMainUserPaths(config)
    );
    const baseConfig = React.useMemo(getBaseListConfig, []);
    const [sorting, setSorting] = React.useState<TableSorting<DataValueViewModel>>();

    const getRows = React.useMemo(
        () => async (paging: TablePagination, sorting: TableSorting<DataValueViewModel>) => {
            const { pager, objects } = await compositionRoot.dataValues.get.execute({
                config,
                paging: { page: paging.page, pageSize: paging.pageSize },
                sorting: getSortingFromTableSorting(sorting),
                orgUnitIds: getOrgUnitIdsFromPaths(orgUnitPathsSelected),
                ...filters,
            });
            setSorting(sorting);
            return { pager, objects: getDataValueViews(config, objects) };
        },
        [config, compositionRoot, filters, orgUnitPathsSelected]
    );

    const getRowsWithSnackbarOrError = useSnackbarOnError(getRows);
    const tableProps = useObjectsTable(baseConfig, getRowsWithSnackbarOrError);
    const filterOptions = React.useMemo(() => getFilterOptions(config, filters), [config, filters]);
    const classes = useStyles();

    const sideComponents = (
        <OrgUnitsFilter
            api={api}
            rootIds={rootIds}
            selected={orgUnitPathsSelected}
            setSelected={setOrgUnitPathsSelected}
        />
    );

    const downloadCsv: TableGlobalAction = {
        name: "downloadCsv",
        text: "Download CSV",
        icon: <StorageIcon />,
        onClick: async () => {
            if (!sorting) return;
            // Create a new use case that does everything?
            const { objects: dataValues } = await compositionRoot.dataValues.get.execute({
                config,
                paging: { page: 1, pageSize: 100000 },
                sorting: getSortingFromTableSorting(sorting),
                orgUnitIds: getOrgUnitIdsFromPaths(orgUnitPathsSelected),
                ...filters,
            });
            compositionRoot.dataValues.save.execute("data-values.csv", dataValues);
        },
    };

    return (
        <div className={classes.wrapper}>
            <Typography variant="h5" gutterBottom>
                NHWA Comments Report
            </Typography>
            <ObjectsList<DataValueViewModel>
                {...tableProps}
                sideComponents={sideComponents}
                globalActions={[downloadCsv]}
            >
                <DataValuesFilters values={filters} options={filterOptions} onChange={setFilters} />
            </ObjectsList>
        </div>
    );
});

const useStyles = makeStyles({
    wrapper: {
        padding: 10,
    },
});

function getSortingFromTableSorting(sorting: TableSorting<DataValueViewModel>): Sorting<DataValue> {
    return {
        field: sorting.field === "id" ? "period" : sorting.field,
        direction: sorting.order,
    };
}

function getBaseListConfig(): TableConfig<DataValueViewModel> {
    const paginationOptions: PaginationOptions = {
        pageSizeOptions: [10, 20, 50],
        pageSizeInitialValue: 20,
    };

    const initialSorting: TableSorting<DataValueViewModel> = {
        field: "dataSet" as const,
        order: "asc" as const,
    };

    const columns: TableColumn<DataValueViewModel>[] = [
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
        .uniqBy(deg => deg.id)
        .value();

    return {
        periods: config.years,
        dataSets: sortByName(_.values(config.dataSets)),
        sections: sortByName(sections),
    };
}

function getMainUserPaths(config: Config) {
    return _.compact([getMainPath(config.currentUser.orgUnits)]);
}
