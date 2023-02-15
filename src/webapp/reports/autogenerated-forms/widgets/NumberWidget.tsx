import React from "react";
// @ts-ignore
import { Input } from "@dhis2/ui";
import { WidgetFeedback } from "../WidgetFeedback";
import { DataValueNumberSingle } from "../../../../domain/common/entities/DataValue";
import { WidgetProps } from "./WidgetBase";

export interface NumberWidgetProps extends WidgetProps {
    dataValue: DataValueNumberSingle;
}

const NumberWidget: React.FC<NumberWidgetProps> = props => {
    const { onValueChange, dataValue, disabled } = props;

    const notifyChange = React.useCallback(
        ({ value }: { value: string }) => {
            onValueChange({ ...dataValue, value });
        },
        [onValueChange, dataValue]
    );

    return (
        <WidgetFeedback state={props.state}>
            <Input type="number" onChange={notifyChange} value={dataValue.value} disabled={disabled} />
        </WidgetFeedback>
    );
};

export default React.memo(NumberWidget);
