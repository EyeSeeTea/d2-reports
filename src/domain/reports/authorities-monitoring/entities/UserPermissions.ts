import _ from "lodash";
import { NamedRef, Ref } from "../../../common/entities/Base";
import { UserMonitoring } from "../../../../data/reports/authorities-monitoring/AuthoritiesMonitoringDefaultRepository";

export type TemplateGroup = {
    group: NamedRef;
    template: NamedRef;
};

export type ExcludeRolesByGroup = {
    group: NamedRef;
    role: NamedRef;
};

export type ExcludeRolesByUser = {
    user: NamedRef;
    role: NamedRef;
};

export type ExcludeRolesByRole = {
    active_role: NamedRef;
    ignore_role: NamedRef;
};

export type UserRole = {
    id: string;
    name: string;
    authorities: string[];
};

export interface User extends NamedRef {
    userGroups: Ref[];
    userCredentials: {
        id: string;
        username: string;
        lastLogin: string;
        userRoles: UserRole[];
    };
}

export interface UserDetails extends NamedRef {
    authorities: string[];
    roles: UserRole[];
    userGroups: Ref[];
    userCredentials: {
        id: string;
        username: string;
        lastLogin: string;
        userRoles: UserRole[];
    };
}

export class UserPermissions {
    public readonly user: UserDetails;
    public readonly userMonitoring: UserMonitoring;

    constructor(user: UserDetails, userMonitoring: UserMonitoring) {
        this.user = user;
        this.userMonitoring = userMonitoring;
    }

    public isExcludedUser(): boolean {
        const { excludedUsers } = this.userMonitoring;

        return excludedUsers.some(excludedUser => this.user.id === excludedUser.id);
    }

    public hasExcludedRole(): boolean {
        const { excludedRoles } = this.userMonitoring;
        const excludedRoleIds = excludedRoles.map(role => role.id);
        const userRoleIds = this.user.userCredentials.userRoles.map(role => role.id);

        return _.intersection(excludedRoleIds, userRoleIds).length > 0;
    }

    public isTemplateUser(): boolean {
        const { templates } = this.userMonitoring;
        const userTemplateIds = templates.map(template => template.template.id);

        return userTemplateIds.includes(this.user.id);
    }

    public isExcludedByRolesByGroup(): boolean {
        const { excludedRolesByGroup } = this.userMonitoring;

        return excludedRolesByGroup.some(excludedRolesByGroup => {
            const isInExcludedUserGroup = this.user.userGroups
                .map(userGroup => userGroup.id)
                .includes(excludedRolesByGroup.group.id);
            const hasExcludedRole = this.user.userCredentials.userRoles
                .map(userRole => userRole.id)
                .includes(excludedRolesByGroup.role.id);

            return isInExcludedUserGroup && hasExcludedRole;
        });
    }

    public isExcludedByRolesByUsers(): boolean {
        const { excludedRolesByUser } = this.userMonitoring;
        const userRoleIds = this.user.userCredentials.userRoles.map(role => role.id);

        const isExcludedByRole = this.user.roles.map(role => role.id).some(role => userRoleIds.includes(role));
        const isExcludedByRoleByUsers = excludedRolesByUser
            .map(roleByUser => roleByUser.role.id)
            .some(role => userRoleIds.includes(role));
        const isExcludedUser = excludedRolesByUser.some(user => user.user.id === this.user.id);

        return !isExcludedByRole && isExcludedByRoleByUsers && isExcludedUser;
    }
}
