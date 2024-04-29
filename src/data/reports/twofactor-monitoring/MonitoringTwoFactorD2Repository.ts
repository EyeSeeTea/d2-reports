import _ from "lodash";
import { D2Api } from "../../../types/d2-api";
import { DataStoreStorageClient } from "../../common/clients/storage/DataStoreStorageClient";
import { d2ToolsNamespace } from "../../common/clients/storage/Namespaces";
import { StorageClient } from "../../common/clients/storage/StorageClient";
import { CsvData } from "../../common/CsvDataSource";
import { CsvWriterDataSource } from "../../common/CsvWriterCsvDataSource";
import { Instance } from "../../common/entities/Instance";
import { downloadFile } from "../../common/utils/download-file";
import { Pagination } from "../mal-data-approval/MalDataApprovalDefaultRepository";
import { MonitoringTwoFactorOptions } from "../../../domain/reports/twofactor-monitoring/entities/MonitoringTwoFactorOptions";
import { MonitoringTwoFactorRepository } from "../../../domain/reports/twofactor-monitoring/repositories/MonitoringTwoFactorRepository";
import { MonitoringTwoFactorUser } from "../../../domain/reports/twofactor-monitoring/entities/MonitoringTwoFactorUser";
import { paginate } from "../../../domain/common/entities/PaginatedObjects";
import { MonitoringTwoFactorPaginatedObjects } from "../../../domain/reports/twofactor-monitoring/entities/MonitoringTwoFactorPaginatedObjects";
import { NamedRef } from "../../../domain/common/entities/Ref";

export class MonitoringTwoFactorD2Repository implements MonitoringTwoFactorRepository {
    private storageClient: StorageClient;

    constructor(private api: D2Api) {
        const instance = new Instance({ url: this.api.baseUrl });
        this.storageClient = new DataStoreStorageClient("user", instance);
    }

    async get(
        namespace: string,
        options: MonitoringTwoFactorOptions
    ): Promise<MonitoringTwoFactorPaginatedObjects<MonitoringTwoFactorUser>> {
        const { paging, sorting } = options;
        const groupId = await this.getTwoFactorUserGroup(namespace);
        const objects = await this.getInvalidUsers(groupId.id);

        const userGroups = _(objects)
            .flatMap(object => object.userGroups)
            .uniqBy("id")
            .value();

        const filteredRows = await this.getFilteredRows(objects, options);

        const { pager, objects: rowsInPage } = paginate(filteredRows, sorting, paging);
        return {
            pager: pager,
            objects: rowsInPage,
            users: objects,
            groups: userGroups,
        };
    }

    private async getFilteredRows(
        objects: MonitoringTwoFactorUser[],
        options: MonitoringTwoFactorOptions
    ): Promise<MonitoringTwoFactorUser[]> {
        const { groups, usernameQuery } = options;

        return objects.filter(row => {
            const isInGroup = !!(_.isEmpty(groups) || !row.userGroups
                ? row
                : _.intersection(
                      groups,
                      row.userGroups.map(group => group.name)
                  ).length);
            const isInSearchQuery = _.includes(row.username, usernameQuery);

            return isInGroup && isInSearchQuery;
        });
    }
    private async getTwoFactorUserGroup(namespace: string): Promise<NamedRef> {
        const { TWO_FACTOR_GROUP_ID: group } = (await this.api
            .dataStore(d2ToolsNamespace)
            .get<{
                TWO_FACTOR_GROUP_ID: NamedRef;
            }>(namespace)
            .getData()) ?? { TWO_FACTOR_GROUP_ID: { id: "", name: "" } };

        return group;
    }

    private async getInvalidUsers(userGroupId: string): Promise<MonitoringTwoFactorUser[]> {
        let users: MonitoringTwoFactorUser[] = [];
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
                            email: true,
                            lastUpdated: true,
                            userCredentials: {
                                id: true,
                                username: true,
                                lastLogin: true,
                                externalAuth: true,
                                email: true,
                                disabled: true,
                                twoFA: true,
                                openId: true,
                            },
                            userGroups: { id: true, name: true },
                        },
                        filter: {
                            "userGroups.id": {
                                eq: userGroupId,
                            },
                        },
                        page: currentPage,
                        pageSize: pageSize,
                    })
                    .getData();

                const responseUsers = response.objects
                    .map((user: any) => {
                        return {
                            id: user.id,
                            name: user.name,
                            username: user.userCredentials.username,
                            lastLogin: user.userCredentials.lastLogin,
                            lastUpdated: user.lastUpdated,
                            externalAuth: user.userCredentials.externalAuth,
                            email: user.email ?? "-",
                            openId: user.openId ?? "-",
                            disabled: user.userCredentials.disabled,
                            twoFA: user.userCredentials.twoFA,
                            userGroups: user.userGroups,
                        };
                    })
                    .filter(user => user.twoFA === false);
                users = users.concat(responseUsers);
                currentPage++;
            } while (response.pager.page < Math.ceil(response.pager.total / pageSize));
            return users;
        } catch {
            return [];
        }
    }

    paginate<Obj>(objects: Obj[], pagination: Pagination) {
        const pager = {
            page: pagination.page,
            pageSize: pagination.pageSize,
            pageCount: Math.ceil(objects.length / pagination.pageSize),
            total: objects.length,
        };
        const { page, pageSize } = pagination;
        const start = (page - 1) * pageSize;

        const paginatedObjects = _(objects)
            .slice(start, start + pageSize)
            .value();

        return { pager: pager, objects: paginatedObjects };
    }

    async save(filename: string, users: MonitoringTwoFactorUser[]): Promise<void> {
        const headers = csvFields.map(field => ({ id: field, text: field }));
        const rows = users.map(user => ({
            id: user.id,
            name: user.name,
            username: user.username,
            externalAuth: String(user.externalAuth),
            disabled: String(user.disabled),
            email: user.email,
            openId: user.openId,
            lastLogin: user.lastLogin,
            lastUpdated: user.lastUpdated,
            twoFA: String(user.twoFA),
            userGroups: user.userGroups.map(group => group.name).join(", "),
        }));

        const csvDataSource = new CsvWriterDataSource();
        const csvData: CsvData<CsvField> = { headers, rows };
        const csvContents = csvDataSource.toString(csvData);

        return await downloadFile(csvContents, filename, "text/csv");
    }

    async getColumns(namespace: string): Promise<string[]> {
        const columns = await this.storageClient.getObject<string[]>(namespace);

        return columns ?? [];
    }

    async saveColumns(namespace: string, columns: string[]): Promise<void> {
        return this.storageClient.saveObject<string[]>(namespace, columns);
    }
}
const csvFields = [
    "id",
    "name",
    "username",
    "email",
    "disabled",
    "externalAuth",
    "twoFA",
    "openId",
    "lastLogin",
    "lastUpdated",
    "userGroups",
] as const;

type CsvField = typeof csvFields[number];
