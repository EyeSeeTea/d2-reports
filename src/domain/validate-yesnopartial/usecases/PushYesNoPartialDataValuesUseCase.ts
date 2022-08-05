import { DataValueItemIdentifier } from "../entities/DataValueItem";
import { NHWAYesNoPartialDataValuesRepository } from "../repositories/NHWAYesNoPartialDataValuesRepository";

export class PushYesNoPartialDataValuesUseCase {
    constructor(private dataValueRepository: NHWAYesNoPartialDataValuesRepository) {}

    async execute(dataValues: DataValueItemIdentifier[], option: string): Promise<boolean> {
        return this.dataValueRepository.push(dataValues, option);
    }
}
