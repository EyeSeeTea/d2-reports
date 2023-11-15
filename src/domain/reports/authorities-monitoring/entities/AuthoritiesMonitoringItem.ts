import { PaginatedObjects } from "../../../../types/d2-api";
import { NamedRef } from "../../../common/entities/Ref";

export interface TemplateGroupPermission {
    group: string;
    groupname: string;
    template: string;
    username: string;
}

export interface UserRole {
    id: string;
    name: string;
    authorities: string[];
}

export interface UserDetails extends NamedRef {
    userCredentials: {
        id: string;
        username: string;
        lastLogin: string;
        userRoles: UserRole[];
    };
}

export interface AuthoritiesMonitoringItem {
    id: string;
    name: string;
    lastLogin: string;
    username: string;
    role: string[];
    authority: string[];
    templateGroup: string;
}

export interface AuthoritiesMonitoringPaginatedObjects<T> extends PaginatedObjects<T> {
    templateGroups: string[];
}
