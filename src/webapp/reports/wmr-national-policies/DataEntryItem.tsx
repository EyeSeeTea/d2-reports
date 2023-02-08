import { DataValueSetsDataValue, MetadataPayload } from "@eyeseetea/d2-api/2.34";
import React from "react";
// @ts-ignore
import { SingleSelect, SingleSelectOption, Radio, Input } from "@dhis2/ui";
import _ from "lodash";

export const DataEntryItem: React.FC<{
    metadata: MetadataPayload;
    data: DataValueSetsDataValue[];
    dataElement?: string;
    categoryOptionCombo?: string;
    saveValue: (dataValue: any) => void;
    disabled?: boolean;
}> = ({
    metadata,
    data,
    dataElement: dataElementId,
    categoryOptionCombo: categoryOptionComboId,
    saveValue,
    disabled,
}) => {
    const dataElement = metadata.dataElements.find(({ id }) => id === dataElementId);
    if (!dataElement) throw new Error(`Data element ${dataElementId} not assigned to dataset`);

    const dataValue = data.find(
        ({ dataElement, categoryOptionCombo }) =>
            dataElement === dataElementId && categoryOptionCombo === categoryOptionComboId
    );

    const optionSet = metadata.optionSets.find(({ id }) => id === dataElement.optionSet?.id);
    if (optionSet) {
        const options = _.compact(
            optionSet.options?.map(({ id: optionId }) => metadata.options.find(({ id }) => id === optionId))
        );

        return (
            <SingleSelect
                onChange={({ selected }: { selected: string }) => {
                    saveValue({
                        dataElement: dataElementId,
                        value: selected,
                        categoryOptionCombo: categoryOptionComboId,
                    });
                }}
                selected={dataValue?.value}
                disabled={disabled}
            >
                {options.map(({ id, name, code }) => (
                    <SingleSelectOption
                        key={`option-${dataElementId}-${optionSet.id}-${id}`}
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
                        saveValue({
                            dataElement: dataElementId,
                            value: "true",
                            categoryOptionCombo: categoryOptionComboId,
                        });
                    }}
                    checked={dataValue?.value === "true"}
                    disabled={disabled}
                />
                <Radio
                    dense
                    label="No"
                    onChange={() => {
                        saveValue({
                            dataElement: dataElementId,
                            value: "false",
                            categoryOptionCombo: categoryOptionComboId,
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
                    saveValue({
                        dataElement: dataElementId,
                        value: parseInt(value),
                        categoryOptionCombo: categoryOptionComboId,
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
                    saveValue({
                        dataElement: dataElementId,
                        value,
                        categoryOptionCombo: categoryOptionComboId,
                    });
                }}
                value={dataValue?.value}
                disabled={disabled}
            />
        );
    }

    throw new Error(`Unsupported value type ${dataElement.valueType}`);
};
