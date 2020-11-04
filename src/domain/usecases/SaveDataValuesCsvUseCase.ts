import { DataValue } from "../entities/DataValue";
import { DataValueRepository } from "../repositories/DataValueRepository";

export class SaveDataValuesUseCase {
    constructor(private dataValueRepository: DataValueRepository) {}

    async execute(filename: string, dataValues: DataValue[]): Promise<void> {
        this.dataValueRepository.save(filename, dataValues);
    }
}
