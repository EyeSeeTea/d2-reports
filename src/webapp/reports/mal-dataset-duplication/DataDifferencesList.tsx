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
                { name: "dataSet", text: i18n.t("Data set"), sortable: true },
                { name: "dataelement", text: i18n.t("Data Element"), sortable: true },
                { name: "apvddataelement", text: i18n.t("Approved data element"), sortable: true },
            ],
            actions: [],
            initialSorting: {
                field: "dataSet" as const,
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
            name: "dataSet",
            text: "Data set",
            sortable: true,
            hidden: false,
        },
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
    ];

    const tableProps = {
        actions: [],
        columnsToShow: [
            {
                name: "dataSet",
                text: "Data set",
                sortable: true,
            },
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
                dataSetUid: "PWCUb3Se1Ie",
                dataSet: "MAL - WMR Form",
                orgUnitUid: "av3fkpFxEXj",
                orgUnit: "Socialist Republic of Viet Nam",
                period: "2012",
                value: "2022-09-02T13:09",
                apvdvalue: null,
                dataelement: "MAL - Submission date",
                apvddataelement: null,
            },
            {
                dataSetUid: "PWCUb3Se1Ie",
                dataSet: "MAL - WMR Form",
                orgUnitUid: "av3fkpFxEXj",
                orgUnit: "Socialist Republic of Viet Nam",
                period: "2012",
                value: "No",
                apvdvalue: null,
                dataelement: "MAL - ACD for mass screening (including non-febrile) - policy implemented this year",
                apvddataelement:
                    "MAL - ACD for mass screening (including non-febrile) - policy implemented this year-APVD",
            },
            {
                dataSetUid: "PWCUb3Se1Ie",
                dataSet: "MAL - WMR Form",
                orgUnitUid: "av3fkpFxEXj",
                orgUnit: "Socialist Republic of Viet Nam",
                period: "2012",
                value: "Yes",
                apvdvalue: null,
                dataelement:
                    "MAL - ACD in response to passively detected case (reactive) - policy implemented this year",
                apvddataelement:
                    "MAL - ACD in response to passively detected case (reactive) - policy implemented this year-APVD",
            },
            {
                dataSetUid: "PWCUb3Se1Ie",
                dataSet: "MAL - WMR Form",
                orgUnitUid: "av3fkpFxEXj",
                orgUnit: "Socialist Republic of Viet Nam",
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
