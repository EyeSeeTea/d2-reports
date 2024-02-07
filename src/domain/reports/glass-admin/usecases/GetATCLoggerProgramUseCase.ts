import { GLASSDataMaintenanceRepository } from "../repositories/GLASSDataMaintenanceRepository";

export class GetATCLoggerProgramUseCase {
    constructor(private maintenanceRepository: GLASSDataMaintenanceRepository) {}

    execute(programId: string): Promise<string> {
        return this.maintenanceRepository.getLoggerProgramName(programId);
    }
}
