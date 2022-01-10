import { DataApprovalItemIdentifier } from "../entities/DataApprovalItem";
import { NHWADataApprovalRepository } from "../repositories/NHWADataApprovalRepository";

export class CompleteDataSetsUseCase {
    constructor(private approvalRepository: NHWADataApprovalRepository) {}

    async execute(dataSets: DataApprovalItemIdentifier[]): Promise<boolean> {
        return this.approvalRepository.complete(dataSets);
    }
}
