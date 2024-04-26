import { PaginatedObjects } from "../../../common/entities/PaginatedObjects";
import { MonitoringTwoFactorOptions } from "../entities/MonitoringTwoFactorOptions";
import { MonitoringTwoFactorUser } from "../entities/MonitoringTwoFactorUser";
import { MonitoringTwoFactorRepository } from "../repositories/MonitoringTwoFactorRepository";

export class RunMonitoringTwoFactorUseCase {
    constructor(private monitoringTwoFactorRepository: MonitoringTwoFactorRepository) {}

    execute(namespace: string, options: MonitoringTwoFactorOptions): Promise<MonitoringTwoFactorUser[]> {
        return this.monitoringTwoFactorRepository.get(namespace, options);
    }
}
