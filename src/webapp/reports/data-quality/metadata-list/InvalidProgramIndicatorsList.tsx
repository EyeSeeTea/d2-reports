import {
    PaginationOptions,
    TableColumn,
    TableGlobalAction,
    TablePagination,
    TableSorting,
} from "@eyeseetea/d2-ui-components";
import StorageIcon from "@material-ui/icons/Storage";
import CachedIcon from "@material-ui/icons/Cached";
import React from "react";
import { useAppContext } from "../../../contexts/app-context";
import { useSnackbarOnError } from "../../../utils/snackbar";
import { TableConfig, useObjectsTable } from "../../../components/objects-list/objects-list-hooks";
import { ObjectsList } from "../../../components/objects-list/ObjectsList";
import i18n from "../../../../locales";
import {
    DataQualityReportProgramIndicatorViewModel,
    getDataQualityReportProgramIndicatorViews,
} from "../DataQualityReportProgramIndicatorViewModel";
import _ from "lodash";

export const InvalidProgramIndicatorsList: React.FC = React.memo(() => {
    const { compositionRoot } = useAppContext();
    const baseConfig = React.useMemo(getBaseListConfig, []);

    const getRows = React.useMemo(
        () => async (paging: TablePagination, sorting: TableSorting<DataQualityReportProgramIndicatorViewModel>) => {
            const { field, order: direction } = sorting;
            const { page, pageSize } = paging;

            const objects = getDataQualityReportProgramIndicatorViews(
                await compositionRoot.dataQuality.getValidations()
            );

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
        onClick: async () => {
            compositionRoot.dataQuality.exportToCsv();
        },
    };
    const forceReload: TableGlobalAction = {
        name: "forceReload",
        text: "Force reload",
        icon: <CachedIcon />,
        onClick: async () => {
            compositionRoot.dataQuality.reloadValidations();
        },
    };

    return (
        <ObjectsList<DataQualityReportProgramIndicatorViewModel>
            {...tableProps}
            globalActions={[downloadCsv, forceReload]}
        ></ObjectsList>
    );
});

function getBaseListConfig(): TableConfig<DataQualityReportProgramIndicatorViewModel> {
    const paginationOptions: PaginationOptions = {
        pageSizeOptions: [10, 20, 50],
        pageSizeInitialValue: 20,
    };

    const initialSorting: TableSorting<DataQualityReportProgramIndicatorViewModel> = {
        field: "metadataType" as const,
        order: "asc" as const,
    };

    const columns: TableColumn<DataQualityReportProgramIndicatorViewModel>[] = [
        { name: "id", text: i18n.t("Id"), sortable: true },
        { name: "metadataType", text: i18n.t("Metadata Type"), sortable: true },
        { name: "name", text: i18n.t("name"), sortable: true },
        { name: "createdBy", text: i18n.t("Created By"), sortable: true },
        { name: "lastUpdated", text: i18n.t("lastUpdated"), sortable: true },
        { name: "expression", text: i18n.t("expression"), sortable: true },
        { name: "expressionrresult", text: i18n.t("Valid Expression"), sortable: true },
        { name: "filter", text: i18n.t("filter"), sortable: true },
        { name: "filterresult", text: i18n.t("Valid Filter"), sortable: true },
    ];

    return { columns, initialSorting, paginationOptions };
}
