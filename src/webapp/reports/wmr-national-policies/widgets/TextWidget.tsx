import React from "react";
// @ts-ignore
import { Input } from "@dhis2/ui";
import { Maybe } from "../../../../utils/ts-utils";

export interface TextWidgetProps {
    value: Maybe<string>;
    onValueChange(value: Maybe<string>): void;
    disabled: boolean;
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

    return <Input onChange={notifyChange} value={stateValue} disabled={disabled} />;
};

export default React.memo(TextWidget);
