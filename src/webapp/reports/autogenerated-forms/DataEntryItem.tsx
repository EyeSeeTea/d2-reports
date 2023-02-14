import React from "react";
// @ts-ignore
import { Id } from "../../../domain/common/entities/Base";
import { DataForm } from "../../../domain/common/entities/DataForm";
import { DataElement } from "../../../domain/common/entities/DataElement";
import { DataValue } from "../../../domain/common/entities/DataValue";
import SelectWidget, { SelectWidgetProps } from "./widgets/SelectWidget";
import { assertUnreachable, Maybe } from "../../../utils/ts-utils";
import BooleanWidget from "./widgets/BooleanWidget";
import NumberWidget from "./widgets/NumberWidget";
import TextWidget from "./widgets/TextWidget";
import { WidgetState } from "./WidgetFeedback";
import _ from "lodash";

interface DataEntryItemProps {
    dataForm: DataForm;
    dataValues: DataValue[];
    dataElement: DataElement;
    categoryOptionComboId: string;
    onValueChange: (dataValue: ItemDataValue) => Promise<void>;
    disabled: boolean;
}

export interface ItemDataValue {
    dataElementId: Id;
    categoryOptionComboId: Id;
    value: Maybe<string>;
}

const DataEntryItem: React.FC<DataEntryItemProps> = props => {
    const { dataValues, dataElement, categoryOptionComboId, disabled } = props;
    const [state, notifyChange] = useDataValueSaveWithFeedback(props);

    const dataValuesByKey = React.useMemo(() => {
        return _.keyBy(dataValues, getDataValueKey);
    }, [dataValues]);

    const key = getDataValueKey({ dataElementId: dataElement.id, categoryOptionComboId });
    const dataValue = dataValuesByKey[key];
    const value = dataValue?.value;
    const { valueType } = dataElement;

    switch (valueType) {
        case "BOOLEAN":
            return (
                <BooleanWidget
                    value={value}
                    onValueChange={notifyChange}
                    state={state}
                    disabled={disabled} //
                />
            );
        case "INTEGER_ZERO_OR_POSITIVE":
        case "INTEGER":
            return (
                <NumberWidget
                    value={value}
                    onValueChange={notifyChange}
                    state={state}
                    disabled={disabled} //
                />
            );
        case "TEXT":
            return (
                <TextWidget
                    value={value}
                    onValueChange={notifyChange}
                    state={state}
                    disabled={disabled} //
                />
            );
        case "OPTION":
            return (
                <SelectWidget
                    value={value}
                    options={dataElement.options}
                    onValueChange={notifyChange}
                    state={state}
                    disabled={disabled}
                    isMultiple={dataElement.isMultiple}
                />
            );
        default:
            return assertUnreachable(valueType);
    }
};

function useDataValueSaveWithFeedback(props: DataEntryItemProps) {
    const { dataElement, categoryOptionComboId, onValueChange } = props;
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

    return [state, notifyChange] as const;
}

function getDataValueKey(options: { dataElementId: Id; categoryOptionComboId: Id }) {
    return [options.dataElementId, options.categoryOptionComboId].join(".");
}

export default React.memo(DataEntryItem);
