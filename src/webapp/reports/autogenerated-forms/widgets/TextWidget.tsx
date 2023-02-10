import React from "react";
// @ts-ignore
import { Input } from "@dhis2/ui";
import { Maybe } from "../../../../utils/ts-utils";
import { WidgetState, WidgetFeedback } from "../WidgetFeedback";

export interface TextWidgetProps {
    value: Maybe<string>;
    onValueChange(value: Maybe<string>): void;
    disabled: boolean;
    state: WidgetState;
}

const TextWidget: React.FC<TextWidgetProps> = props => {
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
            <Input onChange={notifyChange} value={stateValue} disabled={disabled} />
        </WidgetFeedback>
    );
};

export default React.memo(TextWidget);
