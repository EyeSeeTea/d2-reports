import {
    DataValueRepository,
    DataValueRepositoryGetOptions,
} from "../repositories/DataValueRepository";
import { DataValue } from "../entities/DataValue";
import { PaginatedObjects } from "../entities/PaginatedObjects";

type GetDataValuesUseCaseOptions = DataValueRepositoryGetOptions;

export class GetDataValuesUseCase {
    constructor(private dataValueRepository: DataValueRepository) {}

    execute(options: GetDataValuesUseCaseOptions): Promise<PaginatedObjects<DataValue>> {
        // FUTURE: Return a Future-like instead, to allow better error handling and cancellation.
        return this.dataValueRepository.get(options);
    }
}
