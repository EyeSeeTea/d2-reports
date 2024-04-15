import _ from "lodash";
import {
    AuthoritiesMonitoringOptions,
    AuthoritiesMonitoringRepository,
} from "../../../domain/reports/authorities-monitoring/repositories/AuthoritiesMonitoringRepository";
import { D2Api } from "../../../types/d2-api";
import { DataStoreStorageClient } from "../../common/clients/storage/DataStoreStorageClient";
import { StorageClient } from "../../common/clients/storage/StorageClient";
import { Instance } from "../../common/entities/Instance";
import { promiseMap } from "../../../utils/promises";
import {
    UserDetails,
    AuthoritiesMonitoringItem,
    AuthoritiesMonitoringPaginatedObjects,
} from "../../../domain/reports/authorities-monitoring/entities/AuthoritiesMonitoringItem";
import { NamedRef } from "../../../domain/common/entities/Base";
import { d2ToolsNamespace } from "../../common/clients/storage/Namespaces";
import { downloadFile } from "../../common/utils/download-file";
import { CsvWriterDataSource } from "../../common/CsvWriterCsvDataSource";
import { CsvData } from "../../common/CsvDataSource";
import { paginate } from "../../../domain/common/entities/PaginatedObjects";

interface TemplateGroup {
    group: NamedRef;
    template: NamedRef;
}

interface ExcludeRolesByGroup {
    group: NamedRef;
    role: NamedRef;
}

interface ExcludeRolesByUser {
    user: NamedRef;
    role: NamedRef;
}

interface UserMonitoring {
    excludeRolesByGroups: ExcludeRolesByGroup[];
    excludeRolesByUsers: ExcludeRolesByUser[];
    templateGroups: TemplateGroup[];
}

export class AuthoritiesMonitoringDefaultRepository implements AuthoritiesMonitoringRepository {
    private storageClient: StorageClient;

    constructor(private api: D2Api) {
        const instance = new Instance({ url: this.api.baseUrl });
        this.storageClient = new DataStoreStorageClient("user", instance);
    }

    async get(
        namespace: string,
        options: AuthoritiesMonitoringOptions
    ): Promise<AuthoritiesMonitoringPaginatedObjects<AuthoritiesMonitoringItem>> {
        const { paging, sorting } = options;

        const { excludeRolesByGroups, excludeRolesByUsers, templateGroups } = await this.getUserMonitoring(namespace);

        const objects = await this.getAuthoritiesMonitoringObject(
            templateGroups,
            excludeRolesByGroups,
            excludeRolesByUsers
        );

        const userRoles = _(objects)
            .flatMap(object => object.roles)
            .uniqBy("id")
            .value();

        const filteredRows = await this.getFilteredRows(objects, options);

        const { pager, objects: rowsInPage } = paginate(filteredRows, sorting, paging);

        return {
            pager: pager,
            objects: rowsInPage,
            templateGroups: templateGroups.map(templateGroup => templateGroup.group.name),
            userRoles: userRoles,
        };
    }

    private async getUserMonitoring(namespace: string): Promise<UserMonitoring> {
        const {
            TEMPLATE_GROUPS: templateGroups,
            EXCLUDE_ROLES_BY_GROUPS: excludedRolesByGroups,
            EXCLUDE_ROLES_BY_USERS: excludeRolesByUsers,
        } = (await this.api
            .dataStore(d2ToolsNamespace)
            .get<{
                TEMPLATE_GROUPS: TemplateGroup[];
                EXCLUDE_ROLES_BY_GROUPS: ExcludeRolesByGroup[];
                EXCLUDE_ROLES_BY_USERS: ExcludeRolesByUser[];
            }>(namespace)
            .getData()) ?? { TEMPLATE_GROUPS: [], EXCLUDE_ROLES_BY_GROUPS: [], EXCLUDE_ROLES_BY_USERS: [] };

        return {
            excludeRolesByGroups: excludedRolesByGroups,
            excludeRolesByUsers: excludeRolesByUsers,
            templateGroups: templateGroups,
        };
    }

