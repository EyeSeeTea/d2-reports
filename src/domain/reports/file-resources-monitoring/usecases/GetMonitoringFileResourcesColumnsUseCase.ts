import { MonitoringFileResourcesRepository } from "../repositories/MonitoringFileResourcesRepository";

export class GetMonitoringFileResourcesColumnsUseCase {
    constructor(private userInfoRepository: MonitoringFileResourcesRepository) {}

    execute(namespace: string): Promise<string[]> {
        return this.userInfoRepository.getColumns(namespace);
    }
}
