import { useAppContext } from "../../../contexts/app-context";
import { useReload } from "../../../utils/use-reload";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Namespaces } from "../../../../data/common/clients/storage/Namespaces";
import { getFileResourcesMonitoringViews, FileResourcesViewModel } from "./FileResourcesViewModel";
import {
    TableConfig,
    TableGlobalAction,
    TablePagination,
    TableSorting,
    useObjectsTable,
    TableColumn,
} from "@eyeseetea/d2-ui-components";
import { MonitoringFileResourcesFile } from "../../../../domain/reports/file-resources-monitoring/entities/MonitoringFileResourcesFile";
import StorageIcon from "@material-ui/icons/Storage";
import DeleteIcon from "@material-ui/icons/Delete";
import _ from "lodash";
import React from "react";
import type { Sorting } from "../../../../domain/common/entities/PaginatedObjects";
import i18n from "../../../../locales";
import { Tooltip } from "@material-ui/core";
import styled from "styled-components";

export function useFileResources() {
    const { compositionRoot } = useAppContext();
    const [filters, setFilters] = useState(() => getEmptyFilter());
    const [sorting, setSorting] = useState<TableSorting<FileResourcesViewModel>>();
    const [visibleColumns, setVisibleColumns] = useState<string[]>();
    const [reloadKey, reload] = useReload();
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

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
                { name: "fileResourceId", text: i18n.t("FileResourceId"), sortable: true, hidden: true },
                { name: "name", text: i18n.t("Name"), sortable: true },
                { name: "created", text: i18n.t("Created"), sortable: true },
                { name: "createdBy", text: i18n.t("CreatedBy"), sortable: true },
                { name: "lastUpdated", text: i18n.t("LastUpdated"), sortable: true, hidden: true },
                { name: "lastUpdatedBy", text: i18n.t("LastUpdatedBy"), sortable: true, hidden: true },
                { name: "size", text: i18n.t("Size"), sortable: true, sortField: "contentLength" },
                { name: "href", text: i18n.t("Details"), sortable: false, hidden: true },
                {
                    name: "type",
                    text: i18n.t("Type"),
                    sortable: false,
                    getValue: (row: FileResourcesViewModel) => {
                        const text = row.type; // o el campo que quieras comprobar
                        if (text === "Orphan") {
                            return (
                                <StyledTooltip
                                    title={i18n.t(
                                        "This is an orphan fileResource. A file resource is orphan when it doesn't have any relation with an owner (document, dataValue, userAvatar, messageAttachment)"
                                    )}
                                    arrow
                                >
                                    {<span>{text} *</span>}
                                </StyledTooltip>
                            );
                        } else {
                            return text;
                        }
                    },
                },
            ],
            actions: [
                {
                    name: "delete",
                    text: i18n.t("Delete"),
                    icon: React.createElement(DeleteIcon),
                    multiple: true,
                    onClick: async (selectedIds: string[]) => {
                        if (!selectedIds.length) return;

                        setSelectedIds(selectedIds);
                        setShowConfirmDelete(true);
                    },
                    isActive: (rows: FileResourcesViewModel[]) => {
                        return rows.filter(row => row.type === "Orphan").length === 0;
                    },
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
        []
    );

    const getRowsList = useMemo(
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

    const deleteSelectedFiles = useCallback(async () => {
        if (!selectedIds.length) return;
        await compositionRoot.fileResourcesMonitoring.delete(selectedIds);
        setSelectedIds([]);
        setShowConfirmDelete(false);
        reload();
    }, [compositionRoot.fileResourcesMonitoring, reload, selectedIds]);

    const cancelConfirmDelete = useCallback(() => {
        setShowConfirmDelete(false);
    }, []);

    const tableProps = useObjectsTable<FileResourcesViewModel>(baseConfig, getRowsList);

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
        text: i18n.t("Download CSV"),
        icon: React.createElement(StorageIcon),
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

    return {
        tableProps,
        columnsToShow,
        saveReorderedColumns,
        setFilters,
        filters,
        downloadCsv,
        showConfirmDelete,
        deleteSelectedFiles,
        cancelConfirmDelete,
    };
}

function getSortingFromTableSorting(
    sorting: TableSorting<FileResourcesViewModel>
): Sorting<MonitoringFileResourcesFile> {
    return {
        field: sorting.field === "size" ? "contentLength" : sorting.field,
        direction: sorting.order,
    };
}

function getEmptyFilter(): any {
    return {
        filenameQuery: "",
    };
}

const StyledTooltip = styled(({ className, ...props }) => <Tooltip {...props} classes={{ popper: className }} />)`
    /* Aquí dirigimos los estilos hacia el elemento interno que contiene el texto */
    & .MuiTooltip-tooltip {
        font-size: 14px;
    }
`;
