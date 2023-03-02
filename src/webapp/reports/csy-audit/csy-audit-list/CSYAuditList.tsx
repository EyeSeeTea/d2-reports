import React, { useMemo, useState } from "react";
import { Filter, Filters } from "./Filters";
import { Config } from "../../../../domain/common/entities/Config";
import { useAppContext } from "../../../contexts/app-context";
import _ from "lodash";
import { AuditViewModel, getAuditViews } from "../AuditViewModel";
import { ObjectsList, TableConfig, TablePagination, TableSorting, useObjectsTable } from "@eyeseetea/d2-ui-components";
import i18n from "@eyeseetea/d2-ui-components/locales";
import { useReload } from "../../../utils/use-reload";
import { Sorting } from "../../../../domain/common/entities/PaginatedObjects";
import { AuditItem } from "../../../../domain/reports/csy-audit/entities/AuditItem";

export const CSYAuditList: React.FC = React.memo(() => {
    const { compositionRoot, config } = useAppContext();

    const [reloadKey, _reload] = useReload();
    const [filters, setFilters] = useState(() => getEmptyDataValuesFilter(config));

    const selectablePeriods = React.useMemo(() => {
        const currentYear = new Date().getFullYear();
        return _.range(currentYear - 5, currentYear).map(n => n.toString());
    }, []);

    const baseConfig: TableConfig<AuditViewModel> = useMemo(
        () => ({
            columns: [{ name: "registerId", text: i18n.t("Register ID"), sortable: true }],
            actions: [],
            initialSorting: {
                field: "registerId" as const,
                order: "asc" as const,
            },
            paginationOptions: {
                pageSizeOptions: [10, 20, 50],
                pageSizeInitialValue: 10,
            },
        }),
        []
    );

    const getRows = useMemo(
        () => async (_search: string, paging: TablePagination, sorting: TableSorting<AuditViewModel>) => {
            const { pager, objects } = await compositionRoot.audit.get({
                config,
                paging: { page: paging.page, pageSize: paging.pageSize },
                sorting: getSortingFromTableSorting(sorting),
                ...filters,
            });

            console.debug("Reloading", reloadKey);
            return { pager, objects: getAuditViews(config, objects) };
        },
        [config, compositionRoot, filters, reloadKey]
    );

    const tableProps = useObjectsTable(baseConfig, getRows);

    function getFilterOptions(selectablePeriods: string[]) {
        return {
            periods: selectablePeriods,
        };
    }
    const filterOptions = useMemo(() => getFilterOptions(selectablePeriods), [selectablePeriods]);

    return (
        <ObjectsList<AuditViewModel> {...tableProps} onChangeSearch={undefined}>
            <Filters values={filters} options={filterOptions} onChange={setFilters} />
        </ObjectsList>
    );
});

export function getSortingFromTableSorting(sorting: TableSorting<AuditViewModel>): Sorting<AuditItem> {
    return {
        field: sorting.field === "id" ? "registerId" : sorting.field,
        direction: sorting.order,
    };
}

function getEmptyDataValuesFilter(_config: Config): Filter {
    return {
        auditType: "mortality",
        orgUnitPaths: [],
        periods: ["2021"],
        periodType: "yearly",
    };
}
