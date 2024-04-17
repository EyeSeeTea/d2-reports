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
    AuthoritiesMonitoringItem,
    AuthoritiesMonitoringPaginatedObjects,
} from "../../../domain/reports/authorities-monitoring/entities/AuthoritiesMonitoringItem";
import { NamedRef } from "../../../domain/common/entities/Base";
import { d2ToolsNamespace } from "../../common/clients/storage/Namespaces";
import { downloadFile } from "../../common/utils/download-file";
import { CsvWriterDataSource } from "../../common/CsvWriterCsvDataSource";
import { CsvData } from "../../common/CsvDataSource";
import { paginate } from "../../../domain/common/entities/PaginatedObjects";
import {
    ExcludeRolesByGroup,
    ExcludeRolesByRole,
    ExcludeRolesByUser,
    TemplateGroup,
    User,
    UserDetails,
} from "../../../domain/reports/authorities-monitoring/entities/User";

type UserMonitoring = {
    excludeRoles: NamedRef[];
    excludeUsers: NamedRef[];
    excludeRolesByGroups: ExcludeRolesByGroup[];
    excludeRolesByRoles: ExcludeRolesByRole[];
    excludeRolesByUsers: ExcludeRolesByUser[];
    templateGroups: TemplateGroup[];
};

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

        const userMonitoring = await this.getUserMonitoring(namespace);
        const { templateGroups } = userMonitoring;

        const objects = await this.getAuthoritiesMonitoringObject(userMonitoring);

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
            EXCLUDE_ROLES: excludeRoles,
            EXCLUDE_USERS: excludeUsers,
            EXCLUDE_ROLES_BY_ROLE: excludeRolesByRoles,
            EXCLUDE_ROLES_BY_GROUPS: excludedRolesByGroups,
            EXCLUDE_ROLES_BY_USERS: excludeRolesByUsers,
        } = (await this.api
            .dataStore(d2ToolsNamespace)
            .get<{
                TEMPLATE_GROUPS: TemplateGroup[];
                EXCLUDE_ROLES: NamedRef[];
                EXCLUDE_USERS: NamedRef[];
                EXCLUDE_ROLES_BY_ROLE: ExcludeRolesByRole[];
                EXCLUDE_ROLES_BY_GROUPS: ExcludeRolesByGroup[];
                EXCLUDE_ROLES_BY_USERS: ExcludeRolesByUser[];
            }>(namespace)
            .getData()) ?? emptyUserMonitoring;

        return {
            excludeRoles: excludeRoles,
            excludeUsers: excludeUsers,
            excludeRolesByRoles: excludeRolesByRoles,
            excludeRolesByGroups: excludedRolesByGroups,
            excludeRolesByUsers: excludeRolesByUsers,
            templateGroups: templateGroups,
        };
    }

    private async getAuthoritiesMonitoringObject(userMonitoring: UserMonitoring): Promise<AuthoritiesMonitoringItem[]> {
        const {
            excludeRoles,
            excludeUsers,
            excludeRolesByGroups,
            excludeRolesByRoles,
            excludeRolesByUsers,
            templateGroups,
        } = userMonitoring;
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
            .map(userDetail => {
                const user = new User(userDetail);

                const userGroupIds = userDetail.userGroups.map(userGroup => userGroup.id);
                const userTemplateGroups = userGroupIds.filter(userGroup =>
                    templateGroupUserGroups.includes(userGroup)
                );

                const allowedUserRoles = rolesByUserGroup
                    .filter(templateGroupRole => userTemplateGroups.includes(templateGroupRole.userGroup.id))
                    .flatMap(templateGroupRole => templateGroupRole.roles);

                const excludedAuthorities = user.getExcludedAuthorities(allowedUserRoles);
                const excludedRoles = user.getExcludedRoles(excludeRolesByRoles, allowedUserRoles);
                const templateGroups = rolesByUserGroup
                    .filter(userGroupRole => userGroupIds.includes(userGroupRole.userGroup.id))
                    .map(templateGroup => templateGroup.userGroup.name);

                return {
                    ...userDetail,
                    id: userDetail.id,
                    name: userDetail.name,
                    lastLogin: userDetail.userCredentials.lastLogin ?? "-",
                    username: userDetail.userCredentials.username,
                    authorities: excludedAuthorities,
                    templateGroups: templateGroups,
                    roles: excludedRoles,
                };
            })
            .filter(userDetail => {
                const user = new User(userDetail);

                const hasExcludedAuthorities = !_.isEmpty(userDetail.authorities);
                const isExcludedUser = user.isExcludedUser(excludeUsers);
                const isExcludedRole = user.isExcludedRole(excludeRoles);
                const isTemplateUser = user.isTemplateUser(userTemplateIds);
                const isExcludedByRolesByGroup = user.isExcludedByRolesByGroup(excludeRolesByGroups);
                const isExcludedByRolesByUsers = user.isExcludedByRolesByUsers(excludeRolesByUsers);

                return (
                    hasExcludedAuthorities &&
                    !isTemplateUser &&
                    !isExcludedRole &&
                    !isExcludedUser &&
                    !isExcludedByRolesByGroup &&
                    !isExcludedByRolesByUsers
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

const emptyUserMonitoring = {
    TEMPLATE_GROUPS: [],
    EXCLUDE_ROLES: [],
    EXCLUDE_USERS: [],
    EXCLUDE_ROLES_BY_GROUPS: [],
    EXCLUDE_ROLES_BY_ROLE: [],
    EXCLUDE_ROLES_BY_USERS: [],
};

const csvFields = ["id", "name", "lastLogin", "username", "roles", "authorities", "templateGroups"] as const;

type CsvField = typeof csvFields[number];

type AuthoritiesMonitoringItemRow = Record<CsvField, string>;
