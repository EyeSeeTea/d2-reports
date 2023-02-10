import React from "react";
// @ts-ignore
import { Id } from "../../../domain/common/entities/Base";
import { DataElement, DataForm } from "../../../domain/common/entities/DataForm";
import { DataValue } from "../../../domain/common/entities/DataValue";
import SelectWidget, { SelectWidgetProps } from "./widgets/SelectWidget";
import { Maybe } from "../../../utils/ts-utils";
import BooleanWidget from "./widgets/BooleanWidget";
import NumberWidget from "./widgets/NumberWidget";
import TextWidget from "./widgets/TextWidget";
import { WidgetState } from "./WidgetFeedback";

export interface ItemDataValue {
    dataElementId: Id;
    categoryOptionComboId: Id;
    value: Maybe<string>;
}

type DataEntryItemProps = {
    dataForm: DataForm;
    data: DataValue[];
    dataElement: DataElement;
    categoryOptionComboId: string;
    onValueChange: (dataValue: ItemDataValue) => Promise<void>;
    disabled: boolean;
};

const DataEntryItem: React.FC<DataEntryItemProps> = props => {
    const { dataForm, data, dataElement, categoryOptionComboId, onValueChange, disabled } = props;

    const dataValue = data.find(
        dv => dv.dataElementId === dataElement.id && dv.categoryOptionComboId === categoryOptionComboId
    );

    const optionSet = dataForm.optionSets.find(({ id }) => id === dataElement.optionSet?.id);

    const [state, setState] = React.useState<WidgetState>("original");

    const notifyChange = React.useCallback<SelectWidgetProps["onValueChange"]>(
        async value => {
            setState("saving");

            onValueChange({ dataElementId: dataElement.id, categoryOptionComboId, value })
                .then(() => setState("saveSuccessful"))
                .catch(() => setState("saveError"));
        },
        [dataElement, categoryOptionComboId, onValueChange]
    );

    if (optionSet) {
        return (
            <SelectWidget
                value={dataValue?.value}
                options={optionSet.options}
                onValueChange={notifyChange}
                disabled={disabled}
                state={state} //
            />
        );
    } else if (dataElement.valueType === "BOOLEAN") {
        return (
            <BooleanWidget
                value={dataValue?.value}
                onValueChange={notifyChange}
                state={state}
                disabled={disabled} //
            />
        );
    } else if (dataElement.valueType === "INTEGER_ZERO_OR_POSITIVE" || dataElement.valueType === "INTEGER") {
        return (
            <NumberWidget
                value={dataValue?.value}
                onValueChange={notifyChange}
                state={state}
                disabled={disabled} //
            />
        );
    } else if (dataElement.valueType === "TEXT") {
        return (
            <TextWidget
                value={dataValue?.value}
                onValueChange={notifyChange}
                state={state}
                disabled={disabled} //
            />
        );
    } else {
        throw new Error(`Unsupported value type ${dataElement.valueType}`);
    }
};

export default React.memo(DataEntryItem);
