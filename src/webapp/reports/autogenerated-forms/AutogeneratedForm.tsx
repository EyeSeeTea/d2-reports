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
import DataEntryItem from "./DataEntryItem";
import { DataForm } from "../../../domain/common/entities/DataForm";
import { DataValue, DataValueIndexed } from "../../../domain/common/entities/DataValue";
import { SectionTableM } from "./DataFormViewModels";
import { useDataEntrySelector } from "./useDataEntrySelector";
import i18n from "@eyeseetea/d2-ui-components/locales";
import { CommentIcon } from "./CommentIcon";

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

const defaultCategoryOptionComboId = "Xr12mI7VPn3";

export const AutogeneratedForm: React.FC = () => {
    const { metadata, data, initForm } = useDataForm();

    if (!metadata) return <div>{i18n.t("Loading...")}</div>;

    if (metadata.sections.length === 0)
        return <p>{i18n.t("There are no sections in this data set. Check README for more details")}</p>;

    return (
        <div ref={initForm}>
            <CommentDialogStyles />

            {metadata.sections.map(section => (
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
                                                            dataForm={metadata.dataForm}
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
        </div>
    );
};

const styles = {
    wrapper: { margin: 10 },
    header: { fontWeight: "bold" as const },
    valueInput: { flexGrow: 1 },
    valueWrapper: { display: "flex" },
};

function useDataForm() {
    const { compositionRoot } = useAppContext();
    const { orgUnitId, period, dataSetId, reloadKey, initForm } = useDataEntrySelector();
    const [dataForm, setDataForm] = useState<DataForm>();
    const [dataValues, setDataValues] = useState<DataValueIndexed>({});

    useEffect(() => {
        compositionRoot.dataForms.get(dataSetId).then(setDataForm);
    }, [compositionRoot, dataSetId]);

    useEffect(() => {
        compositionRoot.dataForms.getValues(dataSetId, { orgUnitId, period }).then(setDataValues);
    }, [compositionRoot, orgUnitId, dataSetId, period, reloadKey]);

    const saveDataValue = useCallback(
        (dataValue: DataValue) => compositionRoot.dataForms.saveValue(dataValue),
        [compositionRoot]
    );

    const metadata = React.useMemo(
        () => (dataForm ? { dataForm, sections: SectionTableM.getSectionsFromDataForm(dataForm) } : undefined),
        [dataForm]
    );

    return {
        metadata,
        data: { values: dataValues, save: saveDataValue },
        initForm,
    };
}

const commentDialogCss = `
    [aria-describedby="historyDiv"] {
        top: 65px !important;
    }
`;

const CommentDialogStyles: React.FC = () => {
    return <style dangerouslySetInnerHTML={{ __html: commentDialogCss }} />;
};
