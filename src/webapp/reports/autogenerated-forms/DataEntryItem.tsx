import React from "react";
// @ts-ignore
import { DataValue, DataValueStore } from "../../../domain/common/entities/DataValue";
import { assertUnreachable } from "../../../utils/ts-utils";
import BooleanWidget from "./widgets/BooleanWidget";
import NumberWidget from "./widgets/NumberWidget";
import TextWidget from "./widgets/TextWidget";
import { WidgetState } from "./WidgetFeedback";
import SingleSelectWidget from "./widgets/SingleSelectWidget";
import MultipleSelectWidget from "./widgets/MultipleSelectWidget";
import { WidgetProps } from "./widgets/WidgetBase";
import { DataElement } from "../../../domain/common/entities/DataElement";
import { DataFormInfo } from "./AutogeneratedForm";

interface DataEntryItemProps {
    dataElement: DataElement;
    dataFormInfo: DataFormInfo;
    onValueChange: (dataValue: DataValue) => Promise<void>;
    disabled: boolean;
}

const DataEntryItem: React.FC<DataEntryItemProps> = props => {
    const { dataElement, dataFormInfo, disabled } = props;
    const { categoryOptionComboId, orgUnitId, period } = dataFormInfo;
    const [dataValues, state, notifyChange] = useDataValueSaveWithFeedback(props);

    const dataValue = dataValues.getOrEmpty(dataElement, { categoryOptionComboId, period, orgUnitId });
    const { type } = dataValue;
    const { options } = dataElement;

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
                    <SingleSelectWidget
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
                    <BooleanWidget
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
        return <p>Data element not supported: {JSON.stringify(dataValue.dataElement)}</p>;
    }
};

function useDataValueSaveWithFeedback(props: DataEntryItemProps) {
    const { onValueChange, dataFormInfo } = props;
    const [state, setState] = React.useState<WidgetState>("original");

    const [dataValues, setDataValues] = React.useState<DataValueStore>(dataFormInfo.data.values);

    const notifyChange = React.useCallback<WidgetProps["onValueChange"]>(
        dataValue => {
            setState("saving");

            onValueChange(dataValue)
                .then(() => {
                    setDataValues(prevDataValues => prevDataValues.set(dataValue));
                    return setState("saveSuccessful");
                })
                .catch(() => setState("saveError"));
        },
        [onValueChange]
    );

    return [dataValues, state, notifyChange] as const;
}

export default React.memo(DataEntryItem);
