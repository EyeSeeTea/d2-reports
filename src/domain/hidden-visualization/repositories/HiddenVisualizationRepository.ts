import { HiddenVisualizationResult } from "../../common/entities/HiddenVisualizationResult";

export interface HiddenVisualizationRepository {
    getHiddenVisualizations(sqlViewId: string, type: string): Promise<HiddenVisualizationResult[]>;
    exportToCsv(sqlViewId: string, type: string): Promise<void>;
}