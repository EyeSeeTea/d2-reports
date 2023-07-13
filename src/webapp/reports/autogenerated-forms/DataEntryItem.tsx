import React from "react";
import { DataValue } from "../../../domain/common/entities/DataValue";
import { assertUnreachable } from "../../../utils/ts-utils";
import BooleanDropdownWidget from "./widgets/BooleanDropdownWidget";
import NumberWidget from "./widgets/NumberWidget";
import TextWidget from "./widgets/TextWidget";
import { WidgetState } from "./WidgetFeedback";
import SingleSelectWidget from "./widgets/SingleSelectWidget";
import MultipleSelectWidget from "./widgets/MultipleSelectWidget";
import { DataElement, dataInputPeriodsType } from "../../../domain/common/entities/DataElement";
import { DataFormInfo } from "./AutogeneratedForm";
import SingleSelectRadioWidget from "./widgets/SingleSelectRadioWidget";
import YesNoWidget from "./widgets/YesNoWidget";
import FileWidget from "./widgets/FileWidget";
import DateWidget from "./widgets/DateWidget";
import YearPickerWidget from "./widgets/YearPickerWidget";
import SourceTypeWidget from "./widgets/SourceTypeWidget";
import { Row } from "./GridWithTotalsViewModel";

export interface DataEntryItemProps {
    dataElement: DataElement;
    dataFormInfo: DataFormInfo;
    period?: string; // Override period in dataFormInfo
    onValueChange: (dataValue: DataValue) => Promise<DataValue>;
    manualyDisabled?: boolean;
    total?: DataElement;
    columnTotal?: DataElement;
    rowDataElements?: DataElement[];
    columnDataElements?: DataElement[];
    cocId: string;
    rows?: Row[];
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

function getValueAccordingType(dataValue: DataValue) {
    switch (dataValue.type) {
        case "BOOLEAN":
            return dataValue.value;
        case "FILE":
            return undefined;
        case "DATE":
            return dataValue.value;
        case "TEXT":
            return dataValue.isMultiple ? dataValue.values.join(",") : dataValue.value;
        case "NUMBER":
            return dataValue.isMultiple ? dataValue.values.join(",") : dataValue.value;
        default:
            assertUnreachable(dataValue);
    }
}

function isVisible(dataElement: DataElement, dataFormInfo: DataFormInfo, period: string | undefined) {
    if (dataElement.related) {
        const dataValue = dataFormInfo.data.values.getOrEmpty(dataElement.related.dataElement, {
            orgUnitId: dataElement.orgUnit || dataFormInfo.orgUnitId,
            period: period || dataFormInfo.period,
            categoryOptionComboId: dataFormInfo.categoryOptionComboId,
        });
        const value = getValueAccordingType(dataValue);
        return dataElement.related.value === String(value);
    }
    return true;
}

const DataEntryItem: React.FC<DataEntryItemProps> = props => {
    const { dataElement, dataFormInfo, manualyDisabled: handDisabled, rowDataElements, rows } = props;
    const [dataValue, state, notifyChange] = useUpdatableDataValueWithFeedback(props);

    const { type } = dataValue;
    const { options } = dataElement;
    const disabled = !handDisabled
        ? isInputExpired(
              props.period,
              dataFormInfo.period,
              dataFormInfo.metadata.dataForm.dataInputPeriods,
              dataFormInfo.metadata.dataForm.expiryDays
          )
        : handDisabled;
    const config = dataFormInfo.metadata.dataForm.options.dataElements[dataElement.id];
    const SingleComponent = config?.widget === "radio" ? SingleSelectRadioWidget : SingleSelectWidget;
    const BooleanComponent = config?.widget === "dropdown" ? BooleanDropdownWidget : YesNoWidget;

    if (!isVisible(dataElement, dataFormInfo, props.period)) {
        return null;
    }

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
                if (config?.widget === "sourceType" && dataValue.isMultiple) {
                    const sourceTypeDEs = dataFormInfo.metadata.dataForm.dataElements.flatMap(de => {
                        if (de.name.endsWith(" - Source Type") && de.id !== dataValue.dataElement.id) {
                            return { id: de.id, name: de.name };
                        } else {
                            return [];
                        }
                    });

                    return (
                        <SourceTypeWidget
                            dataValue={dataValue}
                            dataFormInfo={dataFormInfo}
                            options={options.items}
                            onValueChange={notifyChange}
                            state={state}
                            disabled={disabled}
                            sourceTypeDEs={sourceTypeDEs}
                            rowDataElements={rowDataElements}
                            rows={rows}
                        />
                    );
                } else {
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
                }
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
    const { cocId, dataFormInfo, dataElement, total, columnTotal, rowDataElements, columnDataElements } = options;
    const [state, setState] = React.useState<WidgetState>("original");
    const selector = React.useMemo(() => {
        return {
            orgUnitId: options.dataElement.orgUnit || dataFormInfo.orgUnitId,
            period: options.period || dataFormInfo.period,
            categoryOptionComboId: dataFormInfo.categoryOptionComboId,
        };
    }, [
        options.dataElement.orgUnit,
        dataFormInfo.orgUnitId,
        options.period,
        dataFormInfo.period,
        dataFormInfo.categoryOptionComboId,
    ]);

    const dataValue = React.useMemo(
        () => dataFormInfo.data.values.getOrEmpty(dataElement, selector),
        [dataFormInfo.data.values, dataElement, selector]
    );

    const save = dataFormInfo.data.save;
    const saveWithTotals = dataFormInfo.data.saveWithTotals;

    const notifyChange = React.useCallback(
        dataValue => {
            setState("saving");
            const disableTotalSum = total?.name.startsWith("41.") || total?.name.startsWith("18");
            if (total && columnTotal && rowDataElements && columnDataElements && !disableTotalSum) {
                saveWithTotals(dataValue, total, columnTotal, rowDataElements, columnDataElements, cocId)
                    .then(() => setState("saveSuccessful"))
                    .catch(() => setState("saveError"));
            } else {
                save(dataValue)
                    .then(() => setState("saveSuccessful"))
                    .catch(() => setState("saveError"));
            }
        },
        [columnDataElements, columnTotal, rowDataElements, save, saveWithTotals, total, cocId]
    );

    return [dataValue, state, notifyChange] as const;
}

export default React.memo(DataEntryItem);
