import { UseCase } from "../../../../compositionRoot";
import { PaginatedObjects } from "../../../common/entities/PaginatedObjects";
import { DataDiffItem } from "../entities/DataDiffItem";
import {
    MalDataSubscriptionRepository,
    MalDataSubscriptionOptions,
} from "../repositories/MalDataSubscriptionRepository";

type GetDataDiffUseCaseOptions = MalDataSubscriptionOptions;

export class GetMalDataDiffUseCase implements UseCase {
    constructor(private dataSetRepository: MalDataSubscriptionRepository) {}

    execute(options: GetDataDiffUseCaseOptions): Promise<PaginatedObjects<DataDiffItem>> {
        // FUTURE: Return a Future-like instead, to allow better error handling and cancellation.
        return this.dataSetRepository.getDiff(options);
    }
}
