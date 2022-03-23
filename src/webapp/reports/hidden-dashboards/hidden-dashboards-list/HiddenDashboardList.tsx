/* eslint-disable react/jsx-no-target-blank */
import {
    PaginationOptions,
    TableColumn,
    TableGlobalAction,
    TablePagination,
    TableSorting,
} from "@eyeseetea/d2-ui-components";
import StorageIcon from "@material-ui/icons/Storage";
import _ from "lodash";
import React from "react";
import i18n from "../../../../locales";
import { TableConfig, useObjectsTable } from "../../../components/objects-list/objects-list-hooks";
import { ObjectsList } from "../../../components/objects-list/ObjectsList";
import { useAppContext } from "../../../contexts/app-context";
import { useSnackbarOnError } from "../../../utils/snackbar";
import { getHiddenDashboardViews, HiddenDashboardViewModel } from "../HiddenVisualizationViewModel";

export const HiddenDashboardList: React.FC = React.memo(() => {
    const { compositionRoot } = useAppContext();
    const baseConfig = React.useMemo(getBaseListConfig, []);

    const getRows = React.useMemo(
        () => async (paging: TablePagination, sorting: TableSorting<HiddenDashboardViewModel>) => {
            const { field, order: direction } = sorting;
            const { page, pageSize } = paging;

            const response = await compositionRoot.hiddenDashboards.getHiddenDashboards();

            const objects = getHiddenDashboardViews(response);

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
        onClick: async () => compositionRoot.hiddenDashboards.exportDashboardsToCsv(),
    };
    return (
        <ObjectsList<HiddenDashboardViewModel>
            {...tableProps}
            globalActions={[downloadCsv]}
        ></ObjectsList>
    );
});

function getBaseListConfig(): TableConfig<HiddenDashboardViewModel> {
    const paginationOptions: PaginationOptions = {
        pageSizeOptions: [10, 20, 50],
        pageSizeInitialValue: 20,
    };

    const initialSorting: TableSorting<HiddenDashboardViewModel> = {
        field: "name" as const,
        order: "asc" as const,
    };

    const columns: TableColumn<HiddenDashboardViewModel>[] = [
        { name: "id", text: i18n.t("Id"), sortable: true },
        { name: "code", text: i18n.t("code"), sortable: true },
        { name: "name", text: i18n.t("name"), sortable: true },
        { name: "sharing", text: i18n.t("Sharing"), sortable: true },
        { name: "details", text: i18n.t("Details"), sortable: true, getValue: model => <a href={model.details}  target="_blank">{model.details}</a> },
    ];

    return { columns, initialSorting, paginationOptions };
}
