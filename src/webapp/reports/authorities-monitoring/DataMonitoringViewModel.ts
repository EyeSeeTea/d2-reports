import {
    AuthoritiesMonitoringItem,
    getDataMonitoringItemId,
} from "../../../domain/reports/authorities-monitoring/entities/AuthoritiesMonitoringItem";

export interface DataMonitoringViewModel {
    id: string;
    uid: string;
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
            id: getDataMonitoringItemId(item),
            uid: item.id,
            name: item.name,
            lastLogin: item.lastLogin,
            username: item.username,
            templateGroup: item.templateGroup,
            roles: item.roles.map(role => role.name).join(", "),
            authorities: item.authorities.join(", "),
        };
    });
}
