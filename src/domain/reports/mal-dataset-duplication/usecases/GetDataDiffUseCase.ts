import { UseCase } from "../../../../compositionRoot";
import { PaginatedObjects } from "../../../common/entities/PaginatedObjects";
import { DataDiffItem } from "../entities/DataDiffItem";
import {
    MALDataDuplicationRepository,
    MALDataDuplicationRepositoryGetOptions,
} from "../repositories/MALDataDuplicationRepository";

type GetDataDiffUseCaseOptions = MALDataDuplicationRepositoryGetOptions;

export class GetDataDiffUseCase implements UseCase {
    constructor(private dataSetRepository: MALDataDuplicationRepository) {}

    execute(options: GetDataDiffUseCaseOptions): Promise<PaginatedObjects<DataDiffItem>> {
        // FUTURE: Return a Future-like instead, to allow better error handling and cancellation.
        return this.dataSetRepository.getDiff(options);
    }
}
