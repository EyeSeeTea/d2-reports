import { Config } from "../../../domain/common/entities/Config";
import { AuditItem } from "../../../domain/reports/csy-audit-trauma/entities/AuditItem";

export interface AuditViewModel {
    id: string;
    registerId: string;
}

export function getAuditViews(_config: Config, items: AuditItem[]): AuditViewModel[] {
    return items.map((item, i) => {
        return {
            id: String(i),
            registerId: item.registerId,
        };
    });
}
