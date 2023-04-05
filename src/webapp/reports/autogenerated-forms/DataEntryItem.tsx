import React from "react";
import { DataValue } from "../../../domain/common/entities/DataValue";
import { assertUnreachable } from "../../../utils/ts-utils";
import BooleanDropdownWidget from "./widgets/BooleanDropdownWidget";
import NumberWidget from "./widgets/NumberWidget";
import TextWidget from "./widgets/TextWidget";
import { WidgetState } from "./WidgetFeedback";
import SingleSelectWidget from "./widgets/SingleSelectWidget";
import MultipleSelectWidget from "./widgets/MultipleSelectWidget";
import { WidgetProps } from "./widgets/WidgetBase";
import { DataElement, dataInputPeriodsType } from "../../../domain/common/entities/DataElement";
import { DataFormInfo } from "./AutogeneratedForm";
import SingleSelectRadioWidget from "./widgets/SingleSelectRadioWidget";
import YesNoWidget from "./widgets/YesNoWidget";
import FileWidget from "./widgets/FileWidget";
import DateWidget from "./widgets/DateWidget";
import YearPickerWidget from "./widgets/YearPickerWidget";

export interface DataEntryItemProps {
    dataElement: DataElement;
    dataFormInfo: DataFormInfo;
    period?: string; // Override period in dataFormInfo
    onValueChange: (dataValue: DataValue) => Promise<DataValue>;
}

function isInputExpired(
    period: string | undefined,
    dataFormPeriod: string,
    dataInputPeriods: dataInputPeriodsType,
    expiryDays: number
) {
    if (!expiryDays) return false;

    const periodToCheck = period ?? dataFormPeriod;

    const dataInputPeriod = dataInputPeriods?.find(p => p.period.id === periodToCheck);

    if (!dataInputPeriod || !dataInputPeriod?.closingDate) {
        return periodToCheck !== dataFormPeriod;
    } else {
        const closingDate = new Date(`${dataInputPeriod?.closingDate}Z`);
        closingDate.setDate(closingDate.getDate() + expiryDays);

        const now = new Date();

        return closingDate < now;
    }
}

const DataEntryItem: React.FC<DataEntryItemProps> = props => {
    const { dataElement, dataFormInfo } = props;
    const [dataValue, state, notifyChange] = useUpdatableDataValueWithFeedback(props);

    const { type } = dataValue;
    const { options } = dataElement;
    const disabled = isInputExpired(
        props.period,
        dataFormInfo.period,
        dataFormInfo.metadata.dataForm.dataInputPeriods,
        dataFormInfo.metadata.dataForm.expiryDays
    );
    const config = dataFormInfo.metadata.dataForm.options.dataElements[dataElement.id];
    const SingleComponent = config?.widget === "radio" ? SingleSelectRadioWidget : SingleSelectWidget;
    const BooleanComponent = config?.widget === "dropdown" ? BooleanDropdownWidget : YesNoWidget;

    if (options) {
        switch (type) {
            case "BOOLEAN":
            case "FILE":
                return <>Not supported</>;
            case "DATE":
                return (
                    <YearPickerWidget
                        dataValue={dataValue}
                        options={options.items}
                        onValueChange={notifyChange}
                        state={state}
                        disabled={disabled}
                    />
                );
            case "TEXT":
            case "NUMBER":
                return dataValue.isMultiple ? (
                    <MultipleSelectWidget
                        dataValue={dataValue}
                        options={options.items}
                        onValueChange={notifyChange}
                        state={state}
                        disabled={disabled}
                    />
                ) : (
                    <SingleComponent
                        dataValue={dataValue}
                        options={options.items}
                        onValueChange={notifyChange}
                        state={state}
                        disabled={disabled}
                    />
                );
            default:
                assertUnreachable(type);
        }
    } else if (!dataValue.isMultiple) {
        switch (type) {
            case "BOOLEAN":
                return (
                    <BooleanComponent
                        dataValue={dataValue}
                        onValueChange={notifyChange}
                        state={state}
                        disabled={disabled} //
                    />
                );
            case "NUMBER":
                return (
                    <NumberWidget
                        dataValue={dataValue}
                        onValueChange={notifyChange}
                        state={state}
                        disabled={disabled} //
                    />
                );
            case "TEXT":
                return (
                    <TextWidget
                        dataValue={dataValue}
                        onValueChange={notifyChange}
                        state={state}
                        disabled={disabled} //
                    />
                );
            case "FILE":
                return (
                    <FileWidget
                        dataValue={dataValue}
                        onValueChange={notifyChange}
                        state={state}
                        disabled={disabled} //
                    />
                );
            case "DATE":
                return (
                    <DateWidget
                        dataValue={dataValue}
                        onValueChange={notifyChange}
                        state={state}
                        disabled={disabled} //
                    />
                );

            default:
                return assertUnreachable(type);
        }
    } else {
        return <p>Data element not supported: {JSON.stringify(dataValue?.dataElement)}</p>;
    }
};

function useUpdatableDataValueWithFeedback(options: DataEntryItemProps) {
    const { onValueChange, dataFormInfo, dataElement } = options;
    const [state, setState] = React.useState<WidgetState>("original");
    const selector = React.useMemo(() => {
        return {
            orgUnitId: dataFormInfo.orgUnitId,
            period: options.period || dataFormInfo.period,
            categoryOptionComboId: dataFormInfo.categoryOptionComboId,
        };
    }, [dataFormInfo.orgUnitId, options.period, dataFormInfo.period, dataFormInfo.categoryOptionComboId]);

    const [dataValue, setDataValue] = React.useState<DataValue>(() =>
        dataFormInfo.data.values.getOrEmpty(dataElement, selector)
    );

    React.useEffect(() => {
        const dataValue = dataFormInfo.data.values.getOrEmpty(dataElement, selector);
        setDataValue(dataValue);
    }, [dataFormInfo.data.values, dataElement, selector]);

    const notifyChange = React.useCallback<WidgetProps["onValueChange"]>(
        dataValue => {
            setState("saving");
            setDataValue(dataValue);

            onValueChange(dataValue)
                .then(dataValueUpdated => {
                    setDataValue(dataValueUpdated);
                    return setState("saveSuccessful");
                })
                .catch(() => setState("saveError"));
        },
        [onValueChange]
    );

    return [dataValue, state, notifyChange] as const;
}

export default React.memo(DataEntryItem);
