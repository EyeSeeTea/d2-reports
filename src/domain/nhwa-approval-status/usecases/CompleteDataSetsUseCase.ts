import { DataApprovalItem } from "../entities/DataApprovalItem";
import { NHWADataApprovalRepository } from "../repositories/NHWADataApprovalRepository";

export class CompleteDataSetsUseCase {
    constructor(private approvalRepository: NHWADataApprovalRepository) {}

    async execute(dataSets: DataApprovalItem[]): Promise<boolean> {
        return this.approvalRepository.complete(dataSets);
    }
}
