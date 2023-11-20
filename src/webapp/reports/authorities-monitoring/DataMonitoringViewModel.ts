import { AuthoritiesMonitoringItem } from "../../../domain/reports/authorities-monitoring/entities/AuthoritiesMonitoringItem";

export interface DataMonitoringViewModel {
    id: string;
    name: string;
    lastLogin: string;
    username: string;
    templateGroup: string;
    roles: string;
    authorities: string;
}

export function getDataMonitoringViews(items: AuthoritiesMonitoringItem[]): DataMonitoringViewModel[] {
    return items.map(item => {
        return {
            id: item.id,
            name: item.name,
            lastLogin: item.lastLogin,
            username: item.username,
            templateGroup: item.templateGroup,
            roles: item.roles.map(role => role.id).join(", "),
            authorities: item.authorities.join(", "),
        };
    });
}
