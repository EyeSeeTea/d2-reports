import { UseCase } from "../../../../compositionRoot";
import { DataDiffItemIdentifier } from "../entities/DataDiffItem";
import { MalDataApprovalRepository } from "../repositories/MalDataApprovalRepository";

export class DuplicateDataValuesUseCase implements UseCase {
    constructor(private approvalRepository: MalDataApprovalRepository) {}

    async execute(items: DataDiffItemIdentifier[], revoke?: boolean): Promise<boolean> {
        if (revoke) {
            return this.approvalRepository.duplicateDataValuesAndRevoke(items);
        } else {
            return this.approvalRepository.duplicateDataValues(items);
        }
    }
}
