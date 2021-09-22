import React from "react";
import _ from "lodash";
import { TableColumn, TableSorting, PaginationOptions, TableGlobalAction, TablePagination } from "d2-ui-components";
import StorageIcon from "@material-ui/icons/Storage";

import i18n from "../../../locales";
import { ObjectsList } from "../objects-list/ObjectsList";
import { TableConfig, useObjectsTable } from "../objects-list/objects-list-hooks";
import { useAppContext } from "../../contexts/app-context";
import { useSnackbarOnError } from "../../utils/snackbar";
import { Config } from "../../../domain/entities/Config";
import { Sorting } from "../../../domain/entities/PaginatedObjects";
import { sortByName } from "../../../domain/entities/Base";
import { getMetadataViews, MetadataObjectViewModel } from "../../view-models/MetadataObjectViewModel";
import { MetadataObject } from "../../../domain/entities/MetadataObject";
import { FiltersBox } from "../data-values-list/FiltersBox";
import { MetadataObjectsFilter } from "./MetadataFilters";

export const MetadataList: React.FC = React.memo(() => {
    const { compositionRoot, config } = useAppContext();
    const [filters, setFilters] = React.useState(() => getEmptyDataValuesFilter(config));
    const baseConfig = React.useMemo(getBaseListConfig, []);
    const [sorting, setSorting] = React.useState<TableSorting<MetadataObjectViewModel>>();

    const getRows = React.useMemo(
        () => async (paging: TablePagination, sorting: TableSorting<MetadataObjectViewModel>) => {
            const { pager, objects } = await compositionRoot.metadata.get.execute({
                config,
                paging: { page: paging.page, pageSize: paging.pageSize },
                sorting: getSortingFromTableSorting(sorting),
                ...getUseCaseOptions(filters),
            });
            setSorting(sorting);
            return { pager, objects: getMetadataViews(config, objects) };
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
            const { objects: metadataObjects } = await compositionRoot.metadata.get.execute({
                config,
                paging: { page: 1, pageSize: 100000 },
                sorting: getSortingFromTableSorting(sorting),
                ...getUseCaseOptions(filters),
            });
            compositionRoot.metadata.save.execute("metadata-objects.csv", metadataObjects);
        },
    };

    return (
        <ObjectsList<MetadataObjectViewModel> {...tableProps} globalActions={[downloadCsv]}>
            <FiltersBox showToggleButton={false} values={filters} options={filterOptions} onChange={setFilters} />
        </ObjectsList>
    );
});

function getUseCaseOptions(filter: MetadataObjectsFilter) {
    return {
        ...filter,
    };
}

function getSortingFromTableSorting(sorting: TableSorting<MetadataObjectViewModel>): Sorting<MetadataObject> {
    return {
        field: sorting.field === "id" ? "metadataType" : sorting.field,
        direction: sorting.order,
    };
}

function getBaseListConfig(): TableConfig<MetadataObjectViewModel> {
    const paginationOptions: PaginationOptions = {
        pageSizeOptions: [10, 20, 50],
        pageSizeInitialValue: 20,
    };

    const initialSorting: TableSorting<MetadataObjectViewModel> = {
        field: "metadataType" as const,
        order: "asc" as const,
    };

    const columns: TableColumn<MetadataObjectViewModel>[] = [
        { name: "id", text: i18n.t("Id"), sortable: true },
        { name: "metadataType", text: i18n.t("Metadata Type"), sortable: true },
        { name: "publicAccess", text: i18n.t("Public Access"), sortable: true },
        { name: "createdBy", text: i18n.t("Created By"), sortable: true },
        { name: "lastUpdatedBy", text: i18n.t("Last Updated By"), sortable: true },
        { name: "userGroupAccess", text: i18n.t("User Group Accesses"), sortable: true },
        { name: "userAccess", text: i18n.t("User Accesses"), sortable: true },
        { name: "name", text: i18n.t("name"), sortable: true },
        { name: "lastUpdated", text: i18n.t("lastUpdated"), sortable: true },
        { name: "created", text: i18n.t("created"), sortable: true },
    ];

    return { columns, initialSorting, paginationOptions };
}

function getFilterOptions(config: Config, filters: MetadataObjectsFilter) {
    const { metadataTypes } = filters;
    const sections = _(config.sectionsByDataSet)
        .at(_.isEmpty(metadataTypes) ? _.keys(config.sectionsByDataSet) : metadataTypes)
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

function getEmptyDataValuesFilter(config: Config): MetadataObjectsFilter {
    return {
        metadataTypes: [],
        publicAccess: [],
        createdBy: [],
        lastUpdatedBy: [],
    };
}
