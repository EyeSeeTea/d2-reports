import { UseCase } from "../../../../compositionRoot";
import { GLASSDataMaintenanceItem, GLASSMaintenancePaginatedObjects } from "../entities/GLASSDataMaintenanceItem";
import {
    GLASSDataMaintenanceOptions,
    GLASSDataMaintenanceRepository,
} from "../repositories/GLASSDataMaintenanceRepository";

export class GetGLASSDataMaintenanceUseCase implements UseCase {
    constructor(private maintenanceRepository: GLASSDataMaintenanceRepository) {}

    execute(
        options: GLASSDataMaintenanceOptions,
        namespace: string
    ): Promise<GLASSMaintenancePaginatedObjects<GLASSDataMaintenanceItem>> {
        return this.maintenanceRepository.get(options, namespace);
    }
}
