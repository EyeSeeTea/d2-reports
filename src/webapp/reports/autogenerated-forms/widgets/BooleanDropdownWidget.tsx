import React from "react";
// @ts-ignore
import { SingleSelect, SingleSelectOption } from "@dhis2/ui";
import { WidgetFeedback } from "../WidgetFeedback";
import { DataValueBoolean } from "../../../../domain/common/entities/DataValue";
import { WidgetProps } from "./WidgetBase";
import { Maybe } from "../../../../utils/ts-utils";
import { Option } from "../../../../domain/common/entities/DataElement";
import { useAppContext } from "../../../contexts/app-context";

export interface BooleanWidgetProps extends WidgetProps {
    dataValue: DataValueBoolean;
}

const BooleanDropdownWidget: React.FC<BooleanWidgetProps> = props => {
    const { onValueChange, dataValue, disabled } = props;
    const { config } = useAppContext();

    const notifyChange = React.useCallback(
        (value: { selected: Maybe<string> }) => {
            const { selected } = value;
            onValueChange({
                ...dataValue,
                value: selected === "true" ? true : selected === "false" ? false : undefined,
            });
        },
        [onValueChange, dataValue]
    );

    const options = React.useMemo<Option<string>[]>(
        () => [
            { value: "true", name: config.translations.yes },
            { value: "false", name: config.translations.no },
        ],
        [config]
    );

    const selected = dataValue.value ? "true" : dataValue.value === false ? "false" : undefined;

    return (
        <WidgetFeedback state={props.state}>
            <SingleSelect
                onChange={notifyChange}
                selected={selected}
                disabled={disabled}
                clearable={true}
                clearText="✕"
            >
                {options.map(option => (
                    <SingleSelectOption key={option.value} label={option.name} value={option.value} />
                ))}
            </SingleSelect>
        </WidgetFeedback>
    );
};

export default React.memo(BooleanDropdownWidget);
