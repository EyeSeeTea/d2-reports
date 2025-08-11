import { MonitoringFileResourcesRepository } from "../repositories/MonitoringFileResourcesRepository";

export class SaveMonitoringFileResourcesColumnsUseCase {
    constructor(private userInfoRepository: MonitoringFileResourcesRepository) {}

    execute(namespace: string, columns: string[]): Promise<void> {
        return this.userInfoRepository.saveColumns(namespace, columns);
    }
}
