import { Config } from "../../../domain/common/entities/Config";
import { SummaryItem } from "../../../domain/reports/csy-summary-mortality/entities/SummaryItem";

export interface SummaryViewModel {
    id: string;
    scoringSystem: string;
    severity: string;
    mortality: any;
    total: string;
}

export function getSummaryViews(_config: Config, items: SummaryItem[]): SummaryViewModel[] {
    return items.map((item, i) => {
        return {
            id: String(i),
            scoringSystem: item.scoringSystem,
            severity: item.severity,
            mortality: item.mortality,
            total: item.total,
        };
    });
}
