import { UseCase } from "../../../../compositionRoot";
import { Monitoring } from "../entities/MalDataSubscriptionItem";
import { MalDataSubscriptionRepository } from "../repositories/MalDataSubscriptionRepository";

export class GetMonitoringUseCase implements UseCase {
    constructor(private approvalRepository: MalDataSubscriptionRepository) {}

    execute(namespace: string): Promise<Monitoring[]> {
        return this.approvalRepository.getMonitoring(namespace);
    }
}
