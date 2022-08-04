import { PaginationOptions, TableColumn, TableSorting } from "@eyeseetea/d2-ui-components";
import React from "react";
import i18n from "../../../../locales";
import DoneIcon from "@material-ui/icons/Done";
import { useAppContext } from "../../../contexts/app-context";
import { useSnackbarOnError } from "../../../utils/snackbar";
import { TableConfig, useObjectsTable } from "../../../components/objects-list/objects-list-hooks";
import { ObjectsList } from "../../../components/objects-list/ObjectsList";
import { getYesNoPartialViewModels, YesNoPartialViewModel } from "../ValidateYesNoPartialnReportViewModel";
//import { Sorting } from "../../../../domain/common/entities/PaginatedObjects";

export const ValidateYesNoPartialList: React.FC = React.memo(() => {
    const { compositionRoot, config } = useAppContext();
    const baseConfig = React.useMemo(getBaseListConfig, []);
    //    const [sorting, setSorting] = React.useState<TableSorting<YesNoPartialViewModel>>();

    const getRows = React.useMemo(
        () => async () => //            paging: TablePagination, sorting: TableSorting<YesNoPartialViewModel>
        {
            //          setSorting(sorting);
            const { pager, objects } = await compositionRoot.validateYesNoPartial.get(
                config
                //                 sorting: getSortingFromTableSorting(sorting),
            );
            return {
                pager,
                objects: getYesNoPartialViewModels(objects),
            };
        },
        [config, compositionRoot]
    );

    const getRowsWithSnackbarOrError = useSnackbarOnError(getRows);
    const tableProps = useObjectsTable(baseConfig, getRowsWithSnackbarOrError);

    return <ObjectsList<YesNoPartialViewModel> {...tableProps}></ObjectsList>;
});

/* function getSortingFromTableSorting(sorting: TableSorting<YesNoPartialViewModel>): Sorting<YesNoPartialViewModel> {
    return {
        field: sorting.field === "id" ? "pe_startdate" : sorting.field,
        direction: sorting.order,
    };
} */

function getBaseListConfig(): TableConfig<YesNoPartialViewModel> {
    const paginationOptions: PaginationOptions = {
        pageSizeOptions: [10, 20, 50],
        pageSizeInitialValue: 20,
    };

    const initialSorting: TableSorting<YesNoPartialViewModel> = {
        field: "pe_startdate" as const,
        order: "asc" as const,
    };

    const baseConfig: TableConfig<DataApprovalViewModel> = useMemo(
        () => ({ columns: [
        { name: "ou_name", text: i18n.t("Org unit"), sortable: true },
        { name: "ou_uid", text: i18n.t("Org unit uid"), sortable: true },
        { name: "de_name", text: i18n.t("DataElement"), sortable: true },
        { name: "de_uid", text: i18n.t("DataElement uid"), sortable: true },
        { name: "yes", text: i18n.t("Yes"), sortable: true },
        { name: "no", text: i18n.t("No"), sortable: true },
        { name: "partial", text: i18n.t("Partial"), sortable: true },
        { name: "pe_startdate", text: i18n.t("period"), sortable: true },
        { name: "count", text: i18n.t("count"), sortable: true },
        // { name: "lastUpdated", text: i18n.t("lastUpdated"), sortable: true },
        //   { name: "storedBy", text: i18n.t("stored By"), sortable: true },
        //{ name: "created", text: i18n.t("Created"), sortable: true },
        ]
        ,actions: [
            {
                name: "yes",
                text: i18n.t("Yes"),
                icon: <DoneIcon />,
                multiple: false,
                onClick: async (selectedIds: string[]) => {
                    const items = _.compact(selectedIds.map(item => parseDataValueItemId(item)));
                    if (items.length === 0) return;
    
                    const result = await compositionRoot.dataApproval.updateStatus(items, "complete");
                    if (!result) snackbar.error(i18n.t("Error when trying to complete data set"));
    
                    reload();
                },
                isActive: rows => _.every(rows, row => row.completed === false),
            },
            {
                name: "no",
                text: i18n.t("No"),
                icon: <RemoveIcon />,
                multiple: true,
                onClick: async (selectedIds: string[]) => {
                    const items = _.compact(selectedIds.map(item => parseDataValueItemId(item)));
                    if (items.length === 0) return;
    
                    const result = await compositionRoot.dataApproval.updateStatus(items, "incomplete");
                    if (!result) snackbar.error(i18n.t("Error when trying to incomplete data set"));
    
                    reload();
                },
                isActive: rows => _.every(rows, row => row.completed === true),
            },
            {
                name: "partial",
                text: i18n.t("Partial"),
                icon: <DoneAllIcon />,
                multiple: true,
                onClick: async (selectedIds: string[]) => {
                    const items = _.compact(selectedIds.map(item => parseDataValueItemId(item)));
                    if (items.length === 0) return;
    
                    const result = await compositionRoot.dataApproval.updateStatus(items, "approve");
                    if (!result) snackbar.error(i18n.t("Error when trying to approve data set"));
    
                    reload();
                },
                isActive: rows => _.every(rows, row => row.validated === false),
            }
        ],
        }
    ];
 
    return { columns, actions, initialSorting, paginationOptions };
}
