import React from "react";
// @ts-ignore
import { Radio } from "@dhis2/ui";
import i18n from "@eyeseetea/d2-ui-components/locales";
import { WidgetFeedback } from "../WidgetFeedback";
import { DataValueBoolean } from "../../../../domain/common/entities/DataValue";
import { WidgetProps } from "./WidgetBase";

export interface BooleanWidgetProps extends WidgetProps {
    dataValue: DataValueBoolean;
}

const BooleanWidget: React.FC<BooleanWidgetProps> = props => {
    const { onValueChange, dataValue, disabled } = props;

    const [stateValue, setStateValue] = React.useState(dataValue.value);

    React.useEffect(() => setStateValue(dataValue.value), [dataValue.value]);

    const notifyChange = React.useCallback(
        (value: boolean) => {
            setStateValue(value);
            onValueChange({ ...dataValue, value });
        },
        [onValueChange, dataValue]
    );

    const setTrue = React.useCallback(() => notifyChange(true), [notifyChange]);
    const setFalse = React.useCallback(() => notifyChange(false), [notifyChange]);

    return (
        <WidgetFeedback state={props.state}>
            <Radio dense label={i18n.t("Yes")} onChange={setTrue} checked={stateValue} disabled={disabled} />
            <Radio dense label={i18n.t("No")} onChange={setFalse} checked={!stateValue} disabled={disabled} />
        </WidgetFeedback>
    );
};

export default React.memo(BooleanWidget);
