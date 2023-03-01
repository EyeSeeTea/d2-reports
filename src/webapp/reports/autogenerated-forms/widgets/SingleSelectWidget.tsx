import _ from "lodash";
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
    const { value } = dataValue;

    const notifyChange = React.useCallback(
        ({ selected }: { selected: string }) => {
            onValueChange({ ...dataValue, value: selected });
        },
        [onValueChange, dataValue]
    );

    const selectedValue = React.useMemo(
        () => (_(options).some(option => option.value === value) ? value : undefined),
        [value, options]
    );

    return (
        <WidgetFeedback state={props.state}>
            <SingleSelect
                onChange={notifyChange}
                selected={selectedValue}
                disabled={disabled}
                placeholder={i18n.t("Select")}
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

export default React.memo(SingleSelectWidget);
