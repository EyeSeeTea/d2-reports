import { NHWADataApprovalRepository } from "../repositories/NHWADataApprovalRepository";

export class SaveApprovalColumnsUseCase {
    constructor(private approvalRepository: NHWADataApprovalRepository) {}

    execute(columns: string[]): Promise<void> {
        return this.approvalRepository.saveColumns(columns);
    }
}
