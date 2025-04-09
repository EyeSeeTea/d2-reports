import _ from "lodash";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Sorting } from "../../../../domain/common/entities/PaginatedObjects";
import i18n from "../../../../locales";
import { useAppContext } from "../../../contexts/app-context";
import StorageIcon from "@material-ui/icons/Storage";
import { useReload } from "../../../utils/use-reload";
import { getFileResourcesMonitoringViews, FileResourcesViewModel } from "./FileResourcesViewModel";
import { Namespaces } from "../../../../data/common/clients/storage/Namespaces";
import { MonitoringFileResourcesFile } from "../../../../domain/reports/file-resources-monitoring/entities/MonitoringFileResourcesFile";
import {
    ObjectsList,
    TableColumn,
    TableConfig,
    TableGlobalAction,
    TablePagination,
    TableSorting,
    useObjectsTable,
} from "@eyeseetea/d2-ui-components";
import { Filter, Filters } from "./Filters";
import DeleteIcon from "@material-ui/icons/Delete";

export const FileResourcesMonitorList: React.FC = React.memo(() => {
    const { compositionRoot } = useAppContext();
    const [filters, setFilters] = useState(() => getEmptyFilter());
    const [sorting, setSorting] = React.useState<TableSorting<FileResourcesViewModel>>();
    const [filenameQuery, setFilenameQuery] = useState<string>("");
    const [visibleColumns, setVisibleColumns] = useState<string[]>();
    const [reloadKey, _reload] = useReload();
    useEffect(() => {
        compositionRoot.fileResourcesMonitoring
            .getColumns(Namespaces.FILE_RESOURCES_MONITORING_COLUMNS)
            .then(columns => {
                setVisibleColumns(columns);
            });
    }, [compositionRoot.fileResourcesMonitoring]);

    const baseConfig: TableConfig<FileResourcesViewModel> = useMemo(
        () => ({
            columns: [
                { name: "id", text: i18n.t("Id"), sortable: true },
                { name: "name", text: i18n.t("Name"), sortable: true },
                { name: "created", text: i18n.t("Created"), sortable: true },
                { name: "createdBy", text: i18n.t("CreatedBy"), sortable: true },
                { name: "lastUpdated", text: i18n.t("LastUpdated"), sortable: true },
                { name: "lastUpdatedBy", text: i18n.t("LastUpdatedBy"), sortable: true, hidden: true },
                { name: "size", text: i18n.t("Size"), sortable: true, hidden: true, sortField: "contentLength" }, //this field must be sorted by contentLenght to avoid wrong orders
                { name: "href", text: i18n.t("Details"), sortable: false, hidden: true },
                { name: "type", text: i18n.t("Type"), sortable: false, hidden: true },
            ],
            actions: [
                {
                    name: "delete",
                    text: i18n.t("Delete"),
                    icon: <DeleteIcon />,
                    multiple: true,
                    onClick: async (selectedIds: string[]) => {
                        if (!selectedIds.length) return;

                        const confirmed = window.confirm(i18n.t("Are you sure you want to delete the selected items?"));
                        if (!confirmed) return;

                        await compositionRoot.fileResourcesMonitoring.delete(selectedIds);

                        _reload();
                    },
                    isActive: rows => rows.length > 0,
                },
            ],
            initialSorting: {
                field: "id" as const,
                order: "asc" as const,
            },
            paginationOptions: {
                pageSizeOptions: [10, 20, 50],
                pageSizeInitialValue: 10,
            },
            searchBoxLabel: i18n.t("Search by filename..."),
        }),
        [_reload, compositionRoot.fileResourcesMonitoring]
    );

    const getRowsList = React.useMemo(
        () => async (_search: string, paging: TablePagination, sorting: TableSorting<FileResourcesViewModel>) => {
            const { pager, objects } = await compositionRoot.fileResourcesMonitoring.get({
                paging: { page: paging.page, pageSize: paging.pageSize },
                sorting: getSortingFromTableSorting(sorting),
                ...filters,
            });

            setSorting(sorting);
            console.debug("Reloading", reloadKey);
            return { pager, objects: getFileResourcesMonitoringViews(objects) };
        },
        [compositionRoot.fileResourcesMonitoring, filters, reloadKey]
    );

    const saveReorderedColumns = useCallback(
        async (columnKeys: Array<keyof FileResourcesViewModel>) => {
            if (!visibleColumns) return;

            await compositionRoot.fileResourcesMonitoring.saveColumns(
                Namespaces.FILE_RESOURCES_MONITORING_COLUMNS,
                columnKeys
            );
        },
        [compositionRoot, visibleColumns]
    );

    const tableProps = useObjectsTable<FileResourcesViewModel>(baseConfig, getRowsList);

    const filterOptions = useMemo(() => {
        return {
            filenameQuery: filenameQuery,
        };
    }, [filenameQuery]);

    const columnsToShow = useMemo<TableColumn<FileResourcesViewModel>[]>(() => {
        if (!visibleColumns || _.isEmpty(visibleColumns)) return tableProps.columns;

        const indexes = _(visibleColumns)
            .map((columnName, idx) => [columnName, idx] as [string, number])
            .fromPairs()
            .value();

        return _(tableProps.columns)
            .map(column => ({ ...column, hidden: !visibleColumns.includes(column.name) }))
            .sortBy(column => indexes[column.name] || 0)
            .value();
    }, [tableProps.columns, visibleColumns]);

    const downloadCsv: TableGlobalAction = {
        name: "downloadCsv",
        text: "Download CSV",
        icon: <StorageIcon />,
        onClick: async () => {
            if (!sorting) return;
            const { objects: files } = await compositionRoot.fileResourcesMonitoring.get({
                paging: { page: 1, pageSize: 100000 },
                sorting: getSortingFromTableSorting(sorting),
                ...filters,
            });

            compositionRoot.fileResourcesMonitoring.save("monitoring-FileResources-report.csv", files);
        },
    };

    return (
        <ObjectsList<FileResourcesViewModel>
            {...tableProps}
            columns={columnsToShow}
            onReorderColumns={saveReorderedColumns}
            onChangeSearch={value => {
                setFilenameQuery(value);
                setFilters({ ...filters, filenameQuery: value });
            }}
            globalActions={[downloadCsv]}
        >
            <Filters values={filters} options={filterOptions} onChange={setFilters} />
        </ObjectsList>
    );
});

function getSortingFromTableSorting(
    sorting: TableSorting<FileResourcesViewModel>
): Sorting<MonitoringFileResourcesFile> {
    return {
        field: sorting.field === "size" ? "contentLength" : sorting.field,
        direction: sorting.order,
    };
}

function getEmptyFilter(): Filter {
    return {
        filenameQuery: "",
    };
}
