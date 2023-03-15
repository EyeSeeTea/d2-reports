import { makeStyles } from "@material-ui/core";
import React from "react";
import { Section } from "../../../domain/common/entities/DataForm";
import { DataValue } from "../../../domain/common/entities/DataValue";
import { useBooleanState } from "../../utils/use-boolean";
import { DataFormInfo } from "./AutogeneratedForm";
import { DataElementItem } from "./DataElementItem";
import { Html } from "./Html";

export interface DataTableProps {
    section: DataTableSectionObj;
    dataFormInfo: DataFormInfo;
    children: React.ReactNode;
}

interface DataTableSectionObj {
    name: string;
    texts: Section["texts"];
    toggle: Section["toggle"];
}

const DataTableSection: React.FC<DataTableProps> = React.memo(props => {
    const { section, children, dataFormInfo } = props;
    const { toggle } = section;
    const classes = useStyles();

    const [isSectionOpen, visibilityActions] = useBooleanState(() => {
        if (toggle.type !== "dataElement") {
            return true;
        } else {
            const dataValue = dataFormInfo.data.values.getOrEmpty(toggle.dataElement, dataFormInfo);
            return isDataValueEnabled(dataValue);
        }
    });

    const toggleSection = React.useCallback(
        (dataValue: DataValue) => {
            const isOpen = isDataValueEnabled(dataValue);
            visibilityActions.set(isOpen);
        },
        [visibilityActions]
    );

    return (
        <div className={classes.wrapper}>
            <h3 className={classes.title}>{section.name}</h3>

            <Html content={section.texts.header} />

            {toggle.type === "dataElement" && (
                <div className={classes.toggleWrapper}>
                    <div className={classes.toggleTitle}>{toggle.dataElement.name}</div>
                    <DataElementItem
                        dataElement={toggle.dataElement}
                        dataFormInfo={dataFormInfo}
                        onChange={toggleSection}
                    />
                </div>
            )}

            {isSectionOpen && (
                <>
                    {children}
                    <Html content={section.texts.footer} />
                </>
            )}
        </div>
    );
});

const useStyles = makeStyles({
    wrapper: { margin: 10, border: "1px solid black" },
    toggleWrapper: { margin: 10 },
    toggleTitle: { marginBottom: 10 },
    title: { textAlign: "center" },
    subtitle: { textAlign: "center", marginBottom: 10 },
});

function isDataValueEnabled(dataValue: DataValue): boolean {
    return dataValue.type === "BOOLEAN" ? Boolean(dataValue.value) : false;
}

export default React.memo(DataTableSection);
