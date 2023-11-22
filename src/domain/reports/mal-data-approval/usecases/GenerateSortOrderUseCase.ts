import { UseCase } from "../../../../compositionRoot";
import { MalDataApprovalRepository } from "../repositories/MalDataApprovalRepository";

export class GenerateSortOrderUseCase implements UseCase {
    constructor(private approvalRepository: MalDataApprovalRepository) {}

    execute(): Promise<void> {
        return this.approvalRepository.generateSortOrder();
    }
}
