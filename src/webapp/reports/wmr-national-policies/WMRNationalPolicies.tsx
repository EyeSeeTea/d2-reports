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
import DataEntryItem, { ItemDataValue } from "./DataEntryItem";
import { DataForm, DataFormValue } from "../../../domain/common/entities/DataForm";
import { SectionTableM } from "./DataFormViewModels";
import { useDataEntrySelector } from "./useDataEntrySelector";

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

    // console.log(dataForm.sections);

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
                                                    disabled={false}
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
