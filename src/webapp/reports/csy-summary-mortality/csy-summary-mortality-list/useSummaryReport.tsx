import { useMemo, useState } from "react";
import { useAppContext } from "../../../contexts/app-context";
import { useReload } from "../../../utils/use-reload";
import { TableGlobalAction, TablePagination, TableSorting, useSnackbar } from "@eyeseetea/d2-ui-components";
import { getSummaryViews, SummaryViewModel } from "../SummaryViewModel";
import { emptyPage, PaginatedObjects, Sorting } from "../../../../domain/common/entities/PaginatedObjects";
import { SummaryItem } from "../../../../domain/reports/csy-summary-mortality/entities/SummaryItem";
import { Filter, FilterOptions } from "./Filters";
import StorageIcon from "@material-ui/icons/Storage";
import { useSelectablePeriods } from "../../../utils/selectablePeriods";

interface SummaryReportState {
    downloadCsv: TableGlobalAction;
    filterOptions: FilterOptions;
    initialSorting: TableSorting<SummaryViewModel>;
    paginationOptions: {
        pageSizeOptions: number[];
        pageSizeInitialValue: number;
    };
    getRows: (
        search: string,
        paging: TablePagination,
        sorting: TableSorting<SummaryViewModel>
    ) => Promise<PaginatedObjects<SummaryViewModel>>;
}

const initialSorting = {
    field: "scoringSystem" as const,
    order: "asc" as const,
};

const paginationOptions = {
    pageSizeOptions: [10, 20, 50],
    pageSizeInitialValue: 10,
};

export function useSummaryReport(filters: Filter): SummaryReportState {
    const { compositionRoot } = useAppContext();

    const [reloadKey, _reload] = useReload();
    const snackbar = useSnackbar();
    const [sorting, setSorting] = useState<TableSorting<SummaryViewModel>>();

    const selectablePeriods = useSelectablePeriods(startYear);
    const filterOptions = useMemo(() => getFilterOptions(selectablePeriods), [selectablePeriods]);

    const getRows = useMemo(
        () => async (_search: string, paging: TablePagination, sorting: TableSorting<SummaryViewModel>) => {
            const { pager, objects } = await compositionRoot.summaryMortality
                .get({
                    paging: { page: paging.page, pageSize: paging.pageSize },
                    sorting: getSortingFromTableSorting(sorting),
                    ...filters,
                })
                .catch(error => {
                    snackbar.error(error.message);
                    return emptyPage;
                });

            setSorting(sorting);
            console.debug("Reloading", reloadKey);
            return { pager, objects: getSummaryViews(objects) };
        },
        [compositionRoot.summaryMortality, filters, reloadKey, snackbar]
    );

    const downloadCsv: TableGlobalAction = {
        name: "downloadCsv",
        text: "Download CSV",
        icon: <StorageIcon />,
        onClick: async () => {
            if (!sorting) return;
            const { objects: summaryItems } = await compositionRoot.summaryMortality.get({
                paging: { page: 1, pageSize: 100000 },
                sorting: getSortingFromTableSorting(sorting),
                ...filters,
            });

            compositionRoot.summaryMortality.save("summary-table-report.csv", summaryItems);
        },
    };

    return {
        downloadCsv,
        filterOptions,
        initialSorting,
        paginationOptions,
        getRows,
    };
}

function getSortingFromTableSorting(sorting: TableSorting<SummaryViewModel>): Sorting<SummaryItem> {
    return {
        field: sorting.field === "id" ? "scoringSystem" : sorting.field,
        direction: sorting.order,
    };
}

function getFilterOptions(selectablePeriods: string[]): FilterOptions {
    return {
        periods: selectablePeriods,
    };
}

const startYear = 2014;
