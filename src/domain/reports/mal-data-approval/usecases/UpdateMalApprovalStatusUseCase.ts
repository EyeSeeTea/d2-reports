import { Namespaces } from "../../../../data/common/clients/storage/Namespaces";
import { MalDataApprovalItemIdentifier, MonitoringValue } from "../entities/MalDataApprovalItem";
import { MalDataApprovalRepository } from "../repositories/MalDataApprovalRepository";

export class UpdateMalApprovalStatusUseCase {
    constructor(private approvalRepository: MalDataApprovalRepository) {}

    async execute(
        items: MalDataApprovalItemIdentifier[],
        action: UpdateAction,
        monitoring?: MonitoringValue
    ): Promise<boolean | MonitoringValue | void> {
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
            case "activate":
                return this.approvalRepository.getMonitoring(Namespaces.MONITORING);
            case "deactivate":
                return this.approvalRepository.saveMonitoring(Namespaces.MONITORING, monitoring ?? {});
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
