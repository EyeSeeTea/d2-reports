import _ from "lodash";
import React from "react";
// @ts-ignore
import { MultiSelect, MultiSelectOption } from "@dhis2/ui";
import { Option } from "../../../../domain/common/entities/DataElement";
import { WidgetFeedback } from "../WidgetFeedback";
import { DataValueNumberMultiple, DataValueTextMultiple } from "../../../../domain/common/entities/DataValue";
import { WidgetProps } from "./WidgetBase";

type DataValueMultiple = DataValueNumberMultiple | DataValueTextMultiple;

export interface MultipleSelectWidgetProps extends WidgetProps {
    dataValue: DataValueMultiple;
    options: Option<string>[];
}

const MultipleSelectWidget: React.FC<MultipleSelectWidgetProps> = props => {
    const { onValueChange, disabled, options, dataValue } = props;

    const notifyChange = React.useCallback(
        ({ selected }: { selected: string[] }) => {
            onValueChange({ ...dataValue, values: selected });
        },
        [onValueChange, dataValue]
    );

    const selectedValues = React.useMemo(
        () => dataValue.values.filter(value => _(options).some(option => option.value === value)),
        [dataValue.values, options]
    );

    return (
        <WidgetFeedback state={props.state}>
            <MultiSelect onChange={notifyChange} selected={selectedValues} disabled={disabled}>
                {options.map(option => (
                    <MultiSelectOption key={option.value} label={option.name} value={option.value} />
                ))}
            </MultiSelect>
        </WidgetFeedback>
    );
};

export default React.memo(MultipleSelectWidget);
