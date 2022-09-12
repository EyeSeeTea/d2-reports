import { UseCase } from "../../../compositionRoot";
import { MALDataDuplicationRepository } from "../repositories/MALDataDuplicationRepository";

export class GenerateSortOrderUseCase implements UseCase {
    constructor(private approvalRepository: MALDataDuplicationRepository) { }

    execute(): Promise<void> {
        return this.approvalRepository.generateSortOrder();
    }
}