import React from "react";
// @ts-ignore
import { Radio } from "@dhis2/ui";
import { Maybe } from "../../../../utils/ts-utils";
import i18n from "@eyeseetea/d2-ui-components/locales";
import { WidgetFeedback, WidgetState } from "../WidgetFeedback";

export interface BooleanWidgetProps {
    value: Maybe<string>;
    onValueChange(value: Maybe<string>): void;
    disabled: boolean;
    state: WidgetState;
}

const BooleanWidget: React.FC<BooleanWidgetProps> = props => {
    const { onValueChange, value, disabled } = props;

    const [stateValue, setStateValue] = React.useState(value);

    React.useEffect(() => setStateValue(value), [value]);

    const notifyChange = React.useCallback(
        (value: boolean) => {
            const strValue = value ? "true" : "false";
            setStateValue(strValue);
            onValueChange(strValue);
        },
        [onValueChange]
    );

    return (
        <WidgetFeedback state={props.state}>
            <Radio
                dense
                label={i18n.t("Yes")}
                onChange={() => {
                    notifyChange(true);
                }}
                checked={stateValue === "true"}
                disabled={disabled}
            />
            <Radio
                dense
                label={i18n.t("No")}
                onChange={() => {
                    notifyChange(false);
                }}
                checked={stateValue === "false"}
                disabled={disabled}
            />
        </WidgetFeedback>
    );
};

export default React.memo(BooleanWidget);
