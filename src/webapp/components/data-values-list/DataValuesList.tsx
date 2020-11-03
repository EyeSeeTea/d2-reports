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
import { DataValue, getDataValueId } from "../../../domain/entities/DataValue";
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

interface DataValueView {
    id: string;
    period: string;
    orgUnit: string;
    dataSet: string;
    dataElementGroup: string;
    dataElement: string;
    categoryOptionCombo: string;
    value: string;
    comment: string;
    lastUpdated: string;
    storedBy: string;
}

export const DataValuesList: React.FC = React.memo(() => {
    const { compositionRoot, config, api } = useAppContext();
    const [filters, setFilters] = React.useState<DataValuesFilter>(emptyDataValuesFilter);
    const rootIds = React.useMemo(() => getRootIds(config.currentUser.orgUnits), [config]);
    const [orgUnitPathsSelected, setOrgUnitPathsSelected] = React.useState(() =>
        getMainUserPaths(config)
    );
    const baseConfig = React.useMemo(getBaseListConfig, []);
    const [sorting, setSorting] = React.useState<TableSorting<DataValueView>>();

    const getRows = React.useMemo(
        () => async (paging: TablePagination, sorting: TableSorting<DataValueView>) => {
            const { pager, objects } = await compositionRoot.dataValues.get.execute({
                config,
                paging,
                sorting: getSortingFromTableSorting(sorting),
                orgUnitIds: getOrgUnitIdsFromPaths(orgUnitPathsSelected),
                ...filters,
            });
            setSorting(sorting);
            return { pager, objects: getDataValueViews(objects) };
        },
        [config, compositionRoot, filters, orgUnitPathsSelected]
    );

    const getRowsWithSnackbarOrError = useSnackbarOnError(getRows);
    const tableProps = useObjectsTable(baseConfig, getRowsWithSnackbarOrError);
    const filterOptions = React.useMemo(() => getFilterOptions(config, filters), [config, filters]);

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
            compositionRoot.dataValues.saveCsv.execute("data-values.csv", dataValues);
        },
    };

    // TODO: Check if there are unnecessary re-renders
    return (
        <ObjectsList<DataValueView>
            {...tableProps}
            sideComponents={sideComponents}
            globalActions={[downloadCsv]}
        >
            <DataValuesFilters values={filters} options={filterOptions} onChange={setFilters} />
        </ObjectsList>
    );
});

function getSortingFromTableSorting(sorting: TableSorting<DataValueView>): Sorting<DataValue> {
    return {
        field: sorting.field === "id" ? "period" : sorting.field,
        direction: sorting.order,
    };
}

function getBaseListConfig(): TableConfig<DataValueView> {
    const paginationOptions: PaginationOptions = {
        pageSizeOptions: [10, 20, 50],
        pageSizeInitialValue: 20,
    };

    const initialSorting: TableSorting<DataValueView> = {
        field: "dataSet" as const,
        order: "asc" as const,
    };

    const columns: TableColumn<DataValueView>[] = [
        { name: "dataSet", text: i18n.t("Data set"), sortable: true },
        { name: "period", text: i18n.t("Period"), sortable: true },
        { name: "orgUnit", text: i18n.t("Organisation unit"), sortable: true },
        { name: "dataElementGroup", text: i18n.t("Data Element Group"), sortable: true },
        { name: "dataElement", text: i18n.t("Data Element"), sortable: true },
        { name: "categoryOptionCombo", text: i18n.t("Category option combo"), sortable: true },
        { name: "value", text: i18n.t("Value"), sortable: true },
        { name: "comment", text: i18n.t("Comment"), sortable: true },
        { name: "lastUpdated", text: i18n.t("Last updated"), sortable: true },
        { name: "storedBy", text: i18n.t("Stored by"), sortable: true },
    ];

    return { columns, initialSorting, paginationOptions };
}

function getDataValueViews(dataValues: DataValue[]): DataValueView[] {
    return dataValues.map(dataValue => {
        return {
            id: getDataValueId(dataValue),
            period: dataValue.period,
            orgUnit: dataValue.orgUnit.name,
            dataSet: dataValue.dataSet.name,
            dataElement: dataValue.dataElement.name,
            dataElementGroup: dataValue.dataElementGroup.name,
            categoryOptionCombo: dataValue.categoryOptionCombo.name,
            value: dataValue.value,
            comment: dataValue.comment || "",
            lastUpdated: dataValue.lastUpdated.toISOString(),
            storedBy: dataValue.storedBy,
        };
    });
}

function getFilterOptions(config: Config, filters: DataValuesFilter) {
    const { dataSetIds } = filters;
    const dataElementGroups = _(config.dataElementGroupsByDataSet)
        .at(_.isEmpty(dataSetIds) ? _.keys(config.dataElementGroupsByDataSet) : dataSetIds)
        .flatten()
        .uniqBy(deg => deg.id)
        .value();

    return {
        // TODO: Check other usages of this range and abstract (use current - 10 years)
        periods: _.range(2010, new Date().getFullYear() + 1).map(n => n.toString()),
        dataSets: sortByName(_.values(config.dataSets)),
        dataElementGroups: sortByName(dataElementGroups),
    };
}

function getMainUserPaths(config: Config) {
    return _.compact([getMainPath(config.currentUser.orgUnits)]);
}
