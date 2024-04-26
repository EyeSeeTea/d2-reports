import { MonitoringTwoFactorUser } from "../../../../domain/reports/twofactor-monitoring/entities/MonitoringTwoFactorUser";

export interface TwoFactorViewModel {
    id: string;
    name: string;
    username: string;
    lastLogin: string;
    lastUpdated: string;
    externalAuth: string;
    disabled: string;
    email: string;
    twoFA: string;
}

export function getTwoFactorMonitoringViews(items: MonitoringTwoFactorUser[]): TwoFactorViewModel[] {
    return items.map(item => {
        return {
            id: item.id,
            name: item.name,
            username: item.username,
            lastLogin: item.lastLogin !== undefined ? String(item.disabled) : "-",
            lastUpdated: item.lastUpdated,
            externalAuth: item.externalAuth !== undefined ? String(item.externalAuth) : "-",
            disabled: item.disabled !== undefined ? String(item.disabled) : "-",
            email: item.email !== undefined ? String(item.email) : "-",
            twoFA: item.twoFA !== undefined ? String(item.twoFA) : "-",
        };
    });
}
