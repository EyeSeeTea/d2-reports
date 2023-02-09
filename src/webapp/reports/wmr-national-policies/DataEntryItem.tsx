import React from "react";
// @ts-ignore
import { SingleSelect, SingleSelectOption, Radio, Input } from "@dhis2/ui";
import _ from "lodash";
import { Id } from "../../../domain/common/entities/Base";
import { DataElement, DataForm, DataFormValue } from "../../../domain/common/entities/DataForm";

export interface ItemDataValue {
    dataElementId: Id;
    categoryOptionComboId: Id;
    value: string | number;
}

type DataEntryItemProps = {
    dataForm: DataForm;
    data: DataFormValue[];
    dataElement: DataElement;
    categoryOptionComboId: string;
    onValueChange: (dataValue: ItemDataValue) => void;
    disabled?: boolean;
};

export const DataEntryItem: React.FC<DataEntryItemProps> = props => {
    const { dataForm, data, dataElement, categoryOptionComboId, onValueChange, disabled } = props;

    const dataValue = data.find(
        dv => dv.dataElementId === dataElement.id && dv.categoryOptionComboId === categoryOptionComboId
    );

    const optionSet = dataForm.optionSets.find(({ id }) => id === dataElement.optionSet?.id);
    if (optionSet) {
        const options = _.compact(
            optionSet.options?.map(({ id: optionId }) => dataForm.options.find(({ id }) => id === optionId))
        );

        return (
            <SingleSelect
                onChange={({ selected }: { selected: string }) => {
                    onValueChange({
                        dataElementId: dataElement.id,
                        categoryOptionComboId: categoryOptionComboId,
                        value: selected,
                    });
                }}
                selected={dataValue?.value}
                disabled={disabled}
            >
                {options.map(({ id, name, code }) => (
                    <SingleSelectOption
                        key={`option-${dataElement.id}-${optionSet.id}-${id}`}
                        label={name}
                        value={code}
                    />
                ))}
            </SingleSelect>
        );
    }

    if (dataElement.valueType === "BOOLEAN") {
        return (
            <>
                <Radio
                    dense
                    label="Yes"
                    onChange={() => {
                        onValueChange({
                            dataElementId: dataElement.id,
                            categoryOptionComboId: categoryOptionComboId,
                            value: "true",
                        });
                    }}
                    checked={dataValue?.value === "true"}
                    disabled={disabled}
                />
                <Radio
                    dense
                    label="No"
                    onChange={() => {
                        onValueChange({
                            dataElementId: dataElement.id,
                            categoryOptionComboId: categoryOptionComboId,
                            value: "false",
                        });
                    }}
                    checked={dataValue?.value === "false"}
                    disabled={disabled}
                />
            </>
        );
    }

    if (dataElement.valueType === "INTEGER_ZERO_OR_POSITIVE" || dataElement.valueType === "INTEGER") {
        return (
            <Input
                type="number"
                onChange={({ value }: { value: string }) => {
                    onValueChange({
                        dataElementId: dataElement.id,
                        categoryOptionComboId: categoryOptionComboId,
                        value: value,
                    });
                }}
                value={dataValue?.value}
                disabled={disabled}
            />
        );
    }

    if (dataElement.valueType === "TEXT") {
        return (
            <Input
                onChange={({ value }: { value: string }) => {
                    onValueChange({
                        dataElementId: dataElement.id,
                        categoryOptionComboId: categoryOptionComboId,
                        value,
                    });
                }}
                value={dataValue?.value}
                disabled={disabled}
            />
        );
    }

    throw new Error(`Unsupported value type ${dataElement.valueType}`);
};
