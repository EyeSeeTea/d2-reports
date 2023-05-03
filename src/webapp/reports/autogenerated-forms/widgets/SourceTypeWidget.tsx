import _ from "lodash";
import React from "react";
// @ts-ignore
import { MultiSelect, MultiSelectOption, Button } from "@dhis2/ui";
import { Option, DataElement } from "../../../../domain/common/entities/DataElement";
import { WidgetFeedback } from "../WidgetFeedback";
import { DataValueNumberSingle, DataValueTextMultiple } from "../../../../domain/common/entities/DataValue";
import { WidgetProps } from "./WidgetBase";
import i18n from "../../../../locales";
import { DataElementRefType } from "../../../../domain/common/repositories/DataValueRepository";
import { DataFormInfo } from "../AutogeneratedForm";
import { useBooleanState } from "../../../utils/use-boolean";

export interface SourceTypeWidgetProps extends WidgetProps {
    dataValue: DataValueTextMultiple;
    dataFormInfo: DataFormInfo;
    options: Option<string>[];
    sourceTypeDEs: DataElementRefType[];
    rowDataElements?: DataElement[];
}

const SourceTypeWidget: React.FC<SourceTypeWidgetProps> = props => {
    const { onValueChange, disabled, options, dataValue, dataFormInfo, sourceTypeDEs, rowDataElements } = props;
    const [btnDisabled, setBtnDisabled] = useBooleanState(false);

    // TODO: Right now if the row is empty, the "Apply to all" button is disabled. That's not the function requested.
    // The requested functionality is: Each target sourceType field should check if its row is empty before applying or not the new sourceType value.
    const btnStatus = React.useCallback(() => {
        if (!rowDataElements) return;
        const newRowTotalValue = rowDataElements
            .map(de => {
                const dv = dataFormInfo.data.values.get(de, {
                    ...dataValue,
                    categoryOptionComboId: de.cocId ?? de.categoryCombos.categoryOptionCombos[0]?.id ?? "",
                }) as DataValueNumberSingle;
                return dv.value ?? "0";
            })
            .reduce((partialSum, i) => partialSum + Number(i), 0);

        if (newRowTotalValue > 0) {
            setBtnDisabled.enable();
        } else {
            setBtnDisabled.disable();
        }
    }, [dataFormInfo.data.values, dataValue, rowDataElements, setBtnDisabled]);

    const notifyChange = React.useCallback(
        ({ selected }: { selected: string[] }) => {
            onValueChange({ ...dataValue, values: selected });
            btnStatus();
        },
        [onValueChange, dataValue, btnStatus]
    );

    const applyToAll = React.useCallback(() => {
        dataFormInfo.data.stApplyToAll(dataValue, sourceTypeDEs);
        notifyChange({ selected: dataValue.values });
    }, [dataFormInfo.data, dataValue, notifyChange, sourceTypeDEs]);

    const selectedValues = React.useMemo(
        () => dataValue.values.filter(value => _(options).some(option => option.value === value)),
        [dataValue.values, options]
    );

    return (
        <WidgetFeedback state={props.state}>
            <MultiSelect onChange={notifyChange} selected={selectedValues} disabled={disabled}>
                {options.map(option => (
                    <MultiSelectOption key={option.value} label={option.name} value={option.value} />
                ))}
            </MultiSelect>
            <Button name="applyToAllBtn" onClick={applyToAll} value="default" disabled={btnDisabled}>
                {i18n.t("Apply to all")}
            </Button>
        </WidgetFeedback>
    );
};

export default React.memo(SourceTypeWidget);
