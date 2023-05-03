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
import { GridWithCombosViewModel } from "./GridWithCombosViewModel";
import { DataFormInfo } from "./AutogeneratedForm";
import { Section } from "../../../domain/common/entities/DataForm";
import { DataElementItem } from "./DataElementItem";
import { makeStyles } from "@material-ui/core";
import DataTableSection from "./DataTableSection";

export interface GridWithCombosProps {
    dataFormInfo: DataFormInfo;
    section: Section;
}

const GridWithCombos: React.FC<GridWithCombosProps> = props => {
    const { dataFormInfo } = props;
    const grid = React.useMemo(() => GridWithCombosViewModel.get(props.section), [props.section]);
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
                            <DataTableColumnHeader key={`column-${column.name}`}>
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
                                    <DataTableCell key={item.dataElement.id + item.dataElement.cocId}>
                                        <DataElementItem
                                            dataElement={item.dataElement}
                                            dataFormInfo={dataFormInfo}
                                            noComment={true}
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
        </DataTableSection>
    );
};

const useStyles = makeStyles({
    wrapper: { margin: 10 },
    header: { fontSize: "1.4em", fontWeight: "bold" as const },
    table: { borderWidth: "3px !important" },
});

export default React.memo(GridWithCombos);
