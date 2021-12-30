import { DataApprovalItem } from "../entities/DataApprovalItem";
import { NHWADataApprovalRepository } from "../repositories/NHWADataApprovalRepository";

export class ApproveDataSetsUseCase {
    constructor(private approvalRepository: NHWADataApprovalRepository) {}

    async execute(dataSets: DataApprovalItem[]): Promise<boolean> {
        return this.approvalRepository.approve(dataSets);
    }
}
