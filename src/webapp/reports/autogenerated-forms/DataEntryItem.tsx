import React from "react";
// @ts-ignore
import { Id } from "../../../domain/common/entities/Base";
import { DataForm } from "../../../domain/common/entities/DataForm";
import { DataValue, DataValueIndexed, DataValueM } from "../../../domain/common/entities/DataValue";
import { assertUnreachable } from "../../../utils/ts-utils";
import BooleanWidget from "./widgets/BooleanWidget";
import NumberWidget from "./widgets/NumberWidget";
import TextWidget from "./widgets/TextWidget";
import { WidgetState } from "./WidgetFeedback";
import SingleSelectWidget from "./widgets/SingleSelectWidget";
import MultipleSelectWidget from "./widgets/MultipleSelectWidget";
import { WidgetProps } from "./widgets/WidgetBase";

interface DataEntryItemProps {
    dataForm: DataForm;
    dataElementId: Id;
    dataValues: DataValueIndexed;
    categoryOptionComboId: string;
    onValueChange: (dataValue: DataValue) => Promise<void>;
    disabled: boolean;
}

const DataEntryItem: React.FC<DataEntryItemProps> = props => {
    const { dataValues, categoryOptionComboId, dataElementId, disabled } = props;
    const [state, notifyChange] = useDataValueSaveWithFeedback(props);

    const key = DataValueM.getSelector({ dataElementId, categoryOptionComboId });
    const dataValue = dataValues[key];
    if (!dataValue) return null;

    const { type, dataElement } = dataValue;
    const { options } = dataElement;

    if (options) {
        switch (type) {
            case "BOOLEAN":
                return null;
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
        return <p>Data element supported: {JSON.stringify(dataValue.dataElement)}</p>;
    }
};

function useDataValueSaveWithFeedback(props: DataEntryItemProps) {
    const { onValueChange } = props;
    const [state, setState] = React.useState<WidgetState>("original");

    const notifyChange = React.useCallback<WidgetProps["onValueChange"]>(
        dataValue => {
            setState("saving");

            onValueChange(dataValue)
                .then(() => setState("saveSuccessful"))
                .catch(() => setState("saveError"));
        },
        [onValueChange]
    );

    return [state, notifyChange] as const;
}

export default React.memo(DataEntryItem);
