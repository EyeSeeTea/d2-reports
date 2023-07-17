import { AuditItem } from "../entities/AuditItem";
import { CSYAuditEmergencyRepository } from "../repositories/CSYAuditEmergencyRepository";

export class SaveAuditEmergencyUseCase {
    constructor(private auditRepository: CSYAuditEmergencyRepository) {}

    async execute(filename: string, items: AuditItem[]): Promise<void> {
        this.auditRepository.save(filename, items);
    }
}
