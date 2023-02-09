import React from "react";
// @ts-ignore
import { Id } from "../../../domain/common/entities/Base";
import { DataElement, DataForm, DataFormValue } from "../../../domain/common/entities/DataForm";
import SelectWidget, { SelectWidgetProps } from "./widgets/SelectWidget";
import { Maybe } from "../../../utils/ts-utils";
import BooleanWidget from "./widgets/BooleanWidget";
import NumberWidget from "./widgets/NumberWidget";
import TextWidget from "./widgets/TextWidget";

export interface ItemDataValue {
    dataElementId: Id;
    categoryOptionComboId: Id;
    value: Maybe<string>;
}

type DataEntryItemProps = {
    dataForm: DataForm;
    data: DataFormValue[];
    dataElement: DataElement;
    categoryOptionComboId: string;
    onValueChange: (dataValue: ItemDataValue) => void;
    disabled: boolean;
};

const DataEntryItem: React.FC<DataEntryItemProps> = props => {
    const { dataForm, data, dataElement, categoryOptionComboId, onValueChange, disabled } = props;

    const dataValue = data.find(
        dv => dv.dataElementId === dataElement.id && dv.categoryOptionComboId === categoryOptionComboId
    );

    const optionSet = dataForm.optionSets.find(({ id }) => id === dataElement.optionSet?.id);

    const notifyChange = React.useCallback<SelectWidgetProps["onValueChange"]>(
        value => {
            onValueChange({ dataElementId: dataElement.id, categoryOptionComboId, value });
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
            />
        );
    } else if (dataElement.valueType === "BOOLEAN") {
        return (
            <BooleanWidget
                value={dataValue?.value}
                onValueChange={notifyChange}
                disabled={disabled} //
            />
        );
    } else if (dataElement.valueType === "INTEGER_ZERO_OR_POSITIVE" || dataElement.valueType === "INTEGER") {
        return (
            <NumberWidget
                value={dataValue?.value}
                onValueChange={notifyChange}
                disabled={disabled} //
            />
        );
    } else if (dataElement.valueType === "TEXT") {
        return (
            <TextWidget
                value={dataValue?.value}
                onValueChange={notifyChange}
                disabled={disabled} //
            />
        );
    } else {
        throw new Error(`Unsupported value type ${dataElement.valueType}`);
    }
};

export default React.memo(DataEntryItem);
