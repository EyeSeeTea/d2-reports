import { UseCase } from "../../../../compositionRoot";
import { PaginatedObjects } from "../../../common/entities/PaginatedObjects";
import { AuditItem } from "../entities/AuditItem";
import { CSYAuditTraumaOptions, CSYAuditTraumaRepository } from "../repositories/CSYAuditTraumaRepository";

type AuditOptions = CSYAuditTraumaOptions;

export class GetAuditTraumaUseCase implements UseCase {
    constructor(private auditRepository: CSYAuditTraumaRepository) {}

    execute(options: AuditOptions): Promise<PaginatedObjects<AuditItem>> {
        // FUTURE: Return a Future-like instead, to allow better error handling and cancellation.
        return this.auditRepository.get(options);
    }
}
