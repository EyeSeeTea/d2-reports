import { DataApprovalItem } from "../../nhwa-approval-status/entities/DataApprovalItem";
import { NHWADataApprovalRepository } from "../../nhwa-approval-status/repositories/NHWADataApprovalRepository";

export class SaveDataSetsUseCase {
    constructor(private dataSetRepository: NHWADataApprovalRepository) {}

    async execute(filename: string, dataSets: DataApprovalItem[]): Promise<void> {
        this.dataSetRepository.save(filename, dataSets);
    }
}
