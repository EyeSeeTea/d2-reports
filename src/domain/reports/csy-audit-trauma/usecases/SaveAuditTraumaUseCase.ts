import { AuditItem } from "../entities/AuditItem";
import { CSYAuditTraumaRepository } from "../repositories/CSYAuditTraumaRepository";

export class SaveAuditTraumaUseCase {
    constructor(private auditRepository: CSYAuditTraumaRepository) {}

    async execute(filename: string, items: AuditItem[]): Promise<void> {
        this.auditRepository.save(filename, items);
    }
}
