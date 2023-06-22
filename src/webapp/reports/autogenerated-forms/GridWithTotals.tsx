/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React from "react";
import {
    DataTable,
    TableHead,
    DataTableRow,
    DataTableColumnHeader,
    DataTableCell,
    TableBody,
    // @ts-ignore
} from "@dhis2/ui";
import { GridWithTotalsViewModel } from "./GridWithTotalsViewModel";
import { DataFormInfo } from "./AutogeneratedForm";
import { Section } from "../../../../src/domain/common/entities/DataForm";
import { DataElementItem } from "./DataElementItem";
import { makeStyles } from "@material-ui/core";
import DataTableSection from "./DataTableSection";
import { isDev } from "../../..";

export interface GridWithTotalsProps {
    dataFormInfo: DataFormInfo;
    section: Section;
}

const GridWithTotals: React.FC<GridWithTotalsProps> = props => {
    const topValue = isDev ? "0" : "48px";
    const { dataFormInfo, section } = props;

    const grid = React.useMemo(() => GridWithTotalsViewModel.get(section), [section]);
    const classes = useStyles();

    const fistSection = section.id !== "yzMn16Bp1wV";

    return (
        <DataTableSection section={grid} dataFormInfo={dataFormInfo}>
            <DataTable className={classes.table} layout="fixed" width="initial">
                <TableHead>
                    <DataTableRow>
                        <DataTableColumnHeader></DataTableColumnHeader>
                        <DataTableColumnHeader></DataTableColumnHeader>
                        {grid.parentColumns.map(column => {
                            return (
                                <DataTableColumnHeader
                                    key={column.name}
                                    className={classes.centerSpan}
                                    colSpan={String(column.colSpan)}
                                >
                                    <span>{column.name}</span>
                                </DataTableColumnHeader>
                            );
                        })}
                        {section.id === "yzMn16Bp1wV" && <DataTableColumnHeader></DataTableColumnHeader>}
                    </DataTableRow>
                    <DataTableRow>
                        {grid.useIndexes ? (
                            <DataTableColumnHeader width="30px">
                                <span className={classes.header}>#</span>{" "}
                            </DataTableColumnHeader>
                        ) : (
                            <DataTableColumnHeader fixed top={topValue}></DataTableColumnHeader>
                        )}

                        {fistSection ? (
                            <DataTableColumnHeader
                                className={classes.columnWidth}
                                fixed
                                top={topValue}
                                key={`column-Total`}
                            >
                                <span>Total</span>
                            </DataTableColumnHeader>
                        ) : null}

                        {grid.columns.map(column =>
                            column.deName && column.cocName ? (
                                <DataTableColumnHeader
                                    fixed
                                    top={topValue}
                                    key={`column-${column.name}`}
                                    className={classes.columnWidth}
                                >
                                    <span>{column.cocName}</span>
                                </DataTableColumnHeader>
                            ) : (
                                <DataTableColumnHeader
                                    fixed
                                    top={topValue}
                                    key={`column-${column.name}`}
                                    className={column.name === "Source Type" ? classes.source : classes.columnWidth}
                                >
                                    <span>{column.name}</span>
                                </DataTableColumnHeader>
                            )
                        )}
                    </DataTableRow>
                </TableHead>

                <TableBody>
                    {grid.rows.map((row, idx) => (
                        <DataTableRow key={`policy-${row.name}`}>
                            <DataTableCell className={classes.td}>
                                <p style={{ paddingLeft: row.includePadding ? `${row.includePadding * 10}px` : "0" }}>
                                    {grid.useIndexes ? (idx + 1).toString() : row.name}
                                </p>
                            </DataTableCell>

                            {fistSection && row.total ? (
                                <DataTableCell key={row.total.id + row.total.cocId}>
                                    <DataElementItem
                                        dataElement={row.total}
                                        dataFormInfo={dataFormInfo}
                                        manualyDisabled={true}
                                        noComment={true}
                                    />
                                </DataTableCell>
                            ) : null}

                            {row.items.map((item, idx) => {
                                if (item.column.name === "Source Type") {
                                    return item.dataElement ? (
                                        <DataTableCell key={item.dataElement.id + item.dataElement.cocId}>
                                            <DataElementItem
                                                dataElement={item.dataElement}
                                                dataFormInfo={dataFormInfo}
                                                noComment={false}
                                                columnTotal={item.columnTotal}
                                                rows={grid.rows}
                                            />
                                        </DataTableCell>
                                    ) : (
                                        <DataTableCell key={`cell-${idx}`}></DataTableCell>
                                    );
                                } else {
                                    return item.dataElement ? (
                                        <DataTableCell key={item.dataElement.id + item.dataElement.cocId}>
                                            <DataElementItem
                                                dataElement={item.dataElement}
                                                dataFormInfo={dataFormInfo}
                                                noComment={true}
                                                manualyDisabled={
                                                    row.name.startsWith("41 -") || row.name.startsWith("18 -")
                                                        ? false
                                                        : row.rowDisabled
                                                }
                                                total={row.total}
                                                columnTotal={item.columnTotal}
                                                rowDataElements={row.rowDataElements}
                                                columnDataElements={item.columnDataElements}
                                            />
                                        </DataTableCell>
                                    ) : (
                                        <DataTableCell key={`cell-${idx}`}></DataTableCell>
                                    );
                                }
                            })}
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
    table: { borderWidth: "3px !important", minWidth: "100%" },
    td: { minWidth: "400px !important" },
    columnWidth: { minWidth: "6.2em !important" },
    source: { maxWidth: "35% !important", width: "33% !important", minWidth: "15% !important" },
    centerSpan: {
        "& span": {
            alignItems: "center",
        },
    },
});

export default React.memo(GridWithTotals);
