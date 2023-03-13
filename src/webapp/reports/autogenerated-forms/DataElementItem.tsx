import _ from "lodash";
import { makeStyles } from "@material-ui/core";
import React from "react";
import { DataElement } from "../../../domain/common/entities/DataElement";
import { DataFormInfo } from "./AutogeneratedForm";
import { CommentIcon } from "./CommentIcon";
import DataEntryItem, { DataEntryItemProps } from "./DataEntryItem";
import { DataValue } from "../../../domain/common/entities/DataValue";

export interface DataElementItemProps {
    dataElement: DataElement;
    dataFormInfo: DataFormInfo;
    period?: string; // Override period in dataFormInfo
    onChange?(dataValue: DataValue): void;
}

export const DataElementItem: React.FC<DataElementItemProps> = React.memo(props => {
    const { dataElement, dataFormInfo, period, onChange } = props;
    const classes = useStyles();
    const elId = _([dataElement.id, period]).compact().join("-");

    const saveDataValueAndNotifyParent = React.useCallback<DataEntryItemProps["onValueChange"]>(
        async dataValue => {
            const dataValueUpdated = await dataFormInfo.data.save(dataValue);
            if (onChange) onChange(dataValueUpdated);
            return dataValueUpdated;
        },
        [onChange, dataFormInfo.data]
    );

    return (
        <div id={elId} className={classes.valueWrapper}>
            <div className={classes.valueInput}>
                <DataEntryItem
                    dataElement={dataElement}
                    dataFormInfo={dataFormInfo}
                    period={period}
                    onValueChange={saveDataValueAndNotifyParent}
                />
            </div>

            <CommentIcon
                dataElementId={dataElement.id}
                categoryOptionComboId={dataFormInfo.categoryOptionComboId} //
            />
        </div>
    );
});

const useStyles = makeStyles({
    valueInput: { flexGrow: 1 },
    valueWrapper: { display: "flex" },
});
