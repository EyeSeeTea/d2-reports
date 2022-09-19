import { UseCase } from "../../../../compositionRoot";
import { DataDiffItemIdentifier } from "../entities/DataDiffItem";
import { MalDataApprovalRepository } from "../repositories/MalDataApprovalRepository";

export class DuplicateDataValuesUseCase implements UseCase {
    constructor(private approvalRepository: MalDataApprovalRepository) { }

    async execute(items: DataDiffItemIdentifier[]): Promise<boolean> {
        return this.approvalRepository.duplicateDataValues(items);
    }
}
