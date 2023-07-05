import { UseCase } from "../../../../compositionRoot";
import { PaginatedObjects } from "../../../common/entities/PaginatedObjects";
import { AuditItem } from "../entities/AuditItem";
import { CSYAuditOptions, CSYAuditRepository } from "../repositories/CSYAuditRepository";

type AuditOptions = CSYAuditOptions;

export class GetAuditUseCase implements UseCase {
    constructor(private auditRepository: CSYAuditRepository) {}

    execute(options: AuditOptions): Promise<PaginatedObjects<AuditItem>> {
        // FUTURE: Return a Future-like instead, to allow better error handling and cancellation.
        return this.auditRepository.get(options);
    }
}
