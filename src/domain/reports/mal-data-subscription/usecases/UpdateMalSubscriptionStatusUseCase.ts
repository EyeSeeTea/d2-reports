import { MalDataSubscriptionItemIdentifier } from "../entities/MalDataSubscriptionItem";
import { MalDataSubscriptionRepository } from "../repositories/MalDataSubscriptionRepository";

export class UpdateMalSubscriptionStatusUseCase {
    constructor(private approvalRepository: MalDataSubscriptionRepository) {}

    async execute(items: MalDataSubscriptionItemIdentifier[], action: UpdateAction): Promise<boolean> {
        switch (action) {
            default:
                return false;
        }
    }
}

type UpdateAction = "complete" | "approve" | "duplicate";
