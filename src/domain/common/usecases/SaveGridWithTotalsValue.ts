import _ from "lodash";
import { DataValueNumberSingle, DataValueStore } from "../entities/DataValue";
import { DataValueRepository } from "../repositories/DataValueRepository";
import { DataElement } from "../entities/DataElement";

export class SaveGridWithTotalsValueUseCase {
    constructor(private dataValueRepository: DataValueRepository) {}

    async execute(
        store: DataValueStore,
        dataValue: DataValueNumberSingle,
        total: DataElement,
        columnTotal: DataElement,
        rowDataElements: DataElement[],
        columnDataElements: DataElement[]
    ): Promise<DataValueStore> {
        const existingDataValue = store.get(dataValue.dataElement, dataValue);

        if (_.isEqual(existingDataValue, dataValue)) {
            return store;
        } else {
            // SAVE FIELD
            let storeUpdated = store.set(dataValue);
            await this.dataValueRepository.save(dataValue);

            // SAVE ROW TOTAL
            const selector = {
                orgUnitId: dataValue.orgUnitId,
                period: dataValue.period,
                categoryOptionComboId: dataValue.categoryOptionComboId,
            };

            const newRowTotalValue = rowDataElements
                .map(de => {
                    const dv = storeUpdated.get(de, {
                        ...selector,
                        categoryOptionComboId: de.cocId ?? de.categoryCombos.categoryOptionCombos[0]?.id ?? "",
                    }) as DataValueNumberSingle;
                    return dv.value ?? "0";
                })
                .reduce((partialSum, i) => partialSum + Number(i), 0);

            const totalDataValue = storeUpdated.get(total, {
                ...selector,
                categoryOptionComboId: total.cocId ?? total.categoryCombos.categoryOptionCombos[0]?.id ?? "",
            }) as DataValueNumberSingle;

            totalDataValue.value = newRowTotalValue.toString();

            storeUpdated = storeUpdated.set(totalDataValue);
            await this.dataValueRepository.save(totalDataValue);

            // SAVE COLUMN TOTAL
            const newColTotalValue = columnDataElements
                .map(de => {
                    const dv = storeUpdated.get(de, {
                        ...selector,
                        categoryOptionComboId: dataValue.categoryOptionComboId,
                    }) as DataValueNumberSingle;
                    return dv.value ?? "0";
                })
                .reduce((partialSum, i) => partialSum + Number(i), 0);

            const colTotalDataValue = storeUpdated.get(columnTotal, {
                ...selector,
                categoryOptionComboId: dataValue.categoryOptionComboId,
            }) as DataValueNumberSingle;

            colTotalDataValue.value = newColTotalValue.toString();

            storeUpdated = storeUpdated.set(colTotalDataValue);
            await this.dataValueRepository.save(colTotalDataValue);

            return storeUpdated;
        }
    }
}
