import _ from "lodash";
import {
    AuthoritiesMonitoringOptions,
    AuthoritiesMonitoringRepository,
} from "../../../domain/reports/authorities-monitoring/repositories/AuthoritiesMonitoringRepository";
import { D2Api, Pager } from "../../../types/d2-api";
import { DataStoreStorageClient } from "../../common/clients/storage/DataStoreStorageClient";
import { StorageClient } from "../../common/clients/storage/StorageClient";
import { Instance } from "../../common/entities/Instance";
import { promiseMap } from "../../../utils/promises";
import {
    UserDetails,
    AuthoritiesMonitoringItem,
    AuthoritiesMonitoringPaginatedObjects,
} from "../../../domain/reports/authorities-monitoring/entities/AuthoritiesMonitoringItem";

interface TemplateGroup {
    group: string;
    template: string;
    username: string;
    groupname: string;
}

export class AuthoritiesMonitoringDefaultRepository implements AuthoritiesMonitoringRepository {
    private storageClient: StorageClient;
    private globalStorageClient: StorageClient;

    constructor(private api: D2Api) {
        const instance = new Instance({ url: this.api.baseUrl });
        this.storageClient = new DataStoreStorageClient("user", instance);
        this.globalStorageClient = new DataStoreStorageClient("global", instance);
    }

    async get(
        namespace: string,
        options: AuthoritiesMonitoringOptions
    ): Promise<AuthoritiesMonitoringPaginatedObjects<AuthoritiesMonitoringItem>> {
        const { paging, sorting, templateGroups: templateGroupsOptions } = options;
        const { TEMPLATE_GROUPS: templateGroups } = (await this.globalStorageClient.getObject<{
            TEMPLATE_GROUPS: TemplateGroup[];
        }>(namespace)) ?? { TEMPLATE_GROUPS: [] };

        const objects: AuthoritiesMonitoringItem[] = _(
            await promiseMap(templateGroups, async templateGroup => {
                const templateDetails = await this.getUserTemplate(templateGroup.template);
                const templateAuthorities = _(templateDetails.userCredentials.userRoles)
                    .flatMap(userRole => userRole.authorities)
                    .uniq()
                    .value();
                const templateGroupUsers = await this.getTemplateGroupUsers(templateGroup.group);

                const usersWithNotAllowedRoles = templateGroupUsers.filter(user => {
                    const userAuthorities = _(user.userCredentials.userRoles)
                        .flatMap(role => role.authorities)
                        .uniq()
                        .value();

                    const userHasExcludedAuthorities = !_(userAuthorities)
                        .map(authority => templateAuthorities.includes(authority))
                        .every();

                    return userHasExcludedAuthorities;
                });

                return usersWithNotAllowedRoles.map(user => {
                    const excludedRoles = _(user.userCredentials.userRoles)
                        .filter(
                            role =>
                                !_(role.authorities)
                                    .map(authority => templateAuthorities.includes(authority))
                                    .every()
                        )
                        .map(role => ({
                            ...role,
                            authorities: _.difference(role.authorities, templateAuthorities),
                        }))
                        .value();

                    return {
                        id: user.id,
                        name: user.name,
                        lastLogin: user.userCredentials.lastLogin ?? "-",
                        username: user.userCredentials.username,
                        templateGroup: templateGroup.groupname,
                        role: excludedRoles.map(role => role.name),
                        authority: excludedRoles.flatMap(role => role.authorities),
                    };
                });
            })
        )
            .flatten()
            .value();

        const filteredRows = objects.filter(row => {
            return _.isEmpty(templateGroupsOptions) || !row.templateGroup
                ? row
                : templateGroupsOptions.includes(row.templateGroup);
        });

        const rowsInPage = _(filteredRows)
            .orderBy([row => row[sorting.field]], [sorting.direction])
            .drop((paging.page - 1) * paging.pageSize)
            .take(paging.pageSize)
            .value();

        const pager: Pager = {
            page: paging.page,
            pageSize: paging.pageSize,
            pageCount: Math.ceil(filteredRows.length / paging.pageSize),
            total: filteredRows.length,
        };

        return {
            pager: pager,
            objects: rowsInPage,
            templateGroups: templateGroups.map(templateGroup => templateGroup.groupname),
        };
    }

    async getColumns(namespace: string): Promise<string[]> {
        const columns = await this.storageClient.getObject<string[]>(namespace);

        return columns ?? [];
    }

    async saveColumns(namespace: string, columns: string[]): Promise<void> {
        return this.storageClient.saveObject<string[]>(namespace, columns);
    }

    private async getUserTemplate(userId: string): Promise<UserDetails> {
        return await this.api
            .get<UserDetails>(`/users/${userId}`, {
                fields: "id,name,userCredentials[id,name,username,lastLogin,userRoles[id,name,authorities]]",
            })
            .getData();
    }

    private async getTemplateGroupUsers(userGroupId: string): Promise<UserDetails[]> {
        const { users } = await this.api
            .get<{ users: UserDetails[] }>("/users", {
                fields: "id,name,userCredentials[username,lastLogin,userRoles[name,authorities]",
                filter: `userGroups.id:in:[${userGroupId}]`,
            })
            .getData();

        return users;
    }
}
