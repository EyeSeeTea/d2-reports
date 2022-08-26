import { UseCase } from "../../../compositionRoot";
import { MALDataDuplicationRepository } from "../repositories/MALDataDuplicationRepository";

export class GetApprovalColumnsUseCase implements UseCase {
    constructor(private approvalRepository: MALDataDuplicationRepository) { }

    execute(): Promise<string[]> {
        return this.approvalRepository.getColumns();
    }
}
