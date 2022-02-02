import {
    PaginationOptions,
    TableColumn,
    TableGlobalAction,
    TablePagination,
    TableSorting,
} from "@eyeseetea/d2-ui-components";
import StorageIcon from "@material-ui/icons/Storage";
import React from "react";
import i18n from "../../../../locales";
import { useAppContext } from "../../../contexts/app-context";
import { useSnackbarOnError } from "../../../utils/snackbar"; 
import { TableConfig, useObjectsTable } from "../../../components/objects-list/objects-list-hooks";
import { ObjectsList } from "../../../components/objects-list/ObjectsList";
import { DataQualityReportIndicatorViewModel, getDataQualityReportIndicatorViews } from "../DataQualityReportIndicatorViewModel";

export const InvalidIndicatorsList: React.FC = React.memo(() => {
    const { compositionRoot } = useAppContext();
    const baseConfig = React.useMemo(getBaseListConfig, []);
    const [sorting, setSorting] = React.useState<TableSorting<DataQualityReportIndicatorViewModel>>();

    const getRows = React.useMemo(
        () => async (paging: TablePagination, sorting: TableSorting<DataQualityReportIndicatorViewModel>) => {
            setSorting(sorting);
            const objects = getDataQualityReportIndicatorViews(
                await compositionRoot.dataQuality.getValidations()
            );
            paging.total = objects.length;
            paging.page = 1;
            paging.pageSize = 20;
            return {
                objects: objects,
                pager: paging,
            };
        },
        [compositionRoot]
    );

    const getRowsWithSnackbarOrError = useSnackbarOnError(getRows);
    const tableProps = useObjectsTable(baseConfig, getRowsWithSnackbarOrError);

    const downloadCsv: TableGlobalAction = {
        name: "downloadCsv",
        text: "Download CSV",
        icon: <StorageIcon />,
        onClick: async () => {
            if (!sorting) return;

            compositionRoot.dataQuality.exportToCsv(
            ); 
        },
    };

    return <ObjectsList<DataQualityReportIndicatorViewModel> {...tableProps} globalActions={[downloadCsv]}></ObjectsList>;
});

/* function getSortingFromTableSorting(sorting: TableSorting<DataQualityReportViewModel>): Sorting<Indicator> {
    return {
        field: sorting.field === "id" ? "metadataType" : sorting.field,
        direction: sorting.order,
    };
} */

function getBaseListConfig(): TableConfig<DataQualityReportIndicatorViewModel> {
    const paginationOptions: PaginationOptions = {
        pageSizeOptions: [10, 20, 50],
        pageSizeInitialValue: 20,
    };

    const initialSorting: TableSorting<DataQualityReportIndicatorViewModel> = {
        field: "metadataType" as const,
        order: "asc" as const,
    };

    const columns: TableColumn<DataQualityReportIndicatorViewModel>[] = [
        { name: "id", text: i18n.t("Id"), sortable: true },
        { name: "metadataType", text: i18n.t("Metadata Type"), sortable: true },
        { name: "name", text: i18n.t("name"), sortable: true },
        { name: "createdBy", text: i18n.t("Created By"), sortable: true },
        { name: "lastUpdated", text: i18n.t("lastUpdated"), sortable: true },
        { name: "denominator", text: i18n.t("denominator"), sortable: true },
        { name: "denominatorresult", text: i18n.t("Valid Denominator"), sortable: true },
        { name: "numerator", text: i18n.t("numerator"), sortable: true },
        { name: "numeratorresult", text: i18n.t("Valid Numerator"), sortable: true },
    ];

    return { columns, initialSorting, paginationOptions };
}
