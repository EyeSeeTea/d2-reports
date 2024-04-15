import { UseCase } from "../../../../compositionRoot";
import { PaginatedObjects } from "../../../common/entities/PaginatedObjects";
import { AuditItem } from "../entities/AuditItem";
import { AuditOptions, AuditItemRepository } from "../repositories/AuditItemRepository";

type AuditOptions = AuditOptions;

export class GetAuditTraumaUseCase implements UseCase {
    constructor(private auditRepository: AuditItemRepository) {}

    execute(options: AuditOptions): Promise<PaginatedObjects<AuditItem>> {
        // FUTURE: Return a Future-like instead, to allow better error handling and cancellation.
        return this.auditRepository.get(options);
    }
}
