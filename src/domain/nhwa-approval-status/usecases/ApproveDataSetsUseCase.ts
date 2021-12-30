import { DataApprovalItemIdentifier } from "../entities/DataApprovalItem";
import { NHWADataApprovalRepository } from "../repositories/NHWADataApprovalRepository";

export class ApproveDataSetsUseCase {
    constructor(private approvalRepository: NHWADataApprovalRepository) {}

    async execute(dataSets: DataApprovalItemIdentifier[]): Promise<boolean> {
        return this.approvalRepository.approve(dataSets);
    }
}
