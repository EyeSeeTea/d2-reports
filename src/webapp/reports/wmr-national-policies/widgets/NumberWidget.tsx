import React from "react";
// @ts-ignore
import { Input } from "@dhis2/ui";
import { Maybe } from "../../../../utils/ts-utils";
import { WidgetFeedback, WidgetState } from "../WidgetFeedback";

export interface NumberWidgetProps {
    value: Maybe<string>;
    onValueChange(value: Maybe<string>): void;
    disabled: boolean;
    state: WidgetState;
}

const NumberWidget: React.FC<NumberWidgetProps> = props => {
    const { onValueChange, value, disabled } = props;

    const [stateValue, setStateValue] = React.useState(value);

    React.useEffect(() => setStateValue(value), [value]);

    const notifyChange = React.useCallback(
        ({ value }: { value: string }) => {
            setStateValue(value);
            onValueChange(value);
        },
        [onValueChange]
    );

    return (
        <WidgetFeedback state={props.state}>
            <Input type="number" onChange={notifyChange} value={stateValue} disabled={disabled} />
        </WidgetFeedback>
    );
};

export default React.memo(NumberWidget);
