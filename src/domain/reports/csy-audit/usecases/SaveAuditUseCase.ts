import { AuditItem } from "../entities/AuditItem";
import { CSYAuditRepository } from "../repositories/CSYAuditRepository";

export class SaveAuditUseCase {
    constructor(private auditRepository: CSYAuditRepository) {}

    async execute(filename: string, items: AuditItem[]): Promise<void> {
        this.auditRepository.save(filename, items);
    }
}
