import { UseCase } from "../../../../compositionRoot";
import { MalDataSubscriptionRepository } from "../repositories/MalDataSubscriptionRepository";

export class GetSubscriptionSortOrderUseCase implements UseCase {
    constructor(private approvalRepository: MalDataSubscriptionRepository) {}

    execute(): Promise<string[]> {
        return this.approvalRepository.getSortOrder();
    }
}
