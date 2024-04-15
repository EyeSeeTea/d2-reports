import { UseCase } from "../../../../compositionRoot";
import { PaginatedObjects } from "../../../common/entities/PaginatedObjects";
import { AuditItem } from "../entities/AuditItem";
import { CSYAuditEmergencyOptions, AuditItemRepository } from "../repositories/AuditRepository";

type AuditOptions = CSYAuditEmergencyOptions;

export class GetAuditEmergencyUseCase implements UseCase {
    constructor(private auditRepository: AuditItemRepository) {}

    execute(options: AuditOptions): Promise<PaginatedObjects<AuditItem>> {
        // FUTURE: Return a Future-like instead, to allow better error handling and cancellation.
        return this.auditRepository.get(options);
    }
}
