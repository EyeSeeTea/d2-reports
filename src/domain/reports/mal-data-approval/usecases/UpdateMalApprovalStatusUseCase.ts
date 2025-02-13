import { MalDataApprovalItemIdentifier } from "../entities/MalDataApprovalItem";
import { MalDataApprovalRepository } from "../repositories/MalDataApprovalRepository";

export class UpdateMalApprovalStatusUseCase {
    constructor(private approvalRepository: MalDataApprovalRepository) {}

    async execute(items: MalDataApprovalItemIdentifier[], action: UpdateAction): Promise<boolean> {
        switch (action) {
            case "complete":
                return this.approvalRepository.complete(items);
            case "approve":
                return this.approvalRepository.approve(items);
            case "duplicate":
                return this.approvalRepository.duplicateDataSets(items);
            case "revoke":
                return this.approvalRepository.unapprove(items);
            case "incomplete":
                return this.approvalRepository.incomplete(items);
            default:
                return false;
        }
    }
}

type UpdateAction =
    | "complete"
    | "approve"
    | "duplicate"
    | "incomplete"
    | "unapprove"
    | "activate"
    | "deactivate"
    | "revoke";
