import _ from "lodash";
import { DataValue, DataValueStore } from "../entities/DataValue";
import { DataValueRepository } from "../repositories/DataValueRepository";

export class SaveDataFormValueUseCase {
    constructor(private dataValueRepository: DataValueRepository) {}

    async execute(store: DataValueStore, dataValue: DataValue): Promise<DataValueStore> {
        const existingDataValue = store.get(dataValue.dataElement, dataValue);

        if (_.isEqual(existingDataValue, dataValue)) {
            return store;
        } else {
            const storeUpdated = store.set(dataValue);
            await this.dataValueRepository.save(dataValue);
            return storeUpdated;
        }
    }
}
