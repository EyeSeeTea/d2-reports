import { ObjectsList, TableColumn, TableConfig } from "@eyeseetea/d2-ui-components";
import React, { useCallback, useMemo } from "react";
import i18n from "../../../locales";
import { useAppContext } from "../../contexts/app-context";

import { DataDiffViewModel } from "./DataDiffViewModel";

export const DataDifferencesList: React.FC = React.memo(() => {
    const { compositionRoot } = useAppContext();
    const _baseConfig: TableConfig<DataDiffViewModel> = useMemo(
        () => ({
            columns: [
                { name: "dataelement", text: i18n.t("Data Element"), sortable: false },
                { name: "value", text: i18n.t("Value"), sortable: false },
                { name: "apvddataelement", text: i18n.t("Approved data element"), sortable: false },
                { name: "apvdvalue", text: i18n.t("APVD Value"), sortable: false },
            ],
            actions: [],
            initialSorting: {
                field: "dataelement" as const,
                order: "asc" as const,
            },
            paginationOptions: {
                pageSizeOptions: [10, 20, 50],
                pageSizeInitialValue: 10,
            },
        }),
        []
    );

    const saveReorderedColumns = useCallback(
        async (columnKeys: Array<keyof DataDiffViewModel>) => {
            await compositionRoot.dataDuplicate.saveColumns(columnKeys);
        },
        [compositionRoot]
    );

    const columnsToShow: TableColumn<DataDiffViewModel>[] = [
        {
            name: "dataelement",
            text: "Data Element",
            sortable: true,
            hidden: false,
        },
        {
            name: "apvddataelement",
            text: "Approved data element",
            sortable: true,
            hidden: false,
        },
        {
            name: "value",
            text: "Original value",
            sortable: false,
            hidden: false,
        },
        {
            name: "apvdvalue",
            text: "APVD value",
            sortable: false,
            hidden: false,
        },
    ];

    const tableProps = {
        actions: [],
        columnsToShow: [
            {
                name: "dataelement",
                text: "Data Element",
                sortable: true,
            },
            {
                name: "apvddataelement",
                text: "Approved data element",
                sortable: true,
            },
            {
                name: "value",
                text: "Original value",
                sortable: false,
            },
            {
                name: "apvdvalue",
                text: "APVD value",
                sortable: false,
            },
        ],
        ids: undefined,
        initialSorting: {
            field: "dataSet",
            order: "asc",
        },
        isLoading: false,
        onChange: undefined,
        pagination: {
            page: 1,
            pageSize: 10,
            total: 900,
            pageCount: 90,
        },
        paginationOptions: {
            pageSizeOptions: [10, 20, 50],
            pageSizeInitialValue: 10,
        },
        reload: undefined,
        rows: [
            {
                datasetuid: "PWCUb3Se1Ie",
                orgunituid: "av3fkpFxEXj",
                period: "2012",
                value: "2022-09-02T13:09",
                apvdvalue: null,
                dataelement: "MAL - Submission date",
                apvddataelement: null,
            },
            {
                datasetuid: "PWCUb3Se1Ie",
                orgunituid: "av3fkpFxEXj",
                period: "2012",
                value: "No",
                apvdvalue: null,
                dataelement: "MAL - ACD for mass screening (including non-febrile) - policy implemented this year",
                apvddataelement:
                    "MAL - ACD for mass screening (including non-febrile) - policy implemented this year-APVD",
            },
            {
                datasetuid: "PWCUb3Se1Ie",
                orgunituid: "av3fkpFxEXj",
                period: "2012",
                value: "Yes",
                apvdvalue: null,
                dataelement:
                    "MAL - ACD in response to passively detected case (reactive) - policy implemented this year",
                apvddataelement:
                    "MAL - ACD in response to passively detected case (reactive) - policy implemented this year-APVD",
            },
            {
                datasetuid: "PWCUb3Se1Ie",
                orgunituid: "av3fkpFxEXj",
                period: "2012",
                value: "Yes",
                apvdvalue: null,
                dataelement:
                    "MAL - ACD of febrile cases at community level (pro-active) - policy implemented this year",
                apvddataelement:
                    "MAL - ACD of febrile cases at community level (pro-active) - policy implemented this year-APVD",
            },
        ],
        searchBoxLabel: "",
    };

    return (
        // @ts-ignore
        <ObjectsList<DataDiffViewModel>
            {...tableProps}
            columns={columnsToShow}
            onChangeSearch={undefined}
            onReorderColumns={saveReorderedColumns}
        ></ObjectsList>
    );
});
