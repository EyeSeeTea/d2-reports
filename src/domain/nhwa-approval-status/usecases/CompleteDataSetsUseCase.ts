import { DataApprovalItem } from "../entities/DataApprovalItem";
import { NHWADataApprovalRepository } from "../repositories/NHWADataApprovalRepository";

export class CompleteDataSetsUseCase {
    constructor(private dataSetRepository: NHWADataApprovalRepository) {}

    async execute(dataSets: DataApprovalItem[]): Promise<void> {
        this.dataSetRepository.complete(dataSets);
    }
}
