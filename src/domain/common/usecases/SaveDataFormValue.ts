import _ from "lodash";
import { DataValue, DataValueStore } from "../entities/DataValue";
import { DataValueRepository } from "../repositories/DataValueRepository";

export class SaveDataFormValueUseCase {
    constructor(private dataValueRepository: DataValueRepository) {}

    async execute(store: DataValueStore, dataValue: DataValue): Promise<DataValueStore> {
        const existingDataValue = store.get(dataValue.dataElement, dataValue);
        if (_.isEqual(existingDataValue, dataValue) && dataValue.type !== "FILE") {
            return store;
        } else {
            let storeUpdated = store.set({
                ...dataValue,
                categoryOptionComboId: dataValue.dataElement.cocId || dataValue.categoryOptionComboId,
            });
            const dataValueWithUpdate = await this.dataValueRepository.save(dataValue);
            if (dataValueWithUpdate.type === "FILE") {
                storeUpdated = store.set({
                    ...dataValueWithUpdate,
                    categoryOptionComboId: dataValue.dataElement.cocId || dataValue.categoryOptionComboId,
                });
            }
            return storeUpdated;
        }
    }
}
