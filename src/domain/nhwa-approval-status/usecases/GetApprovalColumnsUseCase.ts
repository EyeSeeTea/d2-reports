import { NHWADataApprovalRepository } from "../repositories/NHWADataApprovalRepository";

export class GetApprovalColumnsUseCase {
    constructor(private approvalRepository: NHWADataApprovalRepository) {}

    execute(): Promise<string[]> {
        return this.approvalRepository.getColumns();
    }
}
