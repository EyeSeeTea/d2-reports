import { MonitoringFileResourcesOptions } from "../entities/MonitoringFileResourcesOptions";
import { MonitoringFileResourcesPaginatedObjects } from "../entities/MonitoringFileResourcesPaginatedObjects";
import { MonitoringFileResourcesFile } from "../entities/MonitoringFileResourcesFile";
import { MonitoringFileResourcesRepository } from "../repositories/MonitoringFileResourcesRepository";

export class GetMonitoringFileResourcesUseCase {
    constructor(private monitoringFileResourcesRepository: MonitoringFileResourcesRepository) {}

    execute(
        options: MonitoringFileResourcesOptions
    ): Promise<MonitoringFileResourcesPaginatedObjects<MonitoringFileResourcesFile>> {
        return this.monitoringFileResourcesRepository.get(options);
    }
}
