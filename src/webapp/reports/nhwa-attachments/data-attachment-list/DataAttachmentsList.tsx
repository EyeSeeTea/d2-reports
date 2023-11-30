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
import { sortByName } from "../../../../domain/common/entities/Base";
import { Config, getMainUserPaths } from "../../../../domain/common/entities/Config";
import { getOrgUnitIdsFromPaths } from "../../../../domain/common/entities/OrgUnit";
import { Sorting } from "../../../../domain/common/entities/PaginatedObjects";
import { DataAttachmentItem } from "../../../../domain/nhwa-attachments/entities/DataAttachmentItem";
import i18n from "../../../../locales";
import { TableConfig, useObjectsTable } from "../../../components/objects-list/objects-list-hooks";
import { ObjectsList } from "../../../components/objects-list/ObjectsList";
import { useAppContext } from "../../../contexts/app-context";
import { useSnackbarOnError } from "../../../utils/snackbar";
import { FiltersBox } from "../../nhwa-comments/data-comments-list/FiltersBox";
import { DataValuesFilter } from "./../../nhwa-comments/data-comments-list/Filters";

export const DataAttachmentsList: React.FC = React.memo(() => {
    const { compositionRoot, config } = useAppContext();
    const [filters, setFilters] = React.useState(() => getEmptyDataValuesFilter(config));
    const baseConfig = React.useMemo(getBaseListConfig, []);
    const [sorting, setSorting] = React.useState<TableSorting<DataAttachmentItem>>({
        field: "dataSet",
        order: "asc",
    });

    const getRows = React.useMemo(
        () => async (paging: TablePagination, sorting: TableSorting<DataAttachmentItem>) => {
            const { pager, objects } = await compositionRoot.attachments.get({
                config,
                paging: { page: paging.page, pageSize: paging.pageSize },
                sorting: getSortingFromTableSorting(sorting),
                ...getUseCaseOptions(filters),
            });
            setSorting(sorting);
            return { pager, objects };
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
            await compositionRoot.attachments.export({
                config,
                paging: { page: 1, pageSize: 100000 },
                sorting: getSortingFromTableSorting(sorting),
                ...getUseCaseOptions(filters),
            });
        },
    };

    return (
        <ObjectsList<DataAttachmentItem> {...tableProps} globalActions={[downloadCsv]}>
            <FiltersBox showToggleButton={false} values={filters} options={filterOptions} onChange={setFilters} />
        </ObjectsList>
    );
});

function getUseCaseOptions(filter: DataValuesFilter) {
    return { ...filter, orgUnitIds: getOrgUnitIdsFromPaths(filter.orgUnitPaths) };
}

function getSortingFromTableSorting(sorting: TableSorting<DataAttachmentItem>): Sorting<DataAttachmentItem> {
    return { field: sorting.field === "id" ? "period" : sorting.field, direction: sorting.order };
}

function getBaseListConfig(): TableConfig<DataAttachmentItem> {
    const paginationOptions: PaginationOptions = { pageSizeOptions: [10, 20, 50], pageSizeInitialValue: 10 };

    const initialSorting: TableSorting<DataAttachmentItem> = { field: "dataSet" as const, order: "asc" as const };

    const columns: TableColumn<DataAttachmentItem>[] = [
        { name: "dataSet", text: i18n.t("Data set"), sortable: true },
        { name: "period", text: i18n.t("Period"), sortable: true },
        { name: "orgUnit", text: i18n.t("Organisation unit"), sortable: true },
        {
            name: "link",
            text: i18n.t("link"),
            sortable: true,
            getValue: model => <a href={model.link}>link</a>,
        },
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
        showSections: false,
    };
}
