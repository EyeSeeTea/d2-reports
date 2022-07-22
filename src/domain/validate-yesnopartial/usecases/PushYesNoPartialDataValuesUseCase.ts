import { DataValue } from "../../entities/DataValue";
import { DataValueRepository } from "../repositories/DataValueRepository";

export class PushYesNoPartialDataValuesUseCase {
    constructor(private dataValueRepository: DataValueRepository) {}

    async execute(dataValues: DataValue[], remove: boolean): Promise<void> {
        this.dataValueRepository.push(dataValues, remove);
    }
}
