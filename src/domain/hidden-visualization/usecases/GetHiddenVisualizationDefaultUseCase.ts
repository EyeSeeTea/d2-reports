import { HiddenVisualizationResult } from "../../common/entities/HiddenVisualizationResult";
import { HiddenVisualizationRepository } from "../repositories/HiddenVisualizationRepository";

export class GetHiddenVisualizationDefaultUseCase {
    constructor(private hiddenVisualizationRepository: HiddenVisualizationRepository, public sqlViewId: string, public type: string) {}

    execute(): Promise<HiddenVisualizationResult[]> {
        return this.hiddenVisualizationRepository.getHiddenVisualizations(this.sqlViewId, this.type);
    }
}