    private async getAuthoritiesMonitoringObject(
        templateGroups: TemplateGroup[],
        excludedRolesByGroups: ExcludeRolesByGroup[],
        excludeRolesByUsers: ExcludeRolesByUser[]
    ): Promise<AuthoritiesMonitoringItem[]> {
        const userTemplateIds = templateGroups.map(templateGroup => templateGroup.template.id);
        const templateGroupUserGroups = templateGroups.map(templateGroup => templateGroup.group.id);
        const userDetails = await this.getUserDetails(templateGroupUserGroups);

        const rolesByUserGroup = await promiseMap(templateGroups, async templateGroup => {
            const userTemplateRoles = (await this.getUserTemplate(templateGroup.template.id)).userCredentials.userRoles;

            return {
                userGroup: templateGroup.group,
                roles: userTemplateRoles,
            };
        });

        return _(userDetails)
            .map(user => {
                const userGroupIds = user.userGroups.map(userGroup => userGroup.id);
                const userTemplateGroups = userGroupIds.filter(userGroup =>
                    templateGroupUserGroups.includes(userGroup)
                );

                const currentUserRoles = user.userCredentials.userRoles;
                const currentUserAuthorities = currentUserRoles.flatMap(userRole => userRole.authorities);

                const allowedUserRoles = rolesByUserGroup
                    .filter(templateGroupRole => userTemplateGroups.includes(templateGroupRole.userGroup.id))
                    .flatMap(templateGroupRole => templateGroupRole.roles);
                const allowedUserAuthorities = allowedUserRoles.flatMap(userRole => userRole.authorities);

                const excludedAuthorities = _.difference(currentUserAuthorities, allowedUserAuthorities);
                const excludedRoles = currentUserRoles.filter(role =>
                    role.authorities.some(authority => excludedAuthorities.includes(authority))
                );
                const templateGroups = rolesByUserGroup
                    .filter(userGroupRole => userGroupIds.includes(userGroupRole.userGroup.id))
                    .map(templateGroup => templateGroup.userGroup.name);

                return {
                    ...user,
                    lastLogin: user.userCredentials.lastLogin ?? "-",
                    username: user.userCredentials.username,
                    authorities: excludedAuthorities,
                    templateGroups: templateGroups,
                    roles: excludedRoles,
                };
            })
            .filter(user => {
                const isTemplateUser = userTemplateIds.includes(user.id);
                const hasExcludedAuthorities = !_.isEmpty(user.authorities);
                const isExcludedByRolesByGroup = excludedRolesByGroups.some(excludedRolesByGroup => {
                    const isInExcludedUserGroup = user.userGroups
                        .map(userGroup => userGroup.id)
                        .includes(excludedRolesByGroup.group.id);
                    const hasExcludedRole = user.userCredentials.userRoles
                        .map(userRole => userRole.id)
                        .includes(excludedRolesByGroup.role.id);

                    return isInExcludedUserGroup && hasExcludedRole;
                });
                const isExcludedByRolesByUsers = excludeRolesByUsers.some(excludedRolesByUser => {
                    const hasExcludedRole = user.userCredentials.userRoles
                        .map(userRole => userRole.id)
                        .includes(excludedRolesByUser.role.id);
                    const isExcludedUser = user.id === excludedRolesByUser.user.id;

                    return hasExcludedRole && isExcludedUser;
                });

                return (
                    hasExcludedAuthorities && !isTemplateUser && !isExcludedByRolesByGroup && !isExcludedByRolesByUsers
                );
            })
            .value();
    }

    private async getFilteredRows(
        objects: AuthoritiesMonitoringItem[],
        options: AuthoritiesMonitoringOptions
    ): Promise<AuthoritiesMonitoringItem[]> {
        const { templateGroups, usernameQuery, userRoles } = options;

        return objects.filter(row => {
            const isInTemplateGroup = !!(_.isEmpty(templateGroups) || !row.templateGroups
                ? row
                : _.intersection(templateGroups, row.templateGroups));
            const hasUserRole = !!(_.isEmpty(userRoles) || !row.roles
                ? row
                : _.some(userRoles.map(r => row.roles.map(role => role.id).includes(r))));
            const isInSearchQuery = _.includes(row.username, usernameQuery);

            return isInTemplateGroup && hasUserRole && isInSearchQuery;
        });
    }

    async save(filename: string, items: AuthoritiesMonitoringItem[]): Promise<void> {
        const headers = csvFields.map(field => ({ id: field, text: field }));
        const rows = items.map(
            (dataValue): AuthoritiesMonitoringItemRow => ({
                id: dataValue.id,
                name: dataValue.name,
                lastLogin: dataValue.lastLogin,
                username: dataValue.username,
                roles: dataValue.roles.map(role => role.name).join(", "),
                authorities: dataValue.authorities.join(", "),
                templateGroups: dataValue.templateGroups.join(", "),
            })
        );
        const timestamp = new Date().toISOString();
        const csvDataSource = new CsvWriterDataSource();
        const csvData: CsvData<CsvField> = { headers, rows };
        const csvContents = `Time: ${timestamp}\n` + csvDataSource.toString(csvData);

        await downloadFile(csvContents, filename, "text/csv");
    }

    async getColumns(namespace: string): Promise<string[]> {
        const columns = await this.storageClient.getObject<string[]>(namespace);

        return columns ?? [];
    }

    async saveColumns(namespace: string, columns: string[]): Promise<void> {
        return this.storageClient.saveObject<string[]>(namespace, columns);
    }

    private async getUserDetails(userGroupIds: string[]): Promise<UserDetails[]> {
        let users: UserDetails[] = [];
        let currentPage = 1;
        let response;
        const pageSize = 250;

        try {
            do {
                response = await this.api.models.users
                    .get({
                        fields: {
                            id: true,
                            name: true,
                            userCredentials: {
                                id: true,
                                username: true,
                                lastLogin: true,
                                userRoles: {
                                    id: true,
                                    name: true,
                                    authorities: true,
                                },
                            },
                            userGroups: true,
                        },
                        filter: {
                            "userGroups.id": {
                                in: userGroupIds,
                            },
                        },
                        page: currentPage,
                        pageSize: pageSize,
                    })
                    .getData();

                users = users.concat(response.objects);
                currentPage++;
            } while (response.pager.page < Math.ceil(response.pager.total / pageSize));
            return users;
        } catch {
            return [];
        }
    }

    private async getUserTemplate(userId: string): Promise<UserDetails> {
        return await this.api
            .get<UserDetails>(`/users/${userId}`, {
                fields: "id,name,userCredentials[username,lastLogin,userRoles[id,name,authorities]]",
            })
            .getData();
    }
}

const csvFields = ["id", "name", "lastLogin", "username", "roles", "authorities", "templateGroups"] as const;

type CsvField = typeof csvFields[number];

type AuthoritiesMonitoringItemRow = Record<CsvField, string>;
