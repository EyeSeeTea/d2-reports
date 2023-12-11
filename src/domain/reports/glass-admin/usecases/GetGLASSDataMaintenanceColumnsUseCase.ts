import { UseCase } from "../../../../compositionRoot";
import { GLASSDataMaintenanceRepository } from "../repositories/GLASSDataMaintenanceRepository";

export class GetGLASSDataMaintenanceColumnsUseCase implements UseCase {
    constructor(private maintenanceRepository: GLASSDataMaintenanceRepository) {}

    execute(namespace: string): Promise<string[]> {
        return this.maintenanceRepository.getColumns(namespace);
    }
}
