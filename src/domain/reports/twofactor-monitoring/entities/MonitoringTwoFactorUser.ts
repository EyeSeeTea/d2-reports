import { Id, NamedRef } from "../../../common/entities/Base";

export interface MonitoringTwoFactorUser {
    id: Id;
    name: string;
    username: string;
    lastLogin: string;
    lastUpdated: string;
    externalAuth: string;
    email: string;
    disabled: boolean;
    twoFA: string;
    userRoles: NamedRef[];
    userGroups: NamedRef[];
}
