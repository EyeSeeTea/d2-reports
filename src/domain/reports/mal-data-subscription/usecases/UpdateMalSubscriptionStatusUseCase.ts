import { MalDataSubscriptionItemIdentifier } from "../entities/MalDataSubscriptionItem";
import { MalDataSubscriptionRepository } from "../repositories/MalDataSubscriptionRepository";

export class UpdateMalSubscriptionStatusUseCase {
    constructor(private approvalRepository: MalDataSubscriptionRepository) {}

    async execute(items: MalDataSubscriptionItemIdentifier[], action: UpdateAction): Promise<boolean> {
        switch (action) {
            case "complete":
                return this.approvalRepository.complete(items);
            default:
                return false;
        }
    }
}

type UpdateAction = "complete" | "approve" | "duplicate";
