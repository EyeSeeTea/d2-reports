import _ from "lodash";
import { makeStyles } from "@material-ui/core";
import React from "react";
import { DataElement } from "../../../domain/common/entities/DataElement";
import { DataFormInfo } from "./AutogeneratedForm";
import { CommentIcon } from "./CommentIcon";
import DataEntryItem from "./DataEntryItem";

export interface DataElementItemProps {
    dataElement: DataElement;
    dataFormInfo: DataFormInfo;
    period?: string; // Override period in dataFormInfo
}

export const DataElementItem: React.FC<DataElementItemProps> = React.memo(props => {
    const { dataElement, dataFormInfo, period } = props;
    const classes = useStyles();
    const elId = _([dataElement.id, period]).compact().join("-");

    return (
        <div id={elId} className={classes.valueWrapper}>
            <div className={classes.valueInput}>
                <DataEntryItem
                    dataElement={dataElement}
                    dataFormInfo={dataFormInfo}
                    period={period}
                    onValueChange={dataFormInfo.data.save}
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
