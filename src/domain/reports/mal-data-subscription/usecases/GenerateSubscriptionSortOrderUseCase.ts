import { UseCase } from "../../../../compositionRoot";
import { MalDataSubscriptionRepository } from "../repositories/MalDataSubscriptionRepository";

export class GenerateSubscriptionSortOrderUseCase implements UseCase {
    constructor(private subscriptionRepository: MalDataSubscriptionRepository) {}

    execute(): Promise<void> {
        return this.subscriptionRepository.generateSortOrder();
    }
}
