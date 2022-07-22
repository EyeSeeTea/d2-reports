
import { PaginatedObjects } from "../../common/entities/PaginatedObjects";
import { DataValue } from "../../entities/DataValue";
import { DataValueRepository } from "../repositories/DataValueRepository";

export class GetYesNoPartialDataValuesUseCase {
    constructor(private dataValueRepository: DataValueRepository) {}

    execute(): Promise<PaginatedObjects<DataValue>> {
        // FUTURE: Return a Future-like instead, to allow better error handling and cancellation.
        return this.dataValueRepository.get();
    }
}
