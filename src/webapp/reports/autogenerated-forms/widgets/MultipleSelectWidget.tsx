import React from "react";
// @ts-ignore
import { MultiSelect, MultiSelectOption } from "@dhis2/ui";
import { Option } from "../../../../domain/common/entities/DataElement";
import { WidgetFeedback } from "../WidgetFeedback";
import i18n from "@eyeseetea/d2-ui-components/locales";
import { DataValueNumberMultiple, DataValueTextMultiple } from "../../../../domain/common/entities/DataValue";
import { WidgetProps } from "./WidgetBase";

type DataValueMultiple = DataValueNumberMultiple | DataValueTextMultiple;

export interface MultipleSelectWidgetProps extends WidgetProps {
    dataValue: DataValueMultiple;
    options: Option<string>[];
}

const MultipleSelectWidget: React.FC<MultipleSelectWidgetProps> = props => {
    const { onValueChange, disabled, options, dataValue } = props;

    const [stateValues, setStateValues] = React.useState(() => dataValue.values);

    React.useEffect(() => {
        return setStateValues(dataValue.values);
    }, [dataValue.values]);

    const notifyChange = React.useCallback(
        ({ selected }: { selected: string[] }) => {
            setStateValues(selected);
            onValueChange({ ...dataValue, values: selected });
        },
        [onValueChange, dataValue]
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

export default React.memo(MultipleSelectWidget);
