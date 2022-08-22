import { TablePagination, TableSorting, useSnackbar } from "@eyeseetea/d2-ui-components";
import React, { useMemo } from "react";
import i18n from "../../../../locales";
import SyncIcon from "@material-ui/icons/Sync";
import { useAppContext } from "../../../contexts/app-context";
import { TableConfig, useObjectsTable } from "../../../components/objects-list/objects-list-hooks";
import { ObjectsList } from "../../../components/objects-list/ObjectsList";
import { getYesNoPartialViewModels, YesNoPartialViewModel } from "../ValidateYesNoPartialReportViewModel";
import { DataValueItem, parseDataValueItemId } from "../../../../domain/validate-yesnopartial/entities/DataValueItem";
import _ from "lodash";
import { useReload } from "../../../utils/use-reload";
import { useSnackbarOnError } from "../../../utils/snackbar";
import { Sorting } from "../../../../domain/common/entities/PaginatedObjects";
import { getOrgUnitIdsFromPaths } from "../../../../domain/common/entities/OrgUnit";
import { DataValuesFilter } from "./Filters";

export const ValidateYesNoPartialList: React.FC = React.memo(() => {
    const { compositionRoot, config } = useAppContext();
    const snackbar = useSnackbar();

    const [reloadKey, reload] = useReload();

    const baseConfig: TableConfig<YesNoPartialViewModel> = useMemo(
        () => ({
            columns: [
                { name: "ou_name", text: i18n.t("Org unit"), sortable: true },
                { name: "ou_uid", text: i18n.t("Org unit uid"), sortable: true },
                { name: "de_name", text: i18n.t("DataElement"), sortable: true },
                { name: "de_uid", text: i18n.t("DataElement uid"), sortable: true },
                { name: "yes", text: i18n.t("Yes"), sortable: true },
                { name: "no", text: i18n.t("No"), sortable: true },
                { name: "partial", text: i18n.t("Partial"), sortable: true },
                { name: "period", text: i18n.t("period"), sortable: true },
                { name: "count", text: i18n.t("count"), sortable: true },
            ],
            actions: [
                {
                    name: "yes",
                    text: i18n.t("Yes"),
                    icon: <SyncIcon />,
                    multiple: true,
                    onClick: async (selectedIds: string[]) => {
                        const items = _.compact(selectedIds.map(item => parseDataValueItemId(item)));
                        if (items.length === 0) return;

                        const result = await compositionRoot.validateYesNoPartial.push(items, "yes");
                        if (!result) snackbar.error(i18n.t("Error when trying to save the datavalues"));

                        reload();
                    },
                    isActive: () => {
                        return true;
                    },
                },
                {
                    name: "no",
                    text: i18n.t("No"),
                    icon: <SyncIcon />,
                    multiple: true,
                    onClick: async (selectedIds: string[]) => {
                        const items = _.compact(selectedIds.map(item => parseDataValueItemId(item)));
                        if (items.length === 0) return;

                        const result = await compositionRoot.validateYesNoPartial.push(items, "no");
                        if (!result) snackbar.error(i18n.t("Error when trying to save the datavalues"));

                        reload();
                    },
                    isActive: () => {
                        return true;
                    },
                },
                {
                    name: "partial",
                    text: i18n.t("Partial"),
                    icon: <SyncIcon />,
                    multiple: true,
                    onClick: async (selectedIds: string[]) => {
                        const items = _.compact(selectedIds.map(item => parseDataValueItemId(item)));
                        if (items.length === 0) return;

                        const result = await compositionRoot.validateYesNoPartial.push(items, "partial");
                        if (!result) snackbar.error(i18n.t("Error when trying to save the datavalues"));

                        reload();
                    },
                    isActive: () => {
                        return true;
                    },
                },
            ],
            initialSorting: {
                field: "ou_uid" as const,
                order: "asc" as const,
            },
            paginationOptions: {
                pageSizeOptions: [10, 20, 50],
                pageSizeInitialValue: 10,
            },
        }),
        [compositionRoot, reload, snackbar]
    );

    const getRows = useMemo(
        () => async (paging: TablePagination, sorting: TableSorting<YesNoPartialViewModel>) => {
            const { pager, objects } = await compositionRoot.validateYesNoPartial.get({
                config,
                paging: { page: paging.page, pageSize: paging.pageSize },
                sorting: getSortingFromTableSorting(sorting),
                ...getUseCaseOptions(getEmptyDataValuesFilter()),
            });
            console.debug("Reloading", reloadKey);
            return {
                objects: getYesNoPartialViewModels(objects),
                pager,
            };
        },
        [config, compositionRoot, reloadKey]
    );

    function getSortingFromTableSorting(sorting: TableSorting<YesNoPartialViewModel>): Sorting<DataValueItem> {
        return {
            field: sorting.field === "id" ? "ou_uid" : sorting.field,
            direction: sorting.order,
        };
    }

    function getUseCaseOptions(filter: DataValuesFilter) {
        return {
            ...filter,
            orgUnitIds: getOrgUnitIdsFromPaths(filter.orgUnitPaths),
        };
    }

    function getEmptyDataValuesFilter(): DataValuesFilter {
        return {
            orgUnitPaths: [],
            periods: [],
        };
    }

    const getRowsWithSnackbarOrError = useSnackbarOnError(getRows);
    const tableProps = useObjectsTable(baseConfig, getRowsWithSnackbarOrError);

    return (
        <ObjectsList<YesNoPartialViewModel>
            key={reloadKey}
            hideSelectAll={true}
            {...tableProps}
            columns={tableProps.columns}
        ></ObjectsList>
    );
});
