import { useSnackbar, TableSorting, TablePagination, TableGlobalAction } from "@eyeseetea/d2-ui-components";
import { useState, useMemo } from "react";
import { useAppContext } from "../../../contexts/app-context";
import { useReload } from "../../../utils/use-reload";
import { emptyPage, PaginatedObjects, Sorting } from "../../../../domain/common/entities/PaginatedObjects";
import StorageIcon from "@material-ui/icons/Storage";
import { AuditItem } from "../../../../domain/reports/csy-audit-operative/entities/AuditItem";
import { AuditViewModel, getAuditViews } from "../AuditViewModel";
import { auditTypeItems, Filter, FilterOptions } from "./Filters";
import { CsvWriterDataSource } from "../../../../data/common/CsvWriterCsvDataSource";
import { CsvData } from "../../../../data/common/CsvDataSource";
import { downloadFile } from "../../../../data/common/utils/download-file";
import { useSelectablePeriods } from "../../../utils/selectablePeriods";

interface AuditReportState {
    auditDefinition: string;
    downloadCsv: TableGlobalAction;
    filterOptions: FilterOptions;
    initialSorting: TableSorting<AuditViewModel>;
    paginationOptions: {
        pageSizeOptions: number[];
        pageSizeInitialValue: number;
    };
    getRows: (
        search: string,
        paging: TablePagination,
        sorting: TableSorting<AuditViewModel>
    ) => Promise<PaginatedObjects<AuditViewModel>>;
}

const initialSorting = {
    field: "registerId" as const,
    order: "asc" as const,
};

const paginationOptions = {
    pageSizeOptions: [10, 20, 50],
    pageSizeInitialValue: 10,
};

export function useAuditReport(filters: Filter): AuditReportState {
    const { compositionRoot } = useAppContext();

    const [reloadKey, _reload] = useReload();
    const snackbar = useSnackbar();
    const [sorting, setSorting] = useState<TableSorting<AuditViewModel>>();

    const selectablePeriods = useSelectablePeriods(startYear);
    const filterOptions = useMemo(() => getFilterOptions(selectablePeriods), [selectablePeriods]);

    const auditDefinition =
        auditTypeItems.find(auditTypeItem => auditTypeItem.value === filters.auditType)?.auditDefinition ?? "";

    const getRows = useMemo(
        () => async (_search: string, paging: TablePagination, sorting: TableSorting<AuditViewModel>) => {
            const { pager, objects } = await compositionRoot.auditOperative
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
            return { pager, objects: getAuditViews(objects) };
        },
        [compositionRoot.auditOperative, filters, reloadKey, snackbar]
    );

    const downloadCsv: TableGlobalAction = {
        name: "downloadCsv",
        text: "Download CSV",
        icon: <StorageIcon />,
        onClick: async () => {
            if (!sorting) return;
            const { objects: auditItems } = await compositionRoot.auditOperative.get({
                paging: { page: 1, pageSize: 100000 },
                sorting: getSortingFromTableSorting(sorting),
                ...filters,
            });

            downloadAuditReport("audit-report.csv", auditItems);
        },
    };

    return {
        auditDefinition,
        filterOptions,
        initialSorting,
        paginationOptions,
        getRows,
        downloadCsv,
    };
}

export function getSortingFromTableSorting(sorting: TableSorting<AuditViewModel>): Sorting<AuditItem> {
    return {
        field: sorting.field === "id" ? "registerId" : sorting.field,
        direction: sorting.order,
    };
}

async function downloadAuditReport(filename: string, items: AuditItem[]): Promise<void> {
    const headers = csvFields.map(field => ({ id: field, text: field }));
    const rows = items.map(
        (dataValue): AuditItemRow => ({
            registerId: dataValue.registerId,
        })
    );
    const timestamp = new Date().toISOString();
    const csvDataSource = new CsvWriterDataSource();
    const csvData: CsvData<CsvField> = { headers, rows };
    const csvContents = `Time: ${timestamp}\n` + csvDataSource.toString(csvData);

    await downloadFile(csvContents, filename, "text/csv");
}

const csvFields = ["registerId"] as const;
type CsvField = typeof csvFields[number];
type AuditItemRow = Record<CsvField, string>;

function getFilterOptions(selectablePeriods: string[]): FilterOptions {
    return {
        periods: selectablePeriods,
    };
}

const startYear = 2014;
