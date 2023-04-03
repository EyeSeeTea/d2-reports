import _ from "lodash";
import React from "react";
// @ts-ignore
import { SingleSelect, SingleSelectOption } from "@dhis2/ui";
import { Option } from "../../../../domain/common/entities/DataElement";
import { WidgetFeedback } from "../WidgetFeedback";
import { DataValueDate, DateObj } from "../../../../domain/common/entities/DataValue";
import { WidgetProps } from "./WidgetBase";

export interface YearPickerWidgetProps extends WidgetProps {
    dataValue: DataValueDate;
    options: Option<string>[];
}

function dateToYear(item: DateObj | undefined): string {
    return item ? item.year.toString() : "";
}

function yearToDate(year: string): DateObj | undefined {
    return year
        ? {
              year: Number(year),
              month: 1,
              day: 1,
          }
        : undefined;
}

const YearPickerWidget: React.FC<YearPickerWidgetProps> = props => {
    const { onValueChange, dataValue, disabled, options } = props;
    const { value } = dataValue;

    const notifyChange = React.useCallback(
        ({ selected }: { selected: string }) => {
            onValueChange({ ...dataValue, value: yearToDate(selected) });
        },
        [onValueChange, dataValue]
    );

    const selectedValue = React.useMemo(
        () => (_(options).some(option => option.value === dateToYear(value)) ? dateToYear(value) : undefined),
        [value, options]
    );

    return (
        <WidgetFeedback state={props.state}>
            <SingleSelect
                onChange={notifyChange}
                selected={selectedValue}
                disabled={disabled}
                clearable={true}
                clearText="✕"
            >
                {options.map(option => (
                    <SingleSelectOption key={`option-${option.value}`} label={option.name} value={option.value} />
                ))}
            </SingleSelect>
        </WidgetFeedback>
    );
};

export default React.memo(YearPickerWidget);
