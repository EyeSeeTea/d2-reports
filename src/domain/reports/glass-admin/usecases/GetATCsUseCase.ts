import { PaginatedObjects } from "../../../common/entities/PaginatedObjects";
import { ATCItem } from "../entities/GLASSDataMaintenanceItem";
import { ATCOptions, GLASSDataMaintenanceRepository } from "../repositories/GLASSDataMaintenanceRepository";

export class GetATCsUseCase {
    constructor(private maintenanceRepository: GLASSDataMaintenanceRepository) {}

    execute(options: ATCOptions, namespace: string): Promise<PaginatedObjects<ATCItem>> {
        return this.maintenanceRepository.getATCs(options, namespace);
    }
}
