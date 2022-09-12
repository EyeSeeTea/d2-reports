import { UseCase } from "../../../../compositionRoot";
import { MALDataDuplicationRepository } from "../repositories/MALDataDuplicationRepository";

export class SaveApprovalAndDuplicateColumnsUseCase implements UseCase {
    constructor(private approvalRepository: MALDataDuplicationRepository) {}

    execute(namespace: string, columns: string[]): Promise<void> {
        return this.approvalRepository.saveColumns(namespace, columns);
    }
}
