import {
    ObjectsList,
    TableColumn,
    TableConfig,
    TablePagination,
    TableSorting,
    useObjectsTable,
} from "@eyeseetea/d2-ui-components";
import _ from "lodash";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Config } from "../../../../domain/common/entities/Config";
import { Sorting } from "../../../../domain/common/entities/PaginatedObjects";
import { MalDataSubscriptionItem } from "../../../../domain/reports/mal-data-subscription/entities/MalDataSubscriptionItem";
import i18n from "../../../../locales";
import { useAppContext } from "../../../contexts/app-context";
import { useReload } from "../../../utils/use-reload";
import { DataSubscriptionViewModel, getDataSubscriptionViews } from "../DataSubscriptionViewModel";
import { Namespaces } from "../../../../data/common/clients/storage/Namespaces";
import { DataElementsFilter, Filters } from "./Filters";
import { NamedRef } from "../../../../domain/common/entities/Base";

export const DataSubscriptionList: React.FC = React.memo(() => {
    const { compositionRoot, config, api } = useAppContext();

    const [filters, setFilters] = useState(() => getEmptyDataValuesFilter(config));
    const [visibleColumns, setVisibleColumns] = useState<string[]>();
    const [sections, setSections] = useState<NamedRef[]>([]);

    const [reloadKey] = useReload();

    useEffect(() => {
        compositionRoot.malDataSubscription
            .getColumns(Namespaces.MAL_SUBSCRIPTION_STATUS_USER_COLUMNS)
            .then(columns => {
                setVisibleColumns(columns);
            });
    }, [compositionRoot]);

    const baseConfig: TableConfig<DataSubscriptionViewModel> = useMemo(
        () => ({
            columns: [
                { name: "dataElementName", text: i18n.t("Data Element"), sortable: true },
                { name: "subscription", text: i18n.t("Subscription status"), sortable: true },
                { name: "sectionName", text: i18n.t("Sections"), sortable: true },
                {
                    name: "lastDateOfSubscription",
                    text: i18n.t("Last Date of Subscription"),
                    sortable: true,
                    hidden: true,
                },
            ],
            actions: [],
            initialSorting: {
                field: "dataElementName" as const,
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
        () => async (_search: string, paging: TablePagination, sorting: TableSorting<DataSubscriptionViewModel>) => {
            const { pager, objects } = await compositionRoot.malDataSubscription.get({
                config,
                paging: { page: paging.page, pageSize: paging.pageSize },
                sorting: getSortingFromTableSorting(sorting),
                ...getUseCaseOptions(filters),
            });

            console.debug("Reloading", reloadKey);
            return { pager, objects: getDataSubscriptionViews(config, objects) };
        },
        [compositionRoot.malDataSubscription, config, filters, reloadKey]
    );


    function getUseCaseOptions(filter: DataElementsFilter) {
        return {
            ...filter,
        };
    }

    const saveReorderedColumns = useCallback(
        async (columnKeys: Array<keyof DataSubscriptionViewModel>) => {
            if (!visibleColumns) return;

            await compositionRoot.malDataSubscription.saveColumns(
                Namespaces.MAL_SUBSCRIPTION_STATUS_USER_COLUMNS,
                columnKeys
            );
        },
        [compositionRoot, visibleColumns]
    );

    const tableProps = useObjectsTable(baseConfig, getRows);

    const columnsToShow = useMemo<TableColumn<DataSubscriptionViewModel>[]>(() => {
        if (!visibleColumns || _.isEmpty(visibleColumns)) return tableProps.columns;

        const indexes = _(visibleColumns)
            .map((columnName, idx) => [columnName, idx] as [string, number])
            .fromPairs()
            .value();

        return _(tableProps.columns)
            .map(column => ({ ...column, hidden: !visibleColumns.includes(column.name) }))
            .sortBy(column => indexes[column.name] || 0)
            .value();
    }, [tableProps.columns, visibleColumns]);

    const getDatasetSections = useCallback(async () => {
        const { sections } = await api.get<any>(`/dataSets/PWCUb3Se1Ie`, { fields: "sections[name, id]" }).getData();

        return sections;
    }, [api]);

    const getFilterOptions = useCallback(
        (_config: Config) => {
            getDatasetSections().then(sections => setSections(sections));

            return {
                sections: sections,
                elementType: ["Data Elements"],
                subscription: ["Subscribed", "Not Subscribed"],
            };
        },
        [getDatasetSections, sections]
    );

    const filterOptions = React.useMemo(() => getFilterOptions(config), [config, getFilterOptions]);

    return (
        <ObjectsList<DataSubscriptionViewModel>
            {...tableProps}
            columns={columnsToShow}
            onChangeSearch={undefined}
            onReorderColumns={saveReorderedColumns}
        >
            <Filters values={filters} options={filterOptions} onChange={setFilters} />
        </ObjectsList>
    );
});

function getSortingFromTableSorting(
    sorting: TableSorting<DataSubscriptionViewModel>
): Sorting<MalDataSubscriptionItem> {
    return {
        field: sorting.field === "id" ? "dataElementName" : sorting.field,
        direction: sorting.order,
    };
}

function getEmptyDataValuesFilter(_config: Config): DataElementsFilter {
    return {
        sections: [],
        dataElementIds: [],
        elementTypes: [],
    };
}
