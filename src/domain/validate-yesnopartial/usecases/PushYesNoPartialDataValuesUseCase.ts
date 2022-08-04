import { DataValue } from "../../entities/DataValue";
import { NHWAYesNoPartialDataValuesRepository } from "../repositories/NHWAYesNoPartialDataValuesRepository";

export class PushYesNoPartialDataValuesUseCase {
    constructor(private dataValueRepository: NHWAYesNoPartialDataValuesRepository) {}

    async execute(dataValues: DataValue[], remove: boolean): Promise<void> {
        this.dataValueRepository.push(dataValues, remove);
    }
}
