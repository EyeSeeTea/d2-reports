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

export interface TableConfig<Obj extends ReferenceObject> {
    columns: TableColumn<Obj>[];
    paginationOptions: PaginationOptions;
    initialSorting: TableSorting<Obj>;
    details?: ObjectsTableDetailField<Obj>[];
}

type GetRows<Obj> = () => Promise<{ objects: Obj[]; pager: Partial<TablePagination> } | undefined>;

const initialPagination: Partial<TablePagination> = { page: 1, pageSize: 20 };

export function useObjectsTable<Obj extends ReferenceObject>(
    config: TableConfig<Obj>,
    getRows: GetRows<Obj>
): ObjectsListProps<Obj> {
    const [rows, setRows] = React.useState<Obj[] | undefined>(undefined);
    const [pagination, setPagination] = React.useState<Partial<TablePagination>>(initialPagination);
    const [sorting, setSorting] = React.useState<TableSorting<Obj>>(config.initialSorting);
    const [isLoading, setLoading] = React.useState(true);

    const loadRows = React.useCallback(
        async (sorting: TableSorting<Obj>, paginationOptions: Partial<TablePagination>) => {
            const listPagination = { ...paginationOptions };
            setLoading(true);
            const res = await getRows();
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
        [getRows]
    );

    React.useEffect(() => {
        loadRows(sorting, { ...initialPagination, page: 1 });
    }, [loadRows, sorting]);

    const onStateChange = React.useCallback(
        (newState: TableState<Obj>) => {
            const { pagination, sorting } = newState;
            loadRows(sorting, pagination);
        },
        [loadRows]
    );

    return { ...config, isLoading, rows, onStateChange, pagination };
}
