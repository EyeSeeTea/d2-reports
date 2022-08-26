import { UseCase } from "../../../compositionRoot";
import { PaginatedObjects } from "../../common/entities/PaginatedObjects";
import { DataDuplicationItem } from "../entities/DataDuplicationItem";
import {
    MALDataDuplicationRepository,
    MALDataDuplicationRepositoryGetOptions,
} from "../repositories/MALDataDuplicationRepository";

type GetDataSetsUseCaseOptions = MALDataDuplicationRepositoryGetOptions;

export class GetDataSetsUseCase implements UseCase {
    constructor(private dataSetRepository: MALDataDuplicationRepository) { }

    execute(options: GetDataSetsUseCaseOptions): Promise<PaginatedObjects<DataDuplicationItem>> {
        // FUTURE: Return a Future-like instead, to allow better error handling and cancellation.
        return this.dataSetRepository.get(options);
    }
}
