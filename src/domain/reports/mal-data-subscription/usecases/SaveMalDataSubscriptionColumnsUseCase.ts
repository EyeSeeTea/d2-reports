import { UseCase } from "../../../../compositionRoot";
import { MalDataSubscriptionRepository } from "../repositories/MalDataSubscriptionRepository";

export class SaveMalDataSubscriptionColumnsUseCase implements UseCase {
    constructor(private approvalRepository: MalDataSubscriptionRepository) {}

    execute(namespace: string, columns: string[]): Promise<void> {
        return this.approvalRepository.saveColumns(namespace, columns);
    }
}
