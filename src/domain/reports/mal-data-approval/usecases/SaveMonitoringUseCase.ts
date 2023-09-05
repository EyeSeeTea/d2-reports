import { UseCase } from "../../../../compositionRoot";
import { MonitoringValue } from "../entities/MalDataApprovalItem";
import { MalDataApprovalRepository } from "../repositories/MalDataApprovalRepository";

export class SaveMonitoringUseCase implements UseCase {
    constructor(private approvalRepository: MalDataApprovalRepository) {}

    execute(namespace: string, monitoring: MonitoringValue): Promise<void> {
        return this.approvalRepository.saveMonitoring(namespace, monitoring);
    }
}
