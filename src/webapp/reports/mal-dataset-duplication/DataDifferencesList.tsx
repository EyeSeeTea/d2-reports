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
                id: "PWCUb3Se1Ie-H7vRSw3iF2S-2012-EubjsxqlA4d",
                dataSetUid: "PWCUb3Se1Ie",
                dataSet: "MAL - WMR Form",
                orgUnitUid: "EubjsxqlA4d",
                orgUnit: "Republic of Mali",
                period: "2012",
                value: "200",
                apvdvalue: "300",
                dataelement: "dataElement",
                apvddataelement: "apvddataelement",
            },
            {
                id: "PWCUb3Se1Ie-H7vRSw3iF2S-2012-av3fkpFxEXj",
                dataSetUid: "PWCUb3Se1Ie",
                dataSet: "MAL - WMR Form",
                orgUnitUid: "av3fkpFxEXj",
                orgUnit: "Socialist Republic of Viet Nam",
                period: "2012",
                value: "200",
                apvdvalue: "300",
                dataelement: "dataElement",
                apvddataelement: "apvddataelement",
            },
            {
                id: "PWCUb3Se1Ie-H7vRSw3iF2S-2012-QqAzWHtJ8VC",
                dataSetUid: "PWCUb3Se1Ie",
                dataSet: "MAL - WMR Form",
                orgUnitUid: "QqAzWHtJ8VC",
                orgUnit: "Republic of the Sudan",
                period: "2012",
                value: "200",
                apvdvalue: "300",
                dataelement: "dataElement",
                apvddataelement: "apvddataelement",
            },
            {
                id: "PWCUb3Se1Ie-H7vRSw3iF2S-2012-bhkJDAiqVKX",
                dataSetUid: "PWCUb3Se1Ie",
                dataSet: "MAL - WMR Form",
                orgUnitUid: "bhkJDAiqVKX",
                orgUnit: "Republic of Guatemala",
                period: "2012",
                value: "200",
                apvdvalue: "300",
                dataelement: "dataElement",
                apvddataelement: "apvddataelement",
            },
            {
                id: "PWCUb3Se1Ie-H7vRSw3iF2S-2012-WXGcnQWJ0Qd",
                dataSetUid: "PWCUb3Se1Ie",
                dataSet: "MAL - WMR Form",
                orgUnitUid: "WXGcnQWJ0Qd",
                orgUnit: "Republic of Côte d'Ivoire",
                period: "2012",
                value: "200",
                apvdvalue: "300",
                dataelement: "dataElement",
                apvddataelement: "apvddataelement",
            },
            {
                id: "PWCUb3Se1Ie-H7vRSw3iF2S-2012-oofyLUJJ6Vy",
                dataSetUid: "PWCUb3Se1Ie",
                dataSet: "MAL - WMR Form",
                orgUnitUid: "oofyLUJJ6Vy",
                orgUnit: "Islamic Republic of Afghanistan",
                period: "2012",
                value: "200",
                apvdvalue: "300",
                dataelement: "dataElement",
                apvddataelement: "apvddataelement",
            },
            {
                id: "PWCUb3Se1Ie-H7vRSw3iF2S-2012-vboedbUs1As",
                dataSetUid: "PWCUb3Se1Ie",
                dataSet: "MAL - WMR Form",
                orgUnitUid: "vboedbUs1As",
                orgUnit: "Kingdom of Thailand",
                period: "2012",
                value: "200",
                apvdvalue: "300",
                dataelement: "dataElement",
                apvddataelement: "apvddataelement",
            },
            {
                id: "PWCUb3Se1Ie-H7vRSw3iF2S-2012-jkyBvNzcTLl",
                dataSetUid: "PWCUb3Se1Ie",
                dataSet: "MAL - WMR Form",
                orgUnitUid: "jkyBvNzcTLl",
                orgUnit: "Republic of Suriname",
                period: "2012",
                value: "200",
                apvdvalue: "300",
                dataelement: "dataElement",
                apvddataelement: "apvddataelement",
            },
            {
                id: "PWCUb3Se1Ie--2012-z51rgcc5R8V",
                dataSetUid: "PWCUb3Se1Ie",
                dataSet: "MAL - WMR Form",
                orgUnitUid: "z51rgcc5R8V",
                orgUnit: "Republic of Gambia",
                period: "2012",
                value: "200",
                apvdvalue: "300",
                dataelement: "dataElement",
                apvddataelement: "apvddataelement",
            },
            {
                id: "PWCUb3Se1Ie-H7vRSw3iF2S-2012-wj7iV08dvFq",
                dataSetUid: "PWCUb3Se1Ie",
                dataSet: "MAL - WMR Form",
                orgUnitUid: "wj7iV08dvFq",
                orgUnit: "Republic of Senegal",
                period: "2012",
                value: "200",
                apvdvalue: "300",
                dataelement: "dataElement",
                apvddataelement: "apvddataelement",
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
