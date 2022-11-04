import {
    ObjectsList,
    TableColumn,
    TableConfig,
    TablePagination,
    TableSorting,
    useObjectsTable,
    useSnackbar,
} from "@eyeseetea/d2-ui-components";
import DoneIcon from "@material-ui/icons/Done";
import _ from "lodash";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { sortByName } from "../../../../domain/common/entities/Base";
import { Config } from "../../../../domain/common/entities/Config";
import { getOrgUnitIdsFromPaths } from "../../../../domain/common/entities/OrgUnit";
import { Sorting } from "../../../../domain/common/entities/PaginatedObjects";
import {
    parseDataApprovalItemId,
} from "../../../../domain/reports/nhwa-approval-status/entities/DataApprovalItem";
import i18n from "../../../../locales";
import { useAppContext } from "../../../contexts/app-context";
import { useReload } from "../../../utils/use-reload";
import { UserInfoViewModel, getUserInfolViews } from "../UserInfoViewModel";
import { DataSetsFilter, Filters } from "./Filters";

export const UserInfoList: React.FC = React.memo(() => {
    const { compositionRoot, config } = useAppContext();
    const snackbar = useSnackbar();

    const [visibleColumns, setVisibleColumns] = useState<string[]>();
    const [reloadKey, reload] = useReload();

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
                    onClick: async (selectedIds: string[]) => {
                        compositionRoot.user2fa.save(
                            "user-info-list.csv",
                            await compositionRoot.user2fa.get()º
                        );
                    },
                },
            ],
            initialSorting: {
                field: "dataSet" as const,
                order: "asc" as const,
            },
            paginationOptions: {
                pageSizeOptions: [10, 20, 50],
                pageSizeInitialValue: 10,
            },
        }),
        [compositionRoot, reload, snackbar]
    );

    const getRows = useMemo(
        () => async (_search: string, paging: TablePagination, sorting: TableSorting<UserInfoViewModel>) => {
            const { pager, objects } = await compositionRoot.user2fa.get({
                config,
                paging: { page: paging.page, pageSize: paging.pageSize },
            });

            console.debug("Reloading", reloadKey);

            return { pager, objects: getUserInfolViews(config, objects) };
        },
        [config, compositionRoot, reloadKey]
    );

    const saveReorderedColumns = useCallback(
        async (columnKeys: Array<keyof UserInfoViewModel>) => {
            if (!visibleColumns) return;

            await compositionRoot.dataApproval.saveColumns(columnKeys);
        },
        [compositionRoot, visibleColumns]
    );

    const tableProps = useObjectsTable(baseConfig, getRows);

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

    const filterOptions = useMemo(() => getFilterOptions(config), [config]);

    useEffect(() => {
        compositionRoot.dataApproval.getColumns().then(columns => setVisibleColumns(columns));
    }, [compositionRoot]);

    return (
        <ObjectsList<UserInfoViewModel>
            {...tableProps}
            columns={columnsToShow}
            onChangeSearch={undefined}
            onReorderColumns={saveReorderedColumns}
        >
            <Filters values={filters} options={filterOptions} onChange={setFilters} />
        </ObjectsList>
    );
});

function getUseCaseOptions(filter: DataSetsFilter) {
    return {
        ...filter,
        orgUnitIds: getOrgUnitIdsFromPaths(filter.orgUnitPaths),
    };
}

function getSortingFromTableSorting(sorting: TableSorting<UserInfoViewModel>): Sorting<UserInfoViewModel> {
    return {
        field: sorting.field === "id" ? "username" : sorting.field,
        direction: sorting.order,
    };
}

function getFilterOptions(config: Config) {
    return {
        dataSets: sortByName(_.values(config.dataSets)),
        periods: config.years,
        approvalWorkflow: config.approvalWorkflow,
    };
}
