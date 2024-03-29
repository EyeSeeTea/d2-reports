import { ATCItemIdentifier } from "../entities/GLASSDataMaintenanceItem";
import { GLASSDataMaintenanceRepository } from "../repositories/GLASSDataMaintenanceRepository";

export class UploadATCFileUseCase {
    constructor(private maintenanceRepository: GLASSDataMaintenanceRepository) {}

    execute(namespace: string, file: File, year: string, selectedItems?: ATCItemIdentifier[]): Promise<void> {
        return this.maintenanceRepository.uploadATC(namespace, file, year, selectedItems);
    }
}
