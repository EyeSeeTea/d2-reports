import { useAppContext } from "../../../contexts/app-context";
import useListColumns from "./useListColumns";
import { Filter } from "./Filters";
import { useGetDataSubmissions } from "./useGetDataSubmissions";
import { useGetUserPermissions } from "./useGetUserPermissions";

const initialSorting = {
    field: "orgUnitName" as const,
    order: "asc" as const,
};
const pagination = {
    pageSizeOptions: [10, 20, 50],
    pageSizeInitialValue: 10,
};

export function useDataSubmissionList(filters: Filter) {
    const { compositionRoot, config } = useAppContext();

    const { isEARModule, isEGASPUser, userModules } = useGetUserPermissions(compositionRoot, config, filters);
    const { visibleColumns, visibleEARColumns, saveReorderedColumns, saveReorderedEARColumns } = useListColumns(
        compositionRoot,
        isEARModule
    );
    const { dataSubmissionPeriod, selectablePeriods, getEARRows, getRows, reload } = useGetDataSubmissions(
        compositionRoot,
        config,
        filters
    );

    return {
        dataSubmissionPeriod,
        initialSorting,
        isEARModule,
        isEGASPUser,
        pagination,
        selectablePeriods,
        userModules,
        visibleColumns,
        visibleEARColumns,
        getEARRows,
        getRows,
        reload,
        saveReorderedColumns,
        saveReorderedEARColumns,
    };
}
