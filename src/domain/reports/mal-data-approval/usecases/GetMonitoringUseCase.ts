import { UseCase } from "../../../../compositionRoot";
import { Monitoring } from "../entities/MalDataApprovalItem";
import { MalDataApprovalRepository } from "../repositories/MalDataApprovalRepository";

export class GetMonitoringUseCase implements UseCase {
    constructor(private approvalRepository: MalDataApprovalRepository) {}

    execute(namespace: string): Promise<Monitoring[]> {
        return this.approvalRepository.getMonitoring(namespace);
    }
}
