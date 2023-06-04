import {
    ObjectsList,
    TableConfig,
    TableGlobalAction,
    TablePagination,
    TableSorting,
    useObjectsTable,
} from "@eyeseetea/d2-ui-components";
import StorageIcon from "@material-ui/icons/Storage";
import React, { useMemo, useState } from "react";
import { SummaryViewModel, getSummaryViews } from "../SummaryViewModel";
import i18n from "../../../../locales";
import { useAppContext } from "../../../contexts/app-context";
import { useReload } from "../../../utils/use-reload";
import { Sorting } from "../../../../domain/common/entities/PaginatedObjects";
import { SummaryItem } from "../../../../domain/reports/csy-summary/entities/SummaryItem";
import { Filter, Filters } from "./Filters";
import { Config } from "../../../../domain/common/entities/Config";
import _ from "lodash";

export const CSYSummaryList: React.FC = React.memo(() => {
    const { compositionRoot, config } = useAppContext();

    const [reloadKey, _reload] = useReload();
    const [filters, setFilters] = useState(() => getEmptyDataValuesFilter(config));
    const [sorting, setSorting] = useState<TableSorting<SummaryViewModel>>();

    const selectablePeriods = React.useMemo(() => {
        const currentYear = new Date().getFullYear();
        return _.range(currentYear - 10, currentYear + 1).map(n => n.toString());
    }, []);

    const baseConfig: TableConfig<SummaryViewModel> = useMemo(
        () => ({
            columns: [
                { name: "group", text: i18n.t("Group"), sortable: false },
                { name: "subGroup", text: i18n.t("Sub-Group"), sortable: true },
                { name: "yearLessThan1", text: i18n.t("< 1 yr"), sortable: true },
                { name: "year1To4", text: i18n.t("1 - 4 yr"), sortable: true },
                { name: "year5To9", text: i18n.t("5 - 9 yr"), sortable: true },
                { name: "year10To14", text: i18n.t("10 - 14 yr"), sortable: true },
                { name: "year15To19", text: i18n.t("15 - 19 yr"), sortable: true },
                { name: "year20To40", text: i18n.t("20 - 40 yr"), sortable: true },
                { name: "year40To60", text: i18n.t("40 - 60 yr"), sortable: true },
                { name: "year60To80", text: i18n.t("60 - 80 yr"), sortable: true },
                { name: "yearGreaterThan80", text: i18n.t("80+ yr"), sortable: true },
                { name: "unknown", text: i18n.t("Unknown"), sortable: true },
                { name: "total", text: i18n.t("Total"), sortable: true },
            ],
            actions: [],
            initialSorting: {
                field: "group" as const,
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
        () => async (_search: string, paging: TablePagination, sorting: TableSorting<SummaryViewModel>) => {
            const { pager, objects } = await compositionRoot.summary.get({
                config,
                paging: { page: paging.page, pageSize: paging.pageSize },
                sorting: getSortingFromTableSorting(sorting),
                ...filters,
            });

            setSorting(sorting);
            console.debug("Reloading", reloadKey);
            return { pager, objects: getSummaryViews(config, objects) };
        },
        [compositionRoot.summary, config, filters, reloadKey]
    );

    const tableProps = useObjectsTable(baseConfig, getRows);

    function getFilterOptions(selectablePeriods: string[]) {
        return {
            periods: selectablePeriods,
        };
    }
    const filterOptions = useMemo(() => getFilterOptions(selectablePeriods), [selectablePeriods]);

    const downloadCsv: TableGlobalAction = {
        name: "downloadCsv",
        text: "Download CSV",
        icon: <StorageIcon />,
        onClick: async () => {
            if (!sorting) return;
            const { objects: summaryItems } = await compositionRoot.summary.get({
                config,
                paging: { page: 1, pageSize: 100000 },
                sorting: getSortingFromTableSorting(sorting),
                ...filters,
            });

            compositionRoot.summary.save("summary-table-report.csv", summaryItems);
        },
    };

    return (
        <ObjectsList<SummaryViewModel> {...tableProps} onChangeSearch={undefined} globalActions={[downloadCsv]}>
            <Filters values={filters} options={filterOptions} onChange={setFilters} />
        </ObjectsList>
    );
});

export function getSortingFromTableSorting(sorting: TableSorting<SummaryViewModel>): Sorting<SummaryItem> {
    return {
        field: sorting.field === "id" ? "group" : sorting.field,
        direction: sorting.order,
    };
}

function getEmptyDataValuesFilter(_config: Config): Filter {
    return {
        summaryType: "injury-epidemiology",
        orgUnitPaths: [],
        year: "2020",
        periodType: "yearly",
        quarter: undefined,
    };
}
