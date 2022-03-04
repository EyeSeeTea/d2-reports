import { HiddenVisualizationResult } from "../../../domain/common/entities/HiddenVisualizationResult";

export interface HiddenVisualizationViewModel {
    id: string;
    name: string;
    code?: string;
    sharing: string;
    details: string;
}

export function getHiddenVisualizationViews(
    hiddenVisualizations: HiddenVisualizationResult[]
):HiddenVisualizationViewModel[] {
    return hiddenVisualizations
        .map(hiddenVisualizationResult => {
            return {
                id: hiddenVisualizationResult.id,
                name: hiddenVisualizationResult.name,
                code: hiddenVisualizationResult.code ?? "-",
                sharing: hiddenVisualizationResult.sharing,
                details: hiddenVisualizationResult.details,
            };
        });
}
