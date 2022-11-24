import { UseCase } from "../../../../compositionRoot";
import { MalDataSubscriptionRepository } from "../repositories/MalDataSubscriptionRepository";

export class GenerateSubscriptionSortOrderUseCase implements UseCase {
    constructor(private approvalRepository: MalDataSubscriptionRepository) {}

    execute(): Promise<void> {
        return this.approvalRepository.generateSortOrder();
    }
}
