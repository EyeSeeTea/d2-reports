import { useCallback, useEffect, useMemo, useState } from "react";
import { FilesState } from "./FilesState";
import { TablePagination, TableSorting } from "@eyeseetea/d2-ui-components";
import { Sorting } from "../../../../domain/common/entities/PaginatedObjects";
import { DataMaintenanceViewModel } from "../DataMaintenanceViewModel";
import { useAppContext } from "../../../contexts/app-context";
import { useReload } from "../../../utils/use-reload";
import { Namespaces } from "../../../../data/common/clients/storage/Namespaces";
import { GLASSDataMaintenanceItem } from "../../../../domain/reports/glass-admin/entities/GLASSDataMaintenanceItem";
import { Filter } from "./Filter";

const pagination = {
    pageSizeOptions: [10, 20, 50],
    pageSizeInitialValue: 10,
};

const initialSorting = {
    field: "fileName" as const,
    order: "asc" as const,
};

export function useFiles(filters: Filter): FilesState {
    const { compositionRoot } = useAppContext();
    const [reloadKey, reload] = useReload();

    const [filesToDelete, setFilesToDelete] = useState<string[]>([]);
    const [visibleColumns, setVisibleColumns] = useState<string[]>();

    useEffect(() => {
        compositionRoot.glassAdmin.getColumns(Namespaces.FILE_UPLOADS_USER_COLUMNS).then(columns => {
            setVisibleColumns(columns);
        });
    }, [compositionRoot.glassAdmin]);

    const getFiles = useMemo(
        () => async (_search: string, paging: TablePagination, sorting: TableSorting<DataMaintenanceViewModel>) => {
            const { objects, pager, rowIds } = await compositionRoot.glassAdmin.get(
                {
                    paging: { page: paging.page, pageSize: paging.pageSize },
                    sorting: getSortingFromTableSorting(sorting),
                    module: filters.module,
                },
                Namespaces.FILE_UPLOADS
            );

            setFilesToDelete(rowIds);
            console.debug("Reloading", reloadKey);

            return { objects, pager };
        },
        [compositionRoot.glassAdmin, filters.module, reloadKey]
    );

    const saveReorderedColumns = useCallback(
        async (columnKeys: Array<keyof DataMaintenanceViewModel>) => {
            if (!visibleColumns) return;

            await compositionRoot.glassAdmin.saveColumns(Namespaces.FILE_UPLOADS_USER_COLUMNS, columnKeys);
        },
        [compositionRoot.glassAdmin, visibleColumns]
    );

    async function deleteFiles(ids: string[]) {
        compositionRoot.glassAdmin.updateStatus(Namespaces.FILE_UPLOADS, "delete", ids);
        reload();
    }

    return {
        getFiles,
        pagination,
        initialSorting,
        filesToDelete,
        deleteFiles,
        visibleColumns,
        saveReorderedColumns,
    };
}

function getSortingFromTableSorting(
    sorting: TableSorting<DataMaintenanceViewModel>
): Sorting<GLASSDataMaintenanceItem> {
    return {
        field: sorting.field === "id" ? "fileName" : sorting.field,
        direction: sorting.order,
    };
}
