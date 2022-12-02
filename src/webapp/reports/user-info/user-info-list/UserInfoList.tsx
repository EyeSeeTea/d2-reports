import {
    ObjectsList,
    TableColumn,
    TableConfig,
    TablePagination,
    TableSorting,
    useObjectsTable,
} from "@eyeseetea/d2-ui-components";
import DoneIcon from "@material-ui/icons/Done";
import _ from "lodash";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Sorting } from "../../../../domain/common/entities/PaginatedObjects";
import { User } from "../../../../domain/common/entities/User";
import i18n from "../../../../locales";
import { useAppContext } from "../../../contexts/app-context";
import { useSnackbarOnError } from "../../../utils/snackbar";
import { useReload } from "../../../utils/use-reload";
import { getUserInfolViews, UserInfoViewModel } from "../UserInfoViewModel";

export const UserInfoList: React.FC = React.memo(() => {
    const { compositionRoot, config } = useAppContext();
    const [visibleColumns, setVisibleColumns] = useState<string[]>();
    const [sorting, setSorting] = React.useState<TableSorting<UserInfoViewModel>>();
    useReload();

    const baseConfig: TableConfig<UserInfoViewModel> = useMemo(
        () => ({
            columns: [
                { name: "id", text: i18n.t("uid"), sortable: true },
                { name: "name", text: i18n.t("Name"), sortable: true },
                { name: "username", text: i18n.t("Username"), sortable: true },
                { name: "externalAuth", text: i18n.t("External auth"), sortable: true },
                { name: "twoFA", text: i18n.t("TwoFA"), sortable: true },
                { name: "email", text: i18n.t("Email"), sortable: true, hidden: true },
                { name: "disabled", text: i18n.t("Disabled"), sortable: true, hidden: true },
            ],
            actions: [
                {
                    name: "save",
                    text: i18n.t("save"),
                    icon: <DoneIcon />,
                    multiple: true,
                    onClick: async () => {
                        // FUTURE: create a single use case that performs the get+saveCSV
                        const { objects: users } = await compositionRoot.user2fa.get({
                            config,
                            paging: { page: 1, pageSize: 10 },
                        });
                        compositionRoot.user2fa.save("users.csv", users);
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
        }),
        [compositionRoot]
    );

    const getRowsList = React.useMemo(
        () => async (paging: TablePagination, sorting: TableSorting<UserInfoViewModel>) => {
            const { objects } = await compositionRoot.user2fa.get({
                config,
                paging: { page: paging.page, pageSize: paging.pageSize },
                sorting: getSortingFromTableSorting(sorting),
            });

            setSorting(sorting);
            return {
                pager: { pageSize: 10000, page: 1, total: objects.length, pageCount: 1 },
                objects: getUserInfolViews(objects),
            };
        },
        [config, compositionRoot, sorting]
    );

    const getRowsWithSnackbarOrError = useSnackbarOnError(getRowsList);
    //const teste: any = getRowsList;
    const tableProps = useObjectsTable(baseConfig, getRowsWithSnackbarOrError);

    function getSortingFromTableSorting(sorting: TableSorting<UserInfoViewModel>): Sorting<User> {
        return {
            field: sorting.field === "id" ? "id" : sorting.field,
            direction: sorting.order,
        };
    }

    const saveReorderedColumns = useCallback(
        async (columnKeys: Array<keyof UserInfoViewModel>) => {
            if (!visibleColumns) return;

            await compositionRoot.dataApproval.saveColumns(columnKeys);
        },
        [compositionRoot, visibleColumns]
    );

    const columnsToShow = useMemo<TableColumn<UserInfoViewModel>[]>(() => {
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

    useEffect(() => {
        compositionRoot.dataApproval.getColumns().then(columns => setVisibleColumns(columns));
    }, [compositionRoot]);

    return (
        <ObjectsList<UserInfoViewModel>
            {...tableProps}
            columns={columnsToShow}
            onReorderColumns={saveReorderedColumns}
        ></ObjectsList>
    );
});
