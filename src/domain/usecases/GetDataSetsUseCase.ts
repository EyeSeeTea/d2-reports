import { DataSetRepository, DataSetRepositoryGetOptions } from "../repositories/DataSetRepository";
import { DataSet } from "../entities/DataSet";
import { PaginatedObjects } from "../entities/PaginatedObjects";

type GetDataSetsUseCaseOptions = DataSetRepositoryGetOptions;

export class GetDataSetsUseCase {
    constructor(private dataSetRepository: DataSetRepository) {}

    execute(options: GetDataSetsUseCaseOptions): Promise<PaginatedObjects<DataSet>> {
        // FUTURE: Return a Future-like instead, to allow better error handling and cancellation.
        return this.dataSetRepository.get(options);
    }
}
