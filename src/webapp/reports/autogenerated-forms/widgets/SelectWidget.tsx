import _ from "lodash";
import React from "react";
// @ts-ignore
import { SingleSelect, SingleSelectOption, MultiSelect, MultiSelectOption } from "@dhis2/ui";
import { Option } from "../../../../domain/common/entities/DataElement";
import { Maybe } from "../../../../utils/ts-utils";
import { WidgetFeedback, WidgetState } from "../WidgetFeedback";
import i18n from "@eyeseetea/d2-ui-components/locales";

export interface SelectWidgetProps {
    value: Maybe<string>;
    options: Option[];
    onValueChange(value: Maybe<string>): void;
    disabled: boolean;
    state: WidgetState;
    isMultiple: boolean;
}

const SingleSelectWidget: React.FC<SelectWidgetProps> = props => {
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
        <WidgetFeedback state={props.state}>
            <SingleSelect
                onChange={notifyChange}
                selected={stateValue}
                disabled={disabled}
                placeholder={i18n.t("Select option")}
            >
                {options.map(option => (
                    <SingleSelectOption key={`option-${option.value}`} label={option.name} value={option.value} />
                ))}
            </SingleSelect>
        </WidgetFeedback>
    );
};

function getValue(value: Maybe<string>) {
    return (
        _(value?.split(";"))
            .map(s => s.trim())
            .compact()
            .value() || []
    );
}

const MultiSelectWidget: React.FC<SelectWidgetProps> = props => {
    const { onValueChange, disabled, options } = props;

    const [stateValues, setStateValues] = React.useState(() => getValue(props.value));

    React.useEffect(() => {
        return setStateValues(getValue(props.value));
    }, [props.value]);

    const notifyChange = React.useCallback(
        ({ selected }: { selected: string[] }) => {
            setStateValues(selected);
            onValueChange(selected.join("; "));
        },
        [onValueChange]
    );

    return (
        <WidgetFeedback state={props.state}>
            <MultiSelect
                onChange={notifyChange}
                selected={stateValues}
                disabled={disabled}
                placeholder={i18n.t("Select option")}
            >
                {options.map(option => (
                    <MultiSelectOption key={option.value} label={option.name} value={option.value} />
                ))}
            </MultiSelect>
        </WidgetFeedback>
    );
};

export const SelectWidget: React.FC<SelectWidgetProps> = React.memo(props => {
    if (props.isMultiple) {
        return <MultiSelectWidget {...props} />;
    } else {
        return <SingleSelectWidget {...props} />;
    }
});

export default React.memo(SelectWidget);
