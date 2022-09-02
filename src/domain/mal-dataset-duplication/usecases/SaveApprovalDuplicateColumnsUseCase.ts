import { UseCase } from "../../../compositionRoot";
import { MALDataDuplicationRepository } from "../repositories/MALDataDuplicationRepository";

export class SaveApprovalAndDuplicateColumnsUseCase implements UseCase {
    constructor(private approvalRepository: MALDataDuplicationRepository) {}

    execute(columns: string[]): Promise<void> {
        return this.approvalRepository.saveColumns(columns);
    }
}
