import { UseCase } from "../../../../compositionRoot";
import { MALDataDuplicationRepository } from "../repositories/MALDataDuplicationRepository";

export class GetApprovalAndDuplicateColumnsUseCase implements UseCase {
    constructor(private approvalRepository: MALDataDuplicationRepository) {}

    execute(namespace: string): Promise<string[]> {
        return this.approvalRepository.getColumns(namespace);
    }
}
