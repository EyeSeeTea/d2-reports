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
import { NamedRef } from "../../../domain/common/entities/Base";
import { d2ToolsNamespace } from "../../common/clients/storage/Namespaces";
import { downloadFile } from "../../common/utils/download-file";
import { CsvWriterDataSource } from "../../common/CsvWriterCsvDataSource";
import { CsvData } from "../../common/CsvDataSource";

interface TemplateGroup {
    group: NamedRef;
    template: NamedRef;
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
        const {
            paging,
            sorting,
            templateGroups: templateGroupsOptions,
            usernameQuery,
            userRoles: userRolesOptions,
        } = options;

        const { TEMPLATE_GROUPS: templateGroups } = (await this.api
            .dataStore(d2ToolsNamespace)
            .get<{
                TEMPLATE_GROUPS: TemplateGroup[];
            }>(namespace)
            .getData()) ?? { TEMPLATE_GROUPS: [] };

        const userTemplateIds = templateGroups.map(templateGroup => templateGroup.template.id);
        const templateUserGroups = templateGroups.map(templateGroup => templateGroup.group.id);
        const templateGroupUsers = await this.getTemplateGroupUsers(templateUserGroups);

        const rolesByUserGroup = await promiseMap(templateGroups, async templateGroup => {
            const userTemplateRoles = (await this.getUserTemplate(templateGroup.template.id)).userCredentials.userRoles;

            return {
                userGroup: templateGroup.group,
                roles: userTemplateRoles,
            };
        });

        const objects: AuthoritiesMonitoringItem[] = _(templateGroupUsers)
            .map(user => {
                const userTemplateGroups = user.userGroups
                    .filter(group => templateUserGroups.includes(group.id))
                    .map(userGroup => userGroup.id);

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
                    .filter(userGroupRole =>
                        user.userGroups.map(userGroup => userGroup.id).includes(userGroupRole.userGroup.id)
                    )
                    .map(templateGroup => templateGroup.userGroup.name);

                return {
                    id: user.id,
                    name: user.name,
                    lastLogin: user.userCredentials.lastLogin ?? "-",
                    username: user.userCredentials.username,
                    authorities: excludedAuthorities,
                    templateGroups: templateGroups,
                    roles: excludedRoles,
                };
            })
            .filter(user => !_.isEmpty(user.authorities) && !userTemplateIds.includes(user.id))
            .value();

        const userRoles = _(objects)
            .flatMap(object => object.roles)
            .uniqBy("id")
            .value();

        const filteredRows = objects.filter(row => {
            const isInTemplateGroup = !!(_.isEmpty(templateGroupsOptions) || !row.templateGroups
                ? row
                : _.intersection(templateGroupsOptions, row.templateGroups));
            const hasUserRole = !!(_.isEmpty(userRolesOptions) || !row.roles
                ? row
                : _.some(userRolesOptions.map(r => row.roles.map(role => role.id).includes(r))));
            const isInSearchQuery = _.includes(row.username, usernameQuery);

            return isInTemplateGroup && hasUserRole && isInSearchQuery;
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
            templateGroups: templateGroups.map(templateGroup => templateGroup.group.name),
            userRoles: userRoles,
        };
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

    private async getTemplateGroupUsers(templateUserGroups: string[]): Promise<UserDetails[]> {
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
                                in: templateUserGroups,
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
