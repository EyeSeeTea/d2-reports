import React, { useMemo, useState } from "react";
import { Filter, Filters, auditTypeItems } from "./Filters";
import { Config } from "../../../../domain/common/entities/Config";
import { useAppContext } from "../../../contexts/app-context";
import _ from "lodash";
import { AuditViewModel, getAuditViews } from "../AuditViewModel";
import {
    ObjectsList,
    TableConfig,
    TableGlobalAction,
    TablePagination,
    TableSorting,
    useObjectsTable,
} from "@eyeseetea/d2-ui-components";
import StorageIcon from "@material-ui/icons/Storage";
import i18n from "../../../../locales";
import { useReload } from "../../../utils/use-reload";
import { Sorting } from "../../../../domain/common/entities/PaginatedObjects";
import { AuditItem } from "../../../../domain/reports/csy-audit-emergency/entities/AuditItem";

export const CSYAuditEmergencyList: React.FC = React.memo(() => {
    const { compositionRoot, config } = useAppContext();

    const [reloadKey, _reload] = useReload();
    const [filters, setFilters] = useState(() => getEmptyDataValuesFilter(config));
    const [sorting, setSorting] = useState<TableSorting<AuditViewModel>>();

    const selectablePeriods = React.useMemo(() => {
        const currentYear = new Date().getFullYear();
        return _.range(currentYear - 10, currentYear + 1).map(n => n.toString());
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
            const { pager, objects } = await compositionRoot.auditEmergency.get({
                config,
                paging: { page: paging.page, pageSize: paging.pageSize },
                sorting: getSortingFromTableSorting(sorting),
                ...filters,
            });

            setSorting(sorting);
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

    const downloadCsv: TableGlobalAction = {
        name: "downloadCsv",
        text: "Download CSV",
        icon: <StorageIcon />,
        onClick: async () => {
            if (!sorting) return;
            const { objects: auditItems } = await compositionRoot.auditEmergency.get({
                config,
                paging: { page: 1, pageSize: 100000 },
                sorting: getSortingFromTableSorting(sorting),
                ...filters,
            });

            compositionRoot.auditEmergency.save("audit-report.csv", auditItems);
        },
    };

    const auditDefinition =
        auditTypeItems.find(auditTypeItem => auditTypeItem.value === filters.auditType)?.auditDefinition ?? "";

    return (
        <React.Fragment>
            <ObjectsList<AuditViewModel> {...tableProps} onChangeSearch={undefined} globalActions={[downloadCsv]}>
                <div>
                    <Filters values={filters} options={filterOptions} onChange={setFilters} />
                    <p>
                        Audit Definition: <strong>{auditDefinition}</strong>
                    </p>
                </div>
            </ObjectsList>
        </React.Fragment>
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
        auditType: "overall-mortality",
        orgUnitPaths: [],
        year: "2020",
        periodType: "yearly",
        quarter: undefined,
    };
}
