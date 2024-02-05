import { GLASSDataMaintenanceRepository } from "../repositories/GLASSDataMaintenanceRepository";

export class SaveAMCRecalculationLogic {
    constructor(private maintenanceRepository: GLASSDataMaintenanceRepository) {}

    execute(namespace: string, atcNamespace: string): Promise<void> {
        return this.maintenanceRepository.saveRecalculationLogic(namespace, atcNamespace);
    }
}
