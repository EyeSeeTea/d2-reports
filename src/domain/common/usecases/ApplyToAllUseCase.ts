import _ from "lodash";
import { DataValue, DataValueStore, DataValueTextMultiple } from "../entities/DataValue";
import { DataValueRepository, DataElementRefType } from "../repositories/DataValueRepository";

export class ApplyToAllUseCase {
    constructor(private dataValueRepository: DataValueRepository) {}

    async execute(
        store: DataValueStore,
        dataValue: DataValueTextMultiple,
        desToApply: DataElementRefType[]
    ): Promise<DataValueStore> {
        const existingDataValues = desToApply.flatMap(de => {
            const deToGet = { ...dataValue.dataElement, id: de.id };

            const dv = store.get(deToGet, dataValue) as DataValueTextMultiple;

            return dv ? dv : [];
        });

        const stToUpdate: DataValue[] = existingDataValues.flatMap(dv => {
            if (_.isEqual(dv.values, dataValue.values)) {
                return [];
            } else {
                return { ...dv, values: dataValue.values };
            }
        });

        if (_.isEmpty(stToUpdate)) {
            return store;
        } else {
            const stDEToUpdate = stToUpdate.map(dv => ({ id: dv.dataElement.id, name: dv.dataElement.name }));

            let _store = store;
            stToUpdate.forEach(dv => {
                _store = _store.set(dv);
            });

            const storeUpdated = _store.set(dataValue);

            await this.dataValueRepository.applyToAll(dataValue, stDEToUpdate);
            return storeUpdated;
        }
    }
}
