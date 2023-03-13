import { DataValue } from "../entities/DataValue";
import { DataValueRepository } from "../repositories/DataValueRepository";

export class SaveDataFormValueUseCase {
    constructor(private dataValueRepository: DataValueRepository) {}

    execute(dataValue: DataValue): Promise<DataValue> {
        return this.dataValueRepository.save(dataValue);
    }
}
