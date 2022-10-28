import { UseCase } from "../../../../compositionRoot";
import { MalDataSubscriptionRepository } from "../repositories/MalDataSubscriptionRepository";

export class GetMalDataApprovalColumnsUseCase implements UseCase {
    constructor(private approvalRepository: MalDataSubscriptionRepository) {}

    execute(namespace: string): Promise<string[]> {
        return this.approvalRepository.getColumns(namespace);
    }
}
