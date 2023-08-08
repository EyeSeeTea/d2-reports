import { UseCase } from "../../../../compositionRoot";
import { PaginatedObjects } from "../../../common/entities/PaginatedObjects";
import { MalDataSubscriptionItem } from "../entities/MalDataSubscriptionItem";
import {
    MalDataSubscriptionRepository,
    MalDataSubscriptionOptions,
} from "../repositories/MalDataSubscriptionRepository";

type DataSetsOptions = MalDataSubscriptionOptions;

export class GetMalSubscriptionDataSetsUseCase implements UseCase {
    constructor(private subscriptionRepository: MalDataSubscriptionRepository) {}

    execute(options: DataSetsOptions): Promise<PaginatedObjects<MalDataSubscriptionItem>> {
        // FUTURE: Return a Future-like instead, to allow better error handling and cancellation.
        return this.subscriptionRepository.get(options);
    }
}
