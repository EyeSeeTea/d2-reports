import { HiddenDashboardsRepository } from "../repositories/HiddenDashboardsRepository";

export class SaveHiddenDashboardsDefaultUseCase {
    constructor(private hiddenDashboardsRepository: HiddenDashboardsRepository) {}

    async execute(): Promise<void> {
        this.hiddenDashboardsRepository.exportToCsv();
    }
}
