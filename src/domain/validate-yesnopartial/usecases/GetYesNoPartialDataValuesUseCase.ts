import { Config } from "../../common/entities/Config";
import { PaginatedObjects } from "../../common/entities/PaginatedObjects";
import { DataValue } from "../../entities/DataValue";
import { DataValueItem } from "../entities/DataValueItem";
import { DataValueRepository } from "../repositories/DataValueRepository";

export class GetYesNoPartialDataValuesUseCase {
    constructor(private dataValueRepository: DataValueRepository) {}

    execute(config: Config): Promise<PaginatedObjects<Array<DataValueItem>>> {
        // FUTURE: Return a Future-like instead, to allow better error handling and cancellation.
        return this.dataValueRepository.get(config);
    }
}
