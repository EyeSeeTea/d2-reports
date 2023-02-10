import React from "react";
// @ts-ignore
import { Id } from "../../../domain/common/entities/Base";
import { DataElement, DataElementM, DataForm } from "../../../domain/common/entities/DataForm";
import { DataValue } from "../../../domain/common/entities/DataValue";
import SelectWidget, { SelectWidgetProps } from "./widgets/SelectWidget";
import { Maybe } from "../../../utils/ts-utils";
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
    const { dataForm, dataValues, dataElement, categoryOptionComboId, disabled } = props;
    const [state, notifyChange] = useDataValueSaveWithFeedback(props);

    const dataValuesByKey = React.useMemo(() => {
        return _.keyBy(dataValues, getDataValueKey);
    }, [dataValues]);

    const key = getDataValueKey({ dataElementId: dataElement.id, categoryOptionComboId });
    const dataValue = dataValuesByKey[key];
    const value = dataValue?.value;
    const optionSet = DataElementM.getOptionSet(dataForm, dataElement);

    if (optionSet) {
        return (
            <SelectWidget
                value={value}
                options={optionSet.options}
                onValueChange={notifyChange}
                state={state}
                disabled={disabled} //
            />
        );
    } else if (dataElement.valueType === "BOOLEAN") {
        return (
            <BooleanWidget
                value={value}
                onValueChange={notifyChange}
                state={state}
                disabled={disabled} //
            />
        );
    } else if (dataElement.valueType === "INTEGER_ZERO_OR_POSITIVE" || dataElement.valueType === "INTEGER") {
        return (
            <NumberWidget
                value={value}
                onValueChange={notifyChange}
                state={state}
                disabled={disabled} //
            />
        );
    } else if (dataElement.valueType === "TEXT") {
        return (
            <TextWidget
                value={value}
                onValueChange={notifyChange}
                state={state}
                disabled={disabled} //
            />
        );
    } else {
        return <span>Unsupported value type</span>;
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
