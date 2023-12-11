import { UseCase } from "../../../../compositionRoot";
import { GLASSDataMaintenanceRepository } from "../repositories/GLASSDataMaintenanceRepository";

export class SaveGLASSDataMaintenanceColumnsUseCase implements UseCase {
    constructor(private maintenanceRepository: GLASSDataMaintenanceRepository) {}

    execute(namespace: string, columns: string[]): Promise<void> {
        return this.maintenanceRepository.saveColumns(namespace, columns);
    }
}
