import { DataApprovalItem } from "../entities/DataApprovalItem";
import { NHWADataApprovalRepository } from "../repositories/NHWADataApprovalRepository";

export class ApproveDataSetsUseCase {
    constructor(private dataSetRepository: NHWADataApprovalRepository) {}

    async execute(dataSets: DataApprovalItem[]): Promise<boolean> {
        return this.dataSetRepository.approve(dataSets);
    }
}
