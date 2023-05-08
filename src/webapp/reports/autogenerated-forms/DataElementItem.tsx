import _ from "lodash";
import { makeStyles } from "@material-ui/core";
import React from "react";
import { DataElement } from "../../../domain/common/entities/DataElement";
import { DataFormInfo } from "./AutogeneratedForm";
import { CommentIcon } from "./CommentIcon";
import DataEntryItem, { DataEntryItemProps } from "./DataEntryItem";
import { DataValue } from "../../../domain/common/entities/DataValue";
import { Row } from "./GridWithTotalsViewModel";

export interface DataElementItemProps {
    dataElement: DataElement;
    dataFormInfo: DataFormInfo;
    period?: string; // Override period in dataFormInfo
    onChange?(dataValue: DataValue): void;
    noComment?: boolean;
    manualyDisabled?: boolean;
    total?: DataElement;
    columnTotal?: DataElement;
    rowDataElements?: DataElement[];
    columnDataElements?: DataElement[];
    rows?: Row[];
}

export const DataElementItem: React.FC<DataElementItemProps> = React.memo(props => {
    const {
        dataElement,
        dataFormInfo,
        period,
        onChange,
        noComment,
        manualyDisabled,
        total,
        columnTotal,
        rowDataElements,
        columnDataElements,
        rows,
    } = props;

    const classes = useStyles();
    const elId = _([dataElement.id, period]).compact().join("-");
    const dataElementCocId = dataElement.cocId ?? dataFormInfo.categoryOptionComboId;
    const auditId = _([dataElement.id, dataElementCocId, "val"]).compact().join("-");

    const notifyParent = React.useCallback<DataEntryItemProps["onValueChange"]>(
        async dataValue => {
            if (onChange) onChange(dataValue);
            return dataValue;
        },
        [onChange]
    );

    return !noComment ? (
        <div id={elId} className={classes.valueWrapper}>
            <div className={classes.valueInput}>
                <DataEntryItem
                    dataElement={dataElement}
                    dataFormInfo={dataFormInfo}
                    period={period}
                    onValueChange={notifyParent}
                    manualyDisabled={manualyDisabled}
                    total={total}
                    columnTotal={columnTotal}
                    rowDataElements={rowDataElements}
                    columnDataElements={columnDataElements}
                    cocId=""
                    rows={rows}
                />
            </div>
            <CommentIcon dataElementId={dataElement.id} categoryOptionComboId={dataElementCocId} />
        </div>
    ) : (
        <div id={elId} className={classes.valueWrapper}>
            <div className={`${classes.valueInput} entryfield`} id={auditId}>
                <DataEntryItem
                    dataElement={dataElement}
                    dataFormInfo={dataFormInfo}
                    period={period}
                    onValueChange={notifyParent}
                    manualyDisabled={manualyDisabled}
                    total={total}
                    columnTotal={columnTotal}
                    rowDataElements={rowDataElements}
                    columnDataElements={columnDataElements}
                    cocId={dataElementCocId}
                />
            </div>
        </div>
    );
});

const useStyles = makeStyles({
    valueInput: { flexGrow: 1, border: "0 !important" },
    valueWrapper: { display: "flex" },
});
