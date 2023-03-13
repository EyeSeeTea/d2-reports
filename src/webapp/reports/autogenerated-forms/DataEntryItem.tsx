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
import { DataElement } from "../../../domain/common/entities/DataElement";
import { DataFormInfo } from "./AutogeneratedForm";
import SingleSelectRadioWidget from "./widgets/SingleSelectRadioWidget";
import YesNoWidget from "./widgets/YesNoWidget";

export interface DataEntryItemProps {
    dataElement: DataElement;
    dataFormInfo: DataFormInfo;
    period?: string; // Override period in dataFormInfo
    onValueChange: (dataValue: DataValue) => Promise<void>;
}

const DataEntryItem: React.FC<DataEntryItemProps> = props => {
    const { dataElement, dataFormInfo } = props;
    const [dataValue, state, notifyChange] = useUpdatableDataValueWithFeedback(props);

    const { type } = dataValue;
    const { options } = dataElement;
    const disabled = false;
    const config = dataFormInfo.metadata.dataForm.options.dataElements[dataElement.id];
    const SingleComponent = config?.widget === "radio" ? SingleSelectRadioWidget : SingleSelectWidget;
    const BooleanComponent = config?.widget === "dropdown" ? BooleanDropdownWidget : YesNoWidget;

    if (options) {
        switch (type) {
            case "BOOLEAN":
                return <>Boolean with options not supported</>;
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
                .then(() => setState("saveSuccessful"))
                .catch(() => setState("saveError"));
        },
        [onValueChange]
    );

    return [dataValue, state, notifyChange] as const;
}

export default React.memo(DataEntryItem);
