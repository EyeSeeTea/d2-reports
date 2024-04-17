import _ from "lodash";
import { NamedRef, Ref } from "../../../common/entities/Base";

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

export interface UserDetails extends NamedRef {
    userGroups: Ref[];
    userCredentials: {
        id: string;
        username: string;
        lastLogin: string;
        userRoles: UserRole[];
    };
}

export class User {
    public readonly id: string;
    public readonly name: string;
    public readonly userGroups: Ref[];
    public readonly userCredentials: {
        id: string;
        username: string;
        lastLogin: string;
        userRoles: UserRole[];
    };

    constructor(user: UserDetails) {
        this.id = user.id;
        this.name = user.name;
        this.userGroups = user.userGroups;
        this.userCredentials = user.userCredentials;
    }

    public isExcludedUser(excludeUsers: NamedRef[]): boolean {
        return excludeUsers.some(excludedUser => this.id === excludedUser.id);
    }

    public isExcludedRole(excludeRoles: NamedRef[]): boolean {
        const excludedRoleIds = excludeRoles.map(role => role.id);
        const userRoleIds = this.userCredentials.userRoles.map(role => role.id);

        return _.intersection(excludedRoleIds, userRoleIds).length > 0;
    }

    public isTemplateUser(userTemplateIds: string[]): boolean {
        return userTemplateIds.includes(this.id);
    }

    public isExcludedByRolesByGroup(excludeRolesByGroups: ExcludeRolesByGroup[]): boolean {
        return excludeRolesByGroups.some(excludedRolesByGroup => {
            const isInExcludedUserGroup = this.userGroups
                .map(userGroup => userGroup.id)
                .includes(excludedRolesByGroup.group.id);
            const hasExcludedRole = this.userCredentials.userRoles
                .map(userRole => userRole.id)
                .includes(excludedRolesByGroup.role.id);

            return isInExcludedUserGroup && hasExcludedRole;
        });
    }

    public isExcludedByRolesByUsers(excludeRolesByUsers: ExcludeRolesByUser[]): boolean {
        return excludeRolesByUsers.some(excludedRolesByUser => {
            const hasExcludedRole = this.userCredentials.userRoles
                .map(userRole => userRole.id)
                .includes(excludedRolesByUser.role.id);
            const isExcludedUser = this.id === excludedRolesByUser.user.id;

            return hasExcludedRole && isExcludedUser;
        });
    }

    public getExcludedRoles(excludeRolesByRoles: ExcludeRolesByRole[], allowedUserRoles: UserRole[]): UserRole[] {
        const currentUserRoles = this.userCredentials.userRoles;
        const excludedAuthorities = this.getExcludedAuthorities(allowedUserRoles);

        const excludedRoles = currentUserRoles
            .filter(role => role.authorities.some(authority => excludedAuthorities.includes(authority)))
            .filter(
                excludedRole =>
                    !excludeRolesByRoles.some(
                        excludedRolesByRole => excludedRolesByRole.ignore_role.id === excludedRole.id
                    )
            );

        return excludedRoles;
    }

    public getExcludedAuthorities(allowedUserRoles: UserRole[]): string[] {
        const currentUserRoles = this.userCredentials.userRoles;
        const currentUserAuthorities = currentUserRoles.flatMap(userRole => userRole.authorities);
        const allowedUserAuthorities = allowedUserRoles.flatMap(userRole => userRole.authorities);

        return _.difference(currentUserAuthorities, allowedUserAuthorities);
    }
}
