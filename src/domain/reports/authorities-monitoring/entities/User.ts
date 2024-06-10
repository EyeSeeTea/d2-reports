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

    public hasExcludedRole(excludeRoles: NamedRef[]): boolean {
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

    public isExcludedByRolesByUsers(excludeRolesByUsers: ExcludeRolesByUser[], excludedRoles: NamedRef[]): boolean {
        const userRoleIds = this.userCredentials.userRoles.map(role => role.id);
        const isExcludedByRole = excludedRoles.map(role => role.id).some(role => userRoleIds.includes(role));
        const isExcludedByRoleByUsers = excludeRolesByUsers
            .map(roleByUser => roleByUser.role.id)
            .some(role => userRoleIds.includes(role));
        const isExcludedUser = excludeRolesByUsers.some(user => user.user.id === this.id);

        return !isExcludedByRole && isExcludedByRoleByUsers && isExcludedUser;
    }

    public getExcludedRoles(
        excludeRolesByRoles: ExcludeRolesByRole[],
        excludeRolesByUsers: ExcludeRolesByUser[],
        excludedRoles: NamedRef[],
        allowedUserRoles: UserRole[]
    ): UserRole[] {
        const currentUserRoles = this.userCredentials.userRoles;
        const excludedAuthorities = this.getExcludedAuthorities(
            allowedUserRoles,
            excludedRoles,
            excludeRolesByRoles,
            excludeRolesByUsers
        );

        return currentUserRoles.filter(role => {
            const hasExcludedAuthority = role.authorities.some(authority => excludedAuthorities.includes(authority));
            const hasExcludedRole = excludedRoles.some(excludedRole => role.id === excludedRole.id);
            const isExcludedByRoleByRole = excludeRolesByRoles.some(
                excludedRolesByRole => excludedRolesByRole.ignore_role.id === role.id
            );
            const isExcludedByRoleByUser = excludeRolesByUsers.some(
                excludedRolesByUser => excludedRolesByUser.role.id === role.id
            );

            return hasExcludedAuthority && !hasExcludedRole && !isExcludedByRoleByRole && !isExcludedByRoleByUser;
        });
    }

    public getExcludedAuthorities(
        allowedUserRoles: UserRole[],
        excludedRoles: NamedRef[],
        excludedRolesByRoles: ExcludeRolesByRole[],
        excludeRolesByUsers: ExcludeRolesByUser[]
    ): string[] {
        const currentUserRoles = this.userCredentials.userRoles.filter(userRole => {
            const isRoleExcluded = excludedRoles.map(excludedRole => excludedRole.id).includes(userRole.id);
            const isRoleExcludedByRoles = excludedRolesByRoles.some(
                excludedRolesByRole => excludedRolesByRole.ignore_role.id === userRole.id
            );
            const isRoleExcludedByUsers = excludeRolesByUsers.some(
                excludeRolesByUser => excludeRolesByUser.role.id === userRole.id
            );

            return !isRoleExcluded && !isRoleExcludedByRoles && !isRoleExcludedByUsers;
        });
        const currentUserAuthorities = currentUserRoles.flatMap(userRole => userRole.authorities);
        const allowedUserAuthorities = allowedUserRoles.flatMap(userRole => userRole.authorities);

        return _.difference(currentUserAuthorities, allowedUserAuthorities);
    }
}
