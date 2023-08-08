import { UseCase } from "../../../../compositionRoot";
import { PaginatedObjects } from "../../../common/entities/PaginatedObjects";
import { DataElementsSubscriptionItem } from "../entities/MalDataSubscriptionItem";
import {
    MalDataSubscriptionRepository,
    MalDataSubscriptionOptions,
} from "../repositories/MalDataSubscriptionRepository";

export class GetMalDataElementsSubscriptionUseCase implements UseCase {
    constructor(private subscriptionRepository: MalDataSubscriptionRepository) {}

    execute(options: MalDataSubscriptionOptions): Promise<PaginatedObjects<DataElementsSubscriptionItem>> {
        // FUTURE: Return a Future-like instead, to allow better error handling and cancellation.
        return this.subscriptionRepository.get(options);
    }
}
