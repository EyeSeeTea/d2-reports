import { AuditItem } from "../entities/AuditItem";
import { AuditItemRepository } from "../repositories/AuditRepository";

export class SaveAuditOperativeUseCase {
    constructor(private auditRepository: AuditItemRepository) {}

    async execute(filename: string, items: AuditItem[]): Promise<void> {
        this.auditRepository.save(filename, items);
    }
}
