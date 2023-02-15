import React from "react";
// @ts-ignore
import { SingleSelect, SingleSelectOption } from "@dhis2/ui";
import { Option } from "../../../../domain/common/entities/DataElement";
import { WidgetFeedback } from "../WidgetFeedback";
import i18n from "@eyeseetea/d2-ui-components/locales";
import { DataValueNumberSingle, DataValueTextSingle } from "../../../../domain/common/entities/DataValue";
import { WidgetProps } from "./WidgetBase";

type DataValueSingle = DataValueNumberSingle | DataValueTextSingle;

export interface SingleSelectWidgetProps extends WidgetProps {
    dataValue: DataValueSingle;
    options: Option<string>[];
}

const SingleSelectWidget: React.FC<SingleSelectWidgetProps> = props => {
    const { onValueChange, dataValue, disabled, options } = props;

    const [stateValue, setStateValue] = React.useState(dataValue.value);

    React.useEffect(() => setStateValue(dataValue.value), [dataValue.value]);

    const notifyChange = React.useCallback(
        ({ selected }: { selected: string }) => {
            setStateValue(selected);
            onValueChange({ ...dataValue, value: selected });
        },
        [onValueChange, dataValue]
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

export default React.memo(SingleSelectWidget);