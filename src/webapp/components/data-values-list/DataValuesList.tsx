import React from "react";
import _ from "lodash";
import { TableColumn, TableSorting, PaginationOptions, useSnackbar } from "d2-ui-components";

import i18n from "../../../locales";
import { ObjectsList } from "../objects-list/ObjectsList";
import { TableConfig, useObjectsTable } from "../objects-list/objects-list-hooks";
import { useAppContext } from "../../contexts/app-context";
import { DataValue } from "../../../domain/entities/DataValue";
import { DataValuesFilters, DataValuesFilter } from "./DataValuesFilters";
import { OrgUnitsFilter } from "./OrgUnitsFilter";
import { useSnackbarOnError as withSnackbarOnError } from "../../utils/snackbar";
import {
    getRootIds,
    getPath as getMainPath,
    getOrgUnitIdsFromPaths,
} from "../../../domain/entities/OrgUnit";
import { Config } from "../../../domain/entities/Config";

interface DataValueView {
    id: string;
    period: string;
    orgUnit: string;
    dataSet: string;
    dataElement: string;
    categoryOptionCombo: string;
    value: string;
    comment: string;
    lastUpdated: string;
    storedBy: string;
}

export const DataValuesList: React.FC = React.memo(() => {
    const { compositionRoot, config, api } = useAppContext();
    const snackbar = useSnackbar();
    const [filters, setFilters] = React.useState<DataValuesFilter>({ periods: [], dataSets: [] });
    const rootIds = React.useMemo(() => getRootIds(config.currentUser.orgUnits), [config]);
    const [orgUnitPathsSelected, setOrgUnitPathsSelected] = React.useState(() =>
        getMainUserPaths(config)
    );
    const baseConfig = React.useMemo(getBaseListConfig, []);

    const getRows = React.useCallback(() => {
        return withSnackbarOnError(snackbar, async () => {
            const dataValues = await compositionRoot.dataValues.get.execute({
                config,
                orgUnitIds: getOrgUnitIdsFromPaths(orgUnitPathsSelected),
                ...filters,
            });
            return { objects: getDataValueViews(dataValues), pager: {} };
        });
    }, [config, compositionRoot, snackbar, filters, orgUnitPathsSelected]);

    const tableProps = useObjectsTable(baseConfig, getRows);
    const filterOptions = React.useMemo(() => getFilterOptions(config), [config]);

    const sideComponents = (
        <OrgUnitsFilter
            api={api}
            rootIds={rootIds}
            selected={orgUnitPathsSelected}
            setSelected={setOrgUnitPathsSelected}
        />
    );

    return (
        <ObjectsList<DataValueView> {...tableProps} sideComponents={sideComponents}>
            <DataValuesFilters values={filters} options={filterOptions} onChange={setFilters} />
        </ObjectsList>
    );
});

function getBaseListConfig(): Omit<TableConfig<DataValueView>, "getRows"> {
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
    return dataValues.map(dv => {
        return {
            id: dv.id,
            period: dv.period,
            orgUnit: dv.orgUnit.name,
            dataSet: dv.dataSets.map(dataSet => dataSet.name).join(", "),
            dataElement: dv.dataElement.name,
            categoryOptionCombo: dv.categoryOptionCombo.name,
            value: dv.value,
            comment: dv.comment || "",
            lastUpdated: dv.lastUpdated.toISOString(),
            storedBy: dv.storedBy,
        };
    });
}

function getFilterOptions(config: Config) {
    return {
        periods: _.range(2010, new Date().getFullYear()).map(n => n.toString()),
        dataSets: _.values(config.dataSets),
    };
}

function getMainUserPaths(config: Config) {
    return _.compact([getMainPath(config.currentUser.orgUnits)]);
}
