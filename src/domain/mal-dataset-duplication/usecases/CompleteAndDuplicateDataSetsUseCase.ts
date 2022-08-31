import { DataDuplicationItemIdentifier } from "../entities/DataDuplicationItem";
import { MALDataDuplicationRepository } from "../repositories/MALDataDuplicationRepository";

export class UpdateStatusAndDuplicateUseCase {
    constructor(private approvalRepository: MALDataDuplicationRepository) {}

    async execute(items: DataDuplicationItemIdentifier[], action: UpdateAction): Promise<boolean> {
        switch (action) {
            case "complete":
                return this.approvalRepository.complete(items);
            case "approve":
                return this.approvalRepository.approve(items);
            case "duplicate":
                return this.approvalRepository.duplicate(items);
            case "revoke":
                return this.approvalRepository.revoke(items);
            case "incomplete":
                return this.approvalRepository.incomplete(items);
            default:
                return false;
        }
    }
}

type UpdateAction = "complete" | "approve" | "duplicate" | "incomplete" | "revoke";
