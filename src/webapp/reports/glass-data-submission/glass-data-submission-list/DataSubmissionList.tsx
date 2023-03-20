import React, { useCallback, useEffect, useMemo, useState } from "react";
import { DataSubmissionViewModel, getDataSubmissionViews } from "../DataSubmissionViewModel";
import {
    ObjectsList,
    TableColumn,
    TableConfig,
    TablePagination,
    TableSorting,
    useObjectsTable,
} from "@eyeseetea/d2-ui-components";
import i18n from "../../../../locales";
import { useAppContext } from "../../../contexts/app-context";
import { useReload } from "../../../utils/use-reload";
import { GLASSDataSubmissionItem } from "../../../../domain/reports/glass-data-submission/entities/GLASSDataSubmissionItem";
import { Sorting } from "../../../../domain/common/entities/PaginatedObjects";
import { Namespaces } from "../../../../data/common/clients/storage/Namespaces";
import _ from "lodash";
import { Filter, Filters } from "./Filters";
import { Config } from "../../../../domain/common/entities/Config";
import { getOrgUnitIdsFromPaths } from "../../../../domain/common/entities/OrgUnit";

export const DataSubmissionList: React.FC = React.memo(() => {
    const { compositionRoot, config } = useAppContext();

    const [reloadKey, _reload] = useReload();
    const [filters, setFilters] = useState(() => getEmptyDataValuesFilter(config));
    const [visibleColumns, setVisibleColumns] = useState<string[]>();

    const selectablePeriods = React.useMemo(() => {
        const currentYear = new Date().getFullYear();
        return _.range(currentYear - 5, currentYear + 1).map(n => n.toString());
    }, []);

    useEffect(() => {
        compositionRoot.glassDataSubmission.getColumns(Namespaces.DATA_SUBMISSSIONS_USER_COLUMNS).then(columns => {
            setVisibleColumns(columns);
        });
    }, [compositionRoot]);

    const baseConfig: TableConfig<DataSubmissionViewModel> = useMemo(
        () => ({
            columns: [
                { name: "orgUnit", text: i18n.t("Country"), sortable: true },
                { name: "period", text: i18n.t("Year"), sortable: true },
                {
                    name: "status",
                    text: i18n.t("Questionnaire completed"),
                    sortable: true,
                    getValue: row => (row.status === "COMPLETE" ? "Completed" : "Not completed"),
                },
                {
                    name: "module",
                    text: i18n.t("Datasets uploaded"),
                    sortable: true,
                    getValue: row => (row.module ? "Uploaded" : "Not uploaded"),
                },
            ],
            actions: [],
            initialSorting: {
                field: "orgUnit" as const,
                order: "asc" as const,
            },
            paginationOptions: {
                pageSizeOptions: [10, 20, 50],
                pageSizeInitialValue: 10,
            },
        }),
        []
    );

    const getRows = useMemo(
        () => async (_search: string, paging: TablePagination, sorting: TableSorting<DataSubmissionViewModel>) => {
            const { pager, objects } = await compositionRoot.glassDataSubmission.get(
                {
                    config,
                    paging: { page: paging.page, pageSize: paging.pageSize },
                    sorting: getSortingFromTableSorting(sorting),
                    ...getUseCaseOptions(filters, selectablePeriods),
                },
                Namespaces.DATA_SUBMISSSIONS
            );

            console.debug("Reloading", reloadKey);

            return { pager, objects: getDataSubmissionViews(config, objects) };
        },
        [compositionRoot, config, filters, reloadKey, selectablePeriods]
    );

    function getUseCaseOptions(filter: Filter, selectablePeriods: string[]) {
        return {
            ...filter,
            periods: _.isEmpty(filter.periods) ? selectablePeriods : filter.periods,
            orgUnitIds: getOrgUnitIdsFromPaths(filter.orgUnitPaths),
        };
    }

    const saveReorderedColumns = useCallback(
        async (columnKeys: Array<keyof DataSubmissionViewModel>) => {
            if (!visibleColumns) return;

            await compositionRoot.glassDataSubmission.saveColumns(
                Namespaces.DATA_SUBMISSSIONS_USER_COLUMNS,
                columnKeys
            );
        },
        [compositionRoot, visibleColumns]
    );

    const tableProps = useObjectsTable<DataSubmissionViewModel>(baseConfig, getRows);

    function getFilterOptions(selectablePeriods: string[]) {
        return {
            periods: selectablePeriods,
        };
    }
    const filterOptions = useMemo(() => getFilterOptions(selectablePeriods), [selectablePeriods]);

    const columnsToShow = useMemo<TableColumn<DataSubmissionViewModel>[]>(() => {
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
        <ObjectsList<DataSubmissionViewModel>
            {...tableProps}
            columns={columnsToShow}
            onChangeSearch={undefined}
            onReorderColumns={saveReorderedColumns}
        >
            <Filters values={filters} options={filterOptions} onChange={setFilters} />
        </ObjectsList>
    );
});

export function getSortingFromTableSorting(
    sorting: TableSorting<DataSubmissionViewModel>
): Sorting<GLASSDataSubmissionItem> {
    return {
        field: sorting.field === "id" ? "period" : sorting.field,
        direction: sorting.order,
    };
}

function getEmptyDataValuesFilter(_config: Config): Filter {
    return {
        orgUnitPaths: [],
        periods: [],
        completionStatus: undefined,
    };
}
