import { UseCase } from "../../../../compositionRoot";
import { DataDiffItemIdentifier } from "../entities/DataDiffItem";
import { MalDataApprovalRepository } from "../repositories/MalDataApprovalRepository";

export class DuplicateDataValuesUseCase implements UseCase {
    constructor(private approvalRepository: MalDataApprovalRepository) {}

    async execute(items: DataDiffItemIdentifier[]): Promise<boolean> {
        const stats = await this.approvalRepository.replicateDataValuesInApvdDataSet(items);
        return stats.filter(stat => stat.errorMessages.length > 0).length === 0;
    }
}
