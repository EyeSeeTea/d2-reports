import {
    PaginationOptions,
    TableColumn,
    TableGlobalAction,
    TablePagination,
    TableSorting,
} from "@eyeseetea/d2-ui-components";
import StorageIcon from "@material-ui/icons/Storage";
import React from "react";
import { ProgramIndicator } from "../../../../domain/common/entities/ProgramIndicator";
import { Sorting } from "../../../../domain/common/entities/PaginatedObjects";
import { useAppContext } from "../../../contexts/app-context";
import { useSnackbarOnError } from "../../../utils/snackbar";
import { getDataQualityReportViews, DataQualityReportViewModel } from "../DataQualityReportViewModel";
import { TableConfig, useObjectsTable } from "../../../components/objects-list/objects-list-hooks";
import { ObjectsList } from "../../../components/objects-list/ObjectsList";
import i18n from "../../../locales";

export const InvalidProgramIndicatorsList: React.FC = React.memo(() => {
    const { compositionRoot } = useAppContext();
    const baseConfig = React.useMemo(getBaseListConfig, []);
    const [sorting, setSorting] = React.useState<TableSorting<DataQualityReportViewModel>>();

    const getRows = React.useMemo(
        () => async (paging: TablePagination, sorting: TableSorting<DataQualityReportViewModel>) => {
            setSorting(sorting);
            const objects = getDataQualityReportViews(
                await compositionRoot.dataQuality.getProgramIndicators({
                    publicObjects: true,
                    removeTypes: [],
                })
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

            compositionRoot.dataQuality.saveProgramIndicators(
                "metadata-objects.csv",
                await compositionRoot.dataQuality.getProgramIndicators({
                    publicObjects: true,
                    removeTypes: [],
                })
            );
        },
    };

    return <ObjectsList<DataQualityReportViewModel> {...tableProps} globalActions={[downloadCsv]}></ObjectsList>;
});

function getBaseListConfig(): TableConfig<DataQualityReportViewModel> {
    const paginationOptions: PaginationOptions = {
        pageSizeOptions: [10, 20, 50],
        pageSizeInitialValue: 20,
    };

    const initialSorting: TableSorting<DataQualityReportViewModel> = {
        field: "metadataType" as const,
        order: "asc" as const,
    };

    const columns: TableColumn<DataQualityReportViewModel>[] = [
        { name: "id", text: i18n.t("Id"), sortable: true },
        { name: "metadataType", text: i18n.t("Metadata Type"), sortable: true },
        { name: "publicAccess", text: i18n.t("Public Access"), sortable: true },
        { name: "createdBy", text: i18n.t("Created By"), sortable: true },
        { name: "lastUpdatedBy", text: i18n.t("Last Updated By"), sortable: true },
        { name: "userGroupAccess", text: i18n.t("User Group Accesses"), sortable: true },
        { name: "userAccess", text: i18n.t("User Accesses"), sortable: true },
        { name: "name", text: i18n.t("name"), sortable: true },
        { name: "lastUpdated", text: i18n.t("lastUpdated"), sortable: true },
        { name: "created", text: i18n.t("created"), sortable: true },
    ];

    return { columns, initialSorting, paginationOptions };
}
