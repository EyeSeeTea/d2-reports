import React from "react";
import {
    DataTable,
    TableHead,
    DataTableRow,
    DataTableColumnHeader,
    TableBody,
    DataTableCell,
    // @ts-ignore
} from "@dhis2/ui";
import { TableFormViewModelM } from "./GridFormViewModel";
import { DataFormInfo } from "./AutogeneratedForm";
import { Section } from "../../../domain/common/entities/DataForm";
import { DataElementItem } from "./DataElementItem";

/*
 * Convert data forms into table, using "-" as a separator. An example:
 *
 *    - ITNs - Basic - Written Policy
 *    - ITNs - Basic - Policy Implemented
 *    - ITNs - Extended - Written Policy
 *    - ITNs - Extended - Policy Implemented
 *
 *    This will create this table:
 *
 *    ITNs            | Written Policy | Policy Implemented |
 *    ITNs - Basic    |                |                    |
 *    ITNs - Extended |                |                    |
 **/

export interface GridFormProps {
    dataFormInfo: DataFormInfo;
    section: Section;
}

const GridForm: React.FC<GridFormProps> = props => {
    const { dataFormInfo } = props;
    const section = React.useMemo(() => TableFormViewModelM.get(props.section), [props.section]);

    return (
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
                                    <DataTableCell key={item.dataElement.id}>
                                        <DataElementItem dataElement={item.dataElement} dataFormInfo={dataFormInfo} />
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
    );
};

const styles = {
    wrapper: { margin: 10 },
    header: { fontWeight: "bold" as const },
};

export default React.memo(GridForm);