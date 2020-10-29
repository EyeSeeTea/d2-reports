import React from "react";
import {
    TableColumn,
    TableSorting,
    ReferenceObject,
    PaginationOptions,
    TablePagination,
    ObjectsTableDetailField,
    TableState,
} from "d2-ui-components";
import { ObjectsListProps } from "./ObjectsList";

export interface Config<Obj extends ReferenceObject> {
    columns: TableColumn<Obj>[];
    paginationOptions: PaginationOptions;
    initialSorting: TableSorting<Obj>;
    details?: ObjectsTableDetailField<Obj>[];
    getRows(): Promise<{ objects: Obj[]; pager: Partial<TablePagination> } | undefined>;
}

const initialPagination: Partial<TablePagination> = { page: 1, pageSize: 20 };

export function useObjectsTable<T extends ReferenceObject>(config: Config<T>): ObjectsListProps<T> {
    const [rows, setRows] = React.useState<T[] | undefined>(undefined);
    const [pagination, setPagination] = React.useState<Partial<TablePagination>>(initialPagination);
    const [sorting, setSorting] = React.useState<TableSorting<T>>(config.initialSorting);
    const [isLoading, setLoading] = React.useState(true);

    const loadRows = React.useCallback(
        async (sorting: TableSorting<T>, paginationOptions: Partial<TablePagination>) => {
            const listPagination = { ...paginationOptions };
            setLoading(true);
            const res = await config.getRows();
            if (res) {
                setRows(res.objects);
                setPagination({ ...listPagination, ...res.pager });
            } else {
                setRows([]);
                setPagination(initialPagination);
            }
            setSorting(sorting);
            setLoading(false);
        },
        [config]
    );

    React.useEffect(() => {
        loadRows(sorting, { ...initialPagination, page: 1 });
    }, [loadRows, sorting]);

    const onStateChange = React.useCallback(
        (newState: TableState<T>) => {
            const { pagination, sorting } = newState;
            loadRows(sorting, pagination);
        },
        [loadRows]
    );

    return { ...config, isLoading, rows, onStateChange, pagination };
}
