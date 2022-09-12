import { UseCase } from "../../../compositionRoot";
import { MALDataDuplicationRepository } from "../repositories/MALDataDuplicationRepository";

export class GetSortOrderUseCase implements UseCase {
    constructor(private approvalRepository: MALDataDuplicationRepository) { }

    execute(): Promise<string[]> {
        return this.approvalRepository.getSortOrder();
    }
}