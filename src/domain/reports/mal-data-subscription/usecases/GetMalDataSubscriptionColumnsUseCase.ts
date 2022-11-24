import { UseCase } from "../../../../compositionRoot";
import { MalDataSubscriptionRepository } from "../repositories/MalDataSubscriptionRepository";

export class GetMalDataSubscriptionColumnsUseCase implements UseCase {
    constructor(private approvalRepository: MalDataSubscriptionRepository) {}

    execute(namespace: string): Promise<string[]> {
        return this.approvalRepository.getColumns(namespace);
    }
}
