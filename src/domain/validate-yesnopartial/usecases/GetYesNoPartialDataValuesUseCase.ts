import { Config } from "../../common/entities/Config";
import { PaginatedObjects } from "../../common/entities/PaginatedObjects";
import { DataValueItem } from "../entities/DataValueItem";
import { NHWAYesNoPartialDataValuesRepository } from "../repositories/NHWAYesNoPartialDataValuesRepository";

export class GetYesNoPartialDataValuesUseCase {
    constructor(private dataValueRepository: NHWAYesNoPartialDataValuesRepository) {}

    execute(config: Config): Promise<PaginatedObjects<DataValueItem>> {
        // FUTURE: Return a Future-like instead, to allow better error handling and cancellation.
        return this.dataValueRepository.get(config);
    }
}
