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
import { GridViewModel } from "./GridFormViewModel";
import { DataFormInfo } from "./AutogeneratedForm";
import { Section } from "../../../domain/common/entities/DataForm";
import { DataElementItem } from "./DataElementItem";
import { makeStyles } from "@material-ui/core";
import DataTableSection from "./DataTableSection";

/*
 * Convert data forms into table, using "-" as a separator. An example for section ITNs:
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
    const grid = React.useMemo(() => GridViewModel.get(props.section), [props.section]);
    const classes = useStyles();

    return (
        <DataTableSection section={grid} dataFormInfo={dataFormInfo}>
            <DataTable className={classes.table}>
                <TableHead>
                    <DataTableRow>
                        {grid.useIndexes ? (
                            <DataTableColumnHeader width="30px">
                                <span className={classes.header}>#</span>{" "}
                            </DataTableColumnHeader>
                        ) : (
                            <DataTableColumnHeader width="400px"></DataTableColumnHeader>
                        )}

                        {grid.columns.map(column => (
                            <DataTableColumnHeader className={classes.columnWidth} key={`column-${column.name}`}>
                                <span>{column.name}</span>
                            </DataTableColumnHeader>
                        ))}
                    </DataTableRow>
                </TableHead>

                <TableBody>
                    {grid.rows.map((row, idx) => (
                        <DataTableRow key={`policy-${row.name}`}>
                            <DataTableCell>
                                <span>{grid.useIndexes ? (idx + 1).toString() : row.name}</span>
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
        </DataTableSection>
    );
};

const useStyles = makeStyles({
    wrapper: { margin: 10 },
    header: { fontSize: "1.4em", fontWeight: "bold" as const },
    table: { borderWidth: "3px !important" },
    columnWidth: { minWidth: "14.25em !important" },
});

export default React.memo(GridForm);
