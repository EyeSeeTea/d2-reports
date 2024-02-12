import { GLASSDataMaintenanceRepository } from "../repositories/GLASSDataMaintenanceRepository";

export class GetATCLoggerProgramUseCase {
    constructor(private maintenanceRepository: GLASSDataMaintenanceRepository) {}

    async execute(namespace: string): Promise<string> {
        const amcRecalculation = await this.maintenanceRepository.getRecalculationLogic(namespace);

        return this.maintenanceRepository.getLoggerProgramName(amcRecalculation?.loggerProgram ?? "");
    }
}
