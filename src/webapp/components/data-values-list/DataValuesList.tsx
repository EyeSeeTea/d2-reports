import React from "react";
import { TableColumn, TableSorting, PaginationOptions } from "d2-ui-components";
import { TablePagination } from "d2-ui-components";

import i18n from "../../../locales";
import { ObjectsList } from "../objects-list/ObjectsList";
import { Config, useObjectsTable } from "../objects-list/objects-list-hooks";

interface DataValue {
    id: string;
    name: string;
}

function getListConfig(): Config<DataValue> {
    const paginationOptions: Partial<PaginationOptions> = {
        pageSizeOptions: [10, 20, 50],
        pageSizeInitialValue: 20,
    };

    const initialPagination: Partial<TablePagination> = { page: 1, pageSize: 20 };
    const initialSorting: TableSorting<DataValue> = {
        field: "id" as const,
        order: "asc" as const,
    };

    const columns: TableColumn<DataValue>[] = [
        { name: "id", text: i18n.t("Id"), sortable: true },
        { name: "name", text: i18n.t("Name"), sortable: true },
    ];

    const getRows = () => {
        return {
            objects: [
                { id: "id1", name: "row1" },
                { id: "id2", name: "row2" },
            ],
            pager: {},
        };
    };

    return {
        columns,
        initialSorting,
        details: columns,
        initialPagination,
        paginationOptions,
        getRows,
    };
}

export const DataValuesList: React.FC = React.memo(() => {
    const config = React.useMemo(() => getListConfig(), []);
    const tableProps = useObjectsTable(config);

    return <ObjectsList<DataValue> {...tableProps} />;
});
