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
        columnDataElements: DataElement[],
        cocId: string
    ): Promise<DataValueStore> {
        const existingDataValue = store.get(dataValue.dataElement, dataValue);

        if (_.isEqual(existingDataValue, dataValue)) {
            return store;
        } else {
            // SAVE FIELD
            const currentDataValue = {
                ...dataValue,
                categoryOptionComboId: cocId,
            };
            let storeUpdated = store.set(currentDataValue);
            // await this.dataValueRepository.save(dataValue);

            // SAVE ROW TOTAL
            const selector = {
                orgUnitId: dataValue.orgUnitId,
                period: dataValue.period,
                categoryOptionComboId: dataValue.categoryOptionComboId,
            };

            // SAVE COLUMN TOTAL
            const newColTotalValue = columnDataElements
                .map(de => {
                    const dv = storeUpdated.get(
                        {
                            ...de,
                            cocId,
                        },
                        {
                            ...selector,
                            categoryOptionComboId: dataValue.categoryOptionComboId,
                        }
                    ) as DataValueNumberSingle;
                    const isCurrentDataElement = dataValue.dataElement.id === dv.dataElement.id;
                    const value = isCurrentDataElement ? dataValue.value : dv.value ?? "0";
                    return value;
                })
                .reduce((partialSum, i) => partialSum + Number(i), 0);

            const colTotalDataValue = storeUpdated.get(
                {
                    ...columnTotal,
                    cocId,
                },
                {
                    ...selector,
                    categoryOptionComboId: cocId || dataValue.categoryOptionComboId,
                }
            ) as DataValueNumberSingle;

            colTotalDataValue.value = newColTotalValue.toString();

            storeUpdated = storeUpdated.set(colTotalDataValue);
            await Promise.all([
                this.dataValueRepository.save(dataValue),
                this.dataValueRepository.save(colTotalDataValue),
            ]);

            return storeUpdated;
        }
    }
}
