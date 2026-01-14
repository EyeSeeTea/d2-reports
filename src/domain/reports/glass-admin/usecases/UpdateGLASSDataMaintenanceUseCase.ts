import { Id } from "../../../common/entities/Base";
import { GLASSDataMaintenanceRepository } from "../repositories/GLASSDataMaintenanceRepository";

export class UpdateGLASSDataMaintenanceUseCase {
    constructor(private maintenanceRepository: GLASSDataMaintenanceRepository) {}

    execute(action: UpdateAction, itemIds: Id[]): Promise<void> | undefined {
        switch (action) {
            case "delete":
                return this.maintenanceRepository.delete(itemIds);
            default:
                return;
        }
    }
}

type UpdateAction = "delete";
