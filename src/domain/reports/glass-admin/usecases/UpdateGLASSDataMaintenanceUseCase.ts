import { UseCase } from "../../../../compositionRoot";
import { GLASSDataMaintenanceRepository } from "../repositories/GLASSDataMaintenanceRepository";

export class UpdateGLASSDataMaintenanceUseCase implements UseCase {
    constructor(private maintenanceRepository: GLASSDataMaintenanceRepository) {}

    execute(namespace: string, action: UpdateAction, items: string[]): Promise<void> | undefined {
        switch (action) {
            case "delete":
                return this.maintenanceRepository.delete(namespace, items);
            default:
                return;
        }
    }
}

type UpdateAction = "delete";
