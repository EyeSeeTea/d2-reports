import React from "react";
import { Section } from "../../../domain/common/entities/DataForm";
import { DataFormInfo } from "./AutogeneratedForm";
import { DataElementItem } from "./DataElementItem";
import { GridViewModel } from "./GridFormViewModel";

import {
    DataTable,
    TableHead,
    DataTableRow,
    DataTableColumnHeader,
    TableBody,
    DataTableCell,
    // @ts-ignore
} from "@dhis2/ui";
import { makeStyles } from "@material-ui/core";

export interface TableFormProps {
    dataFormInfo: DataFormInfo;
    section: Section;
}

const TableForm: React.FC<TableFormProps> = React.memo(props => {
    const { dataFormInfo } = props;
    const section = React.useMemo(() => GridViewModel.get(props.section), [props.section]);
    const classes = useStyles();

    return (
        <div key={`table-${section.id}`} className={classes.wrapper}>
            <DataTable>
                <TableHead>
                    <DataTableRow>
                        <DataTableColumnHeader colSpan="2">
                            <span className={classes.header}>{section.name}</span>
                        </DataTableColumnHeader>
                    </DataTableRow>
                </TableHead>

                <TableBody>
                    {props.section.dataElements.map(dataElement => (
                        <DataTableRow key={dataElement.id}>
                            <DataTableCell>
                                <span>{dataElement.name}</span>
                            </DataTableCell>

                            <DataTableCell key={dataElement.id}>
                                <DataElementItem dataElement={dataElement} dataFormInfo={dataFormInfo} />
                            </DataTableCell>
                        </DataTableRow>
                    ))}
                </TableBody>
            </DataTable>
        </div>
    );
});

const useStyles = makeStyles({
    wrapper: { margin: 10 },
    header: { fontSize: "1.4em", fontWeight: "bold" as const },
    center: { display: "table", margin: "0 auto" },
});

export default React.memo(TableForm);
