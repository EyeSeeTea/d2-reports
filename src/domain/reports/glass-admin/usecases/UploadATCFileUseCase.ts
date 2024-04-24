import { ATCItemIdentifier } from "../entities/GLASSDataMaintenanceItem";
import { GlassAtcData } from "../entities/GlassAtcData";
import { GLASSDataMaintenanceRepository } from "../repositories/GLASSDataMaintenanceRepository";

export class UploadATCFileUseCase {
    constructor(private maintenanceRepository: GLASSDataMaintenanceRepository) {}

    execute(
        namespace: string,
        atcData: GlassAtcData,
        year: string,
        selectedItems?: ATCItemIdentifier[]
    ): Promise<void> {
        return this.maintenanceRepository.uploadATC(namespace, atcData, year, selectedItems);
    }
}
