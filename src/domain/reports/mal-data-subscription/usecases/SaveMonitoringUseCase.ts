import { UseCase } from "../../../../compositionRoot";
import { Monitoring } from "../entities/MalDataSubscriptionItem";
import { MalDataSubscriptionRepository } from "../repositories/MalDataSubscriptionRepository";

export class SaveMonitoringUseCase implements UseCase {
    constructor(private approvalRepository: MalDataSubscriptionRepository) {}

    execute(namespace: string, monitoring: Monitoring[]): Promise<void> {
        return this.approvalRepository.saveMonitoring(namespace, monitoring);
    }
}
