import {
    ObjectsList,
    TableColumn,
    TableConfig,
    TablePagination,
    TableSorting,
    useObjectsTable,
    useSnackbar,
} from "@eyeseetea/d2-ui-components";
import DoneAllIcon from "@material-ui/icons/DoneAll";
import _ from "lodash";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Config } from "../../../../domain/common/entities/Config";
import { getOrgUnitIdsFromPaths } from "../../../../domain/common/entities/OrgUnit";
import { Sorting } from "../../../../domain/common/entities/PaginatedObjects";
import {
    MalDataSubscriptionItem,
    parseDataSubscriptionItemId,
} from "../../../../domain/reports/mal-data-subscription/entities/MalDataSubscriptionItem";
import i18n from "../../../../locales";
import { useAppContext } from "../../../contexts/app-context";
import { useReload } from "../../../utils/use-reload";
import { DataSubscriptionViewModel, getDataSubscriptionViews } from "../DataSubscriptionViewModel";
import { Namespaces } from "../../../../data/common/clients/storage/Namespaces";
import { Id } from "../../../../domain/common/entities/Base";

interface DataSetsFilter {
    dataSetIds: Id[];
    orgUnitPaths: Id[];
    periods: string[];
    completionStatus?: boolean;
    approvalStatus?: boolean;
}

export const DataSubscriptionList: React.FC = React.memo(() => {
    const { compositionRoot, config } = useAppContext();
    const snackbar = useSnackbar();

    const [filters, _setFilters] = useState(() => getEmptyDataValuesFilter(config));
    const [visibleColumns, setVisibleColumns] = useState<string[]>();
    const [reloadKey, reload] = useReload();

    const selectablePeriods = React.useMemo(() => {
        const currentYear = new Date().getFullYear();
        return _.range(currentYear - 5, currentYear).map(n => n.toString());
    }, []);

    useEffect(() => {
        compositionRoot.malDataSubscription.getColumns(Namespaces.MAL_APPROVAL_STATUS_USER_COLUMNS).then(columns => {
            setVisibleColumns(columns);
        });
    }, [compositionRoot]);

    const baseConfig: TableConfig<DataSubscriptionViewModel> = useMemo(
        () => ({
            columns: [
                { name: "orgUnit", text: i18n.t("Organisation unit"), sortable: true },
                { name: "period", text: i18n.t("Period"), sortable: true },
                { name: "dataSet", text: i18n.t("Data set"), sortable: true, hidden: true },
            ],
            actions: [
                {
                    name: "submit",
                    text: i18n.t("Submit"),
                    icon: <DoneAllIcon />,
                    multiple: true,
                    onClick: async (selectedIds: string[]) => {
                        const items = _.compact(selectedIds.map(item => parseDataSubscriptionItemId(item)));
                        if (items.length === 0) return;

                        const result = await compositionRoot.malDataSubscription.updateStatus(items, "approve");
                        if (!result) snackbar.error(i18n.t("Error when trying to submit data set"));

                        reload();
                    },
                },
            ],
            initialSorting: {
                field: "orgUnit" as const,
                order: "asc" as const,
            },
            paginationOptions: {
                pageSizeOptions: [10, 20, 50],
                pageSizeInitialValue: 10,
            },
        }),
        [compositionRoot.malDataSubscription, reload, snackbar]
    );

    const getRows = useMemo(
        () => async (_search: string, paging: TablePagination, sorting: TableSorting<DataSubscriptionViewModel>) => {
            const { pager, objects } = await compositionRoot.malDataSubscription.get({
                config,
                paging: { page: paging.page, pageSize: paging.pageSize },
                sorting: getSortingFromTableSorting(sorting),
                ...getUseCaseOptions(filters, selectablePeriods),
            });

            console.debug("Reloading", reloadKey);
            return { pager, objects: getDataSubscriptionViews(config, objects) };
        },
        [config, compositionRoot, filters, reloadKey, selectablePeriods]
    );

    function getUseCaseOptions(filter: DataSetsFilter, selectablePeriods: string[]) {
        return {
            ...filter,
            periods: _.isEmpty(filter.periods) ? selectablePeriods : filter.periods,
            orgUnitIds: getOrgUnitIdsFromPaths(filter.orgUnitPaths),
        };
    }
    const saveReorderedColumns = useCallback(
        async (columnKeys: Array<keyof DataSubscriptionViewModel>) => {
            if (!visibleColumns) return;

            await compositionRoot.malDataSubscription.saveColumns(
                Namespaces.MAL_APPROVAL_STATUS_USER_COLUMNS,
                columnKeys
            );
        },
        [compositionRoot, visibleColumns]
    );

    const tableProps = useObjectsTable(baseConfig, getRows);

    const columnsToShow = useMemo<TableColumn<DataSubscriptionViewModel>[]>(() => {
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

    return (
        <ObjectsList<DataSubscriptionViewModel>
            {...tableProps}
            columns={columnsToShow}
            onChangeSearch={undefined}
            onReorderColumns={saveReorderedColumns}
        />
    );
});

function getSortingFromTableSorting(
    sorting: TableSorting<DataSubscriptionViewModel>
): Sorting<MalDataSubscriptionItem> {
    return {
        field: sorting.field === "id" ? "period" : sorting.field,
        direction: sorting.order,
    };
}

function getEmptyDataValuesFilter(_config: Config): DataSetsFilter {
    return {
        dataSetIds: [],
        orgUnitPaths: [],
        periods: ["2021"],
        completionStatus: undefined,
        approvalStatus: undefined,
    };
}
