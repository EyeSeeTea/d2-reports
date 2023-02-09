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
import { DataEntryItem, ItemDataValue } from "./DataEntryItem";
import { Id } from "../../../domain/common/entities/Base";
import { DataForm, DataFormValue } from "../../../domain/common/entities/DataForm";
import { SectionTableM } from "./DataFormViewModels";

interface Period {
    startDate: string; // "YYYY-MM-DD"
    endDate: string; // "YYYY-MM-DD"
    id: string;
    iso: string;
    name: string;
}

declare global {
    interface Window {
        dhis2?: {
            de: {
                currentOrganisationUnitId: Id;
                currentDataSetId: Id;
                getSelectedPeriod: () => Period | undefined;
                event: { dataValuesLoaded: string };
            };
            util: {
                on: (event: string, action: () => void) => void;
            };
        };
    }
}

function useDataEntrySelector(): { orgUnitId: Id; dataSetId: Id; period: string; reloadKey: string } {
    const [reloadKey, reload] = useReload();
    const { dhis2 } = window;
    const isRunningInDataEntry = dhis2;

    useEffect(() => {
        if (!dhis2) return;
        dhis2.util.on(dhis2.de.event.dataValuesLoaded, () => {
            reload();
        });
    });

    if (isRunningInDataEntry) {
        return {
            orgUnitId: dhis2.de.currentOrganisationUnitId,
            dataSetId: dhis2.de.currentDataSetId,
            period: dhis2.de.getSelectedPeriod()?.iso || "",
            reloadKey,
        };
    } else {
        const params = new URLSearchParams(window.location.search);

        return {
            orgUnitId: params.get("orgUnitId") || "jFOZHDZpjPL", // Angola
            period: params.get("period") || "2019",
            dataSetId: "r8DqSf2FDvP",
            reloadKey,
        };
    }
}

export const WMRNationalPolicies: React.FC = () => {
    const { compositionRoot } = useAppContext();
    const { orgUnitId, period, dataSetId, reloadKey } = useDataEntrySelector();
    const [dataForm, setDataForm] = useState<DataForm>();
    const [dataValues, setDataValues] = useState<DataFormValue[]>([]);

    const saveValue = useCallback(
        (dataValue: ItemDataValue) => {
            compositionRoot.dataForms.saveValue(dataValue, { orgUnitId, period });
        },
        [orgUnitId, period, compositionRoot]
    );

    useEffect(() => {
        compositionRoot.dataForms.get(dataSetId).then(setDataForm);
    }, [compositionRoot, dataSetId]);

    useEffect(() => {
        compositionRoot.dataForms.getValues(dataSetId, { orgUnitId, period }).then(setDataValues);
    }, [compositionRoot, orgUnitId, dataSetId, period, reloadKey]);

    const sections = React.useMemo(
        () => (dataForm ? SectionTableM.getSectionsFromDataForm(dataForm) : undefined),
        [dataForm]
    );

    if (!(dataForm && sections)) return null;

    return (
        <div>
            {sections.map(section => (
                <div key={`table-${section.id}`} style={styles.wrapper}>
                    <DataTable>
                        <TableHead>
                            <DataTableRow>
                                <DataTableColumnHeader>
                                    <span style={styles.header}>{section.name}</span>
                                </DataTableColumnHeader>

                                {section.columns.map(column => (
                                    <DataTableColumnHeader key={`column-${column.name}`}>
                                        <span style={styles.header}>{column.name}</span>
                                    </DataTableColumnHeader>
                                ))}
                            </DataTableRow>
                        </TableHead>

                        <TableBody>
                            {section.rows.map(row => (
                                <DataTableRow key={`policy-${row.name}`}>
                                    <DataTableCell>
                                        <span>{row.name}</span>
                                    </DataTableCell>

                                    {row.items.map((item, idx) =>
                                        item.dataElement ? (
                                            <DataTableCell key={`cell-${item.dataElement.id}`}>
                                                <DataEntryItem
                                                    dataForm={dataForm}
                                                    data={dataValues}
                                                    dataElement={item.dataElement}
                                                    categoryOptionComboId="Xr12mI7VPn3" // TODO
                                                    onValueChange={saveValue}
                                                    disabled={false} // TODO: Handle exclusion of implemented this year and policy discontinued
                                                />
                                            </DataTableCell>
                                        ) : (
                                            <DataTableCell key={`cell-${idx}`}></DataTableCell>
                                        )
                                    )}
                                </DataTableRow>
                            ))}
                        </TableBody>
                    </DataTable>
                </div>
            ))}
        </div>
    );
};

const styles = {
    wrapper: { margin: 10 },
    header: { fontWeight: "bold" as const },
};
