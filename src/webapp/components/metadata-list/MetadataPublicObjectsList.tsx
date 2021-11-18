import {
    PaginationOptions,
    TableColumn,
    TableGlobalAction,
    TablePagination,
    TableSorting,
} from "@eyeseetea/d2-ui-components";
import StorageIcon from "@material-ui/icons/Storage";
import React from "react";
import { MetadataObject } from "../../../domain/entities/MetadataObject";
import { Sorting } from "../../../domain/entities/PaginatedObjects";
import i18n from "../../../locales";
import { useAppContext } from "../../contexts/app-context";
import { useSnackbarOnError } from "../../utils/snackbar";
import { getMetadataViews, MetadataObjectViewModel } from "../../view-models/MetadataObjectViewModel";
import { TableConfig, useObjectsTable } from "../objects-list/objects-list-hooks";
import { ObjectsList } from "../objects-list/ObjectsList";

export const MetadataPublicObjectsList: React.FC = React.memo(() => {
    const { compositionRoot } = useAppContext();
    const baseConfig = React.useMemo(getBaseListConfig, []);
    const [sorting, setSorting] = React.useState<TableSorting<MetadataObjectViewModel>>();

    const getRows = React.useMemo(
        () => async (paging: TablePagination, sorting: TableSorting<MetadataObjectViewModel>) => {
            setSorting(sorting);
            const objects = getMetadataViews(
                await compositionRoot.metadata.get.execute({
                    sorting: getSortingFromTableSorting(sorting),
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

            compositionRoot.metadata.save.execute(
                "metadata-objects.csv",
                await compositionRoot.metadata.get.execute({
                    sorting: getSortingFromTableSorting(sorting),
                    publicObjects: true,
                    removeTypes: [],
                })
            );
        },
    };

    return <ObjectsList<MetadataObjectViewModel> {...tableProps} globalActions={[downloadCsv]}></ObjectsList>;
});

function getSortingFromTableSorting(sorting: TableSorting<MetadataObjectViewModel>): Sorting<MetadataObject> {
    return {
        field: sorting.field === "id" ? "metadataType" : sorting.field,
        direction: sorting.order,
    };
}

function getBaseListConfig(): TableConfig<MetadataObjectViewModel> {
    const paginationOptions: PaginationOptions = {
        pageSizeOptions: [10, 20, 50],
        pageSizeInitialValue: 20,
    };

    const initialSorting: TableSorting<MetadataObjectViewModel> = {
        field: "metadataType" as const,
        order: "asc" as const,
    };

    const columns: TableColumn<MetadataObjectViewModel>[] = [
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
