import { UseCase } from "../../../../compositionRoot";
import { MonitoringFileResourcesRepository } from "../repositories/MonitoringFileResourcesRepository";

export class DeleteMonitoringDocumentsUseCase implements UseCase {
    constructor(private monitoringRepository: MonitoringFileResourcesRepository) {}

    execute(ids: string[]): Promise<void> {
        return this.monitoringRepository.delete(ids);
    }
}
