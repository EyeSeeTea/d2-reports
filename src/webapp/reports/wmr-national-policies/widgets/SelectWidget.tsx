import React from "react";
// @ts-ignore
import { SingleSelect, SingleSelectOption } from "@dhis2/ui";
import { Option } from "../../../../domain/common/entities/DataForm";
import { Maybe } from "../../../../utils/ts-utils";

export interface SelectWidgetProps {
    value: Maybe<string>;
    options: Option[];
    onValueChange(value: Maybe<string>): void;
    disabled: boolean;
}

const SelectWidget: React.FC<SelectWidgetProps> = props => {
    const { onValueChange, value, disabled, options } = props;

    const [stateValue, setStateValue] = React.useState(value);

    React.useEffect(() => setStateValue(value), [value]);

    const notifyChange = React.useCallback(
        ({ selected }: { selected: string }) => {
            setStateValue(selected);
            onValueChange(selected);
        },
        [onValueChange]
    );

    return (
        <SingleSelect onChange={notifyChange} selected={stateValue} disabled={disabled}>
            {options.map(({ id, name, code }) => (
                <SingleSelectOption key={`option-${id}`} label={name} value={code} />
            ))}
        </SingleSelect>
    );
};

export default React.memo(SelectWidget);
