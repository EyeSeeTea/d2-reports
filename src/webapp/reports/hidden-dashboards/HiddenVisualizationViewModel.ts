import { HiddenDashboardResult } from "../../../domain/common/entities/HiddenDashboardResult";

export interface HiddenDashboardViewModel {
    id: string;
    name: string;
    code?: string;
    sharing: string;
    details: string;
}

export function getHiddenDashboardViews(
    hiddenVisualizations: HiddenDashboardResult[]
):HiddenDashboardViewModel[] {
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
