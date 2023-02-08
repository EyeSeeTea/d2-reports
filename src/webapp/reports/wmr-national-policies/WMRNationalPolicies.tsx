import { DataValueSetsDataValue, MetadataPayload } from "@eyeseetea/d2-api/2.34";
import React, { useCallback, useEffect, useState } from "react";
import { useAppContext } from "../../contexts/app-context";
import {
    DataTable,
    TableHead,
    DataTableRow,
    DataTableColumnHeader,
    TableBody,
    DataTableCell,
    // @ts-ignore
} from "@dhis2/ui";
import { useReload } from "../../utils/use-reload";
import { DATASET_COLUMNS, DATASET_ID, policies, translations } from "./policies";
import { DataEntryItem } from "./DataEntryItem";

export const WMRNationalPolicies: React.FC = () => {
    const { api } = useAppContext();

    const [metadata, setMetadata] = useState<MetadataPayload>();
    const [data, setData] = useState<DataValueSetsDataValue[]>([]);
    const [locale, setLocale] = useState<string>("en");
    const [reloadKey, reload] = useReload();

    const translate = (key: string) => translations[key]?.[locale] ?? translations[key]?.["en"] ?? key;

    //@ts-ignore
    const orgUnit = window.dhis2?.de.currentOrganisationUnitId;
    //@ts-ignore
    const period = window.dhis2?.de.getSelectedPeriod().name;

    const saveValue = useCallback(
        (dataValue: Partial<DataValueSetsDataValue>) => {
            api.dataValues
                .post({
                    ou: orgUnit,
                    pe: period,
                    de: dataValue.dataElement ?? "",
                    value: dataValue.value,
                })
                .getData()
                .then(() => {
                    api.dataValues
                        .getSet({ dataSet: [DATASET_ID], orgUnit: [orgUnit], period: [period] })
                        .getData()
                        .then(({ dataValues }) => setData(dataValues));
                });
        },
        [api, orgUnit, period]
    );

    useEffect(() => {
        //@ts-ignore
        window.dhis2?.util.on(window.dhis2?.de.event.dataValuesLoaded, () => reload());
    });

    useEffect(() => {
        api.currentUser
            .get({ fields: { settings: { keyUiLocale: true } } })
            .getData()
            .then(({ settings: { keyUiLocale } }) => setLocale(keyUiLocale ?? "en"));

        api.get<MetadataPayload>(`/dataSets/${DATASET_ID}/metadata.json`).getData().then(setMetadata);
    }, [api]);

    useEffect(() => {
        console.debug("Reloading", reloadKey);
        api.dataValues
            .getSet({ dataSet: [DATASET_ID], orgUnit: [orgUnit], period: [period] })
            .getData()
            .then(({ dataValues }) => setData(dataValues));
    }, [api, orgUnit, period, reloadKey]);

    if (!metadata) return null;

    return (
        <div>
            {policies.map(({ code, items }) => (
                <div key={`table-${code}`} style={{ margin: 10 }}>
                    <DataTable>
                        <TableHead>
                            <DataTableRow>
                                <DataTableColumnHeader>
                                    <span
                                        style={{ fontWeight: "bold" }}
                                        dangerouslySetInnerHTML={{ __html: translate(code) }}
                                    />
                                </DataTableColumnHeader>

                                {DATASET_COLUMNS.map((code, index) => (
                                    <DataTableColumnHeader key={`column-${index}-${code}`}>
                                        <span
                                            style={{ fontWeight: "bold" }}
                                            dangerouslySetInnerHTML={{ __html: translate(code) }}
                                        />
                                    </DataTableColumnHeader>
                                ))}
                            </DataTableRow>
                        </TableHead>

                        <TableBody>
                            {items
                                .filter(({ hidden = false }) => !hidden)
                                .map(({ code, columns }, rowIndex) => (
                                    <DataTableRow key={`policy-${code}-${rowIndex}`}>
                                        <DataTableCell>
                                            <span dangerouslySetInnerHTML={{ __html: translate(code) }} />
                                        </DataTableCell>

                                        {DATASET_COLUMNS.map((column, index) => (
                                            <DataTableCell key={`cell-${column}-${index}`}>
                                                {columns[column] && (
                                                    <DataEntryItem
                                                        metadata={metadata}
                                                        data={data}
                                                        dataElement={columns[column]?.dataElement}
                                                        categoryOptionCombo={columns[column]?.categoryOptionCombo}
                                                        saveValue={saveValue}
                                                        disabled={false} // TODO: Handle exclusion of implemented this year and policy discontinued
                                                    />
                                                )}
                                            </DataTableCell>
                                        ))}
                                    </DataTableRow>
                                ))}
                        </TableBody>
                    </DataTable>
                </div>
            ))}
        </div>
    );
};
