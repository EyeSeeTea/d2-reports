import { UseCase } from "../../../../compositionRoot";
import { MonitoringFileResourcesFile } from "../entities/MonitoringFileResourcesFile";
import { MonitoringFileResourcesRepository } from "../repositories/MonitoringFileResourcesRepository";

export class SaveMonitoringFileResourcesUseCase implements UseCase {
    constructor(private monitoringRepository: MonitoringFileResourcesRepository) {}

    execute(fileName: string, items: MonitoringFileResourcesFile[]): Promise<void> {
        return this.monitoringRepository.save(fileName, items);
    }
}
