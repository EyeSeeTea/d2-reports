import { UseCase } from "../../../../compositionRoot";
import { MonitoringValue } from "../entities/MalDataApprovalItem";
import { MalDataApprovalRepository } from "../repositories/MalDataApprovalRepository";

export class GetMonitoringUseCase implements UseCase {
    constructor(private approvalRepository: MalDataApprovalRepository) {}

    execute(namespace: string): Promise<MonitoringValue> {
        return this.approvalRepository.getMonitoring(namespace);
    }
}
