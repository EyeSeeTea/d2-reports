import { UseCase } from "../../../../compositionRoot";
import { Monitoring } from "../entities/MalDataApprovalItem";
import { MalDataApprovalRepository } from "../repositories/MalDataApprovalRepository";

export class SaveMonitoringUseCase implements UseCase {
    constructor(private approvalRepository: MalDataApprovalRepository) {}

    execute(namespace: string, monitoring: Monitoring[]): Promise<void> {
        return this.approvalRepository.saveMonitoring(namespace, monitoring);
    }
}
