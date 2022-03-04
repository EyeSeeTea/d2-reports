import { HiddenVisualizationRepository } from "../repositories/HiddenVisualizationRepository";

export class SaveHiddenVisualizationDefaultUseCase {
    constructor(private hiddenVisualizationRepository: HiddenVisualizationRepository, public sqlViewId: string, public type: string) {}

    async execute(): Promise<void> {
        this.hiddenVisualizationRepository.exportToCsv(this.sqlViewId, this.type);
    }
}
