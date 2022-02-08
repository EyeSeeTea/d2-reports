import {
    PaginationOptions,
    TableColumn,
    TableGlobalAction,
    TablePagination,
    TableSorting
} from "@eyeseetea/d2-ui-components";
import StorageIcon from "@material-ui/icons/Storage";
import _ from "lodash";
import React from "react";
import i18n from "../../../../locales";
import { TableConfig, useObjectsTable } from "../../../components/objects-list/objects-list-hooks";
import { ObjectsList } from "../../../components/objects-list/ObjectsList";
import { useAppContext } from "../../../contexts/app-context";
import { useSnackbarOnError } from "../../../utils/snackbar";
import {
    DataQualityReportIndicatorViewModel,
    getDataQualityReportIndicatorViews
} from "../DataQualityReportIndicatorViewModel";

export const InvalidIndicatorsList: React.FC = React.memo(() => {
    const { compositionRoot } = useAppContext();
    const baseConfig = React.useMemo(getBaseListConfig, []);

    const getRows = React.useMemo(
        () => async (paging: TablePagination, sorting: TableSorting<DataQualityReportIndicatorViewModel>) => {
            const { field, order: direction } = sorting;
            const { page, pageSize } = paging;

            const response = await compositionRoot.dataQuality.getValidations();
            const objects = getDataQualityReportIndicatorViews(response);

            const sortedData = _.orderBy(
                objects,
                [data => (data[field] ? data[field]?.toLowerCase() : "")],
                [direction as "asc" | "desc"]
            );

            const total = sortedData.length;
            const pageCount = paging ? Math.ceil(sortedData.length / pageSize) : 1;
            const firstItem = paging ? (page - 1) * pageSize : 0;
            const lastItem = paging ? firstItem + pageSize : sortedData.length;
            const paginatedData = _.slice(sortedData, firstItem, lastItem);

            return { objects: paginatedData, pager: { page, pageCount, total } };
        },
        [compositionRoot]
    );

    const getRowsWithSnackbarOrError = useSnackbarOnError(getRows);
    const tableProps = useObjectsTable(baseConfig, getRowsWithSnackbarOrError);

    const downloadCsv: TableGlobalAction = {
        name: "downloadCsv",
        text: "Download CSV",
        icon: <StorageIcon />,
        onClick: async () => compositionRoot.dataQuality.exportToCsv(),
    };

    return (
        <ObjectsList<DataQualityReportIndicatorViewModel> {...tableProps} globalActions={[downloadCsv]}></ObjectsList>
    );
});

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
