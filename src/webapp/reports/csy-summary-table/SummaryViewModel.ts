import { Config } from "../../../domain/common/entities/Config";
import { SummaryItem } from "../../../domain/reports/csy-summary/entities/SummaryItem";

export interface SummaryViewModel {
    id: string;
    group: string;
    subGroup: string;
}

export function getSummaryViews(_config: Config, items: SummaryItem[]): SummaryViewModel[] {
    return items.map((item, i) => {
        return {
            id: String(i),
            group: item.group,
            subGroup: item.subGroup,
        };
    });
}
