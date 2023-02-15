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
import DataEntryItem from "./DataEntryItem";
import { DataForm } from "../../../domain/common/entities/DataForm";
import { SectionTableM } from "./DataFormViewModels";
import i18n from "@eyeseetea/d2-ui-components/locales";
import { CommentIcon } from "./CommentIcon";
import { DataFormInfo } from "./AutogeneratedForm";
import { useAppContext } from "../../contexts/app-context";

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

export interface TableFormProps {
    dataForm: DataForm;
    data: DataFormInfo["data"];
}

const TableForm: React.FC<TableFormProps> = props => {
    const { dataForm, data } = props;
    const { config } = useAppContext();
    const defaultCategoryOptionComboId = config.categoryOptionCombos.default.id;

    const sections = React.useMemo(() => SectionTableM.getSectionsFromDataForm(dataForm), [dataForm]);

    if (sections.length === 0)
        return <p>{i18n.t("There are no sections in this data set. Check README for more details")}</p>;

    return (
        <>
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
                                                <div id={`de-${item.dataElement.id}`} style={styles.valueWrapper}>
                                                    <div style={styles.valueInput}>
                                                        <DataEntryItem
                                                            dataForm={dataForm}
                                                            dataValues={data.values}
                                                            dataElementId={item.dataElement.id}
                                                            categoryOptionComboId={defaultCategoryOptionComboId}
                                                            onValueChange={data.save}
                                                            disabled={false}
                                                        />
                                                    </div>

                                                    <CommentIcon
                                                        dataElementId={item.dataElement.id}
                                                        categoryOptionComboId={defaultCategoryOptionComboId}
                                                    />
                                                </div>
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
        </>
    );
};

const styles = {
    wrapper: { margin: 10 },
    header: { fontWeight: "bold" as const },
    valueInput: { flexGrow: 1 },
    valueWrapper: { display: "flex" },
};

export default React.memo(TableForm);
