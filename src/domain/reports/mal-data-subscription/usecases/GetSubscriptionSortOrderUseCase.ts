import { UseCase } from "../../../../compositionRoot";
import { MalDataSubscriptionRepository } from "../repositories/MalDataSubscriptionRepository";

export class GetSubscriptionSortOrderUseCase implements UseCase {
    constructor(private subscriptionRepository: MalDataSubscriptionRepository) {}

    execute(): Promise<string[]> {
        return this.subscriptionRepository.getSortOrder();
    }
}
