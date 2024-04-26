import _ from "lodash";
import { User } from "../../../domain/common/entities/User";
import { D2Api, PaginatedObjects } from "../../../types/d2-api";
import { DataStoreStorageClient } from "../../common/clients/storage/DataStoreStorageClient";
import { Namespaces } from "../../common/clients/storage/Namespaces";
import { StorageClient } from "../../common/clients/storage/StorageClient";
import { CsvData } from "../../common/CsvDataSource";
import { CsvWriterDataSource } from "../../common/CsvWriterCsvDataSource";
import { Instance } from "../../common/entities/Instance";
import { downloadFile } from "../../common/utils/download-file";
import { Pagination } from "../mal-data-approval/MalDataApprovalDefaultRepository";
import { MonitoringTwoFactorOptions } from "../../../domain/reports/twofactor-monitoring/entities/MonitoringTwoFactorOptions";
import { MonitoringTwoFactorRepository } from "../../../domain/reports/twofactor-monitoring/repositories/MonitoringTwoFactorRepository";
import { PaginatedObjects as domainPaginatedObjects } from "../../../domain/common/entities/PaginatedObjects";
import { MonitoringTwoFactorUser } from "../../../domain/reports/twofactor-monitoring/entities/MonitoringTwoFactorUser";

export class MonitoringTwoFactorD2Repository implements MonitoringTwoFactorRepository {
    private storageClient: StorageClient;

    constructor(private api: D2Api) {
        const instance = new Instance({ url: this.api.baseUrl });
        this.storageClient = new DataStoreStorageClient("user", instance);
    }

    get(namespace: string, options: MonitoringTwoFactorOptions): Promise<MonitoringTwoFactorUser[]> {
        const { paging, sorting } = options;

        const groupId = "id";
        const objects = this.getInvalidUsers(groupId);
        const filteredRows = await this.getFilteredRows(objects, options);

        const { pager, objects: rowsInPage } = paginate(filteredRows, sorting, paging);
        return;
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
                            userCredentials: {
                                id: true,
                                username: true,
                                lastLogin: true,
                                lastUpdated: true,
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
                            lastUpdated: user.userCredentials.lastUpdated,
                            externalAuth: user.userCredentials.externalAuth,
                            email: user.userCredentials.email,
                            disabled: user.userCredentials.disabled,
                            twoFA: user.userCredentials.twoFA,
                            userRoles: user.userCredentials.userRoles,
                            userGroups: user.userGroups,
                        };
                    })
                    .filter(user => user.twoFA === false);
                users.concat(responseUsers);
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

    async save(filename: string, users: User[]): Promise<void> {
        const headers = csvFields.map(field => ({ id: field, text: field }));
        const rows = users.map(user => ({
            id: user.id,
            name: user.name,
            username: user.username,
            externalAuth: String(user.externalAuth),
            disabled: String(user.disabled),
            email: user.email,
            twoFA: String(user.twoFA),
        }));

        const csvDataSource = new CsvWriterDataSource();
        const csvData: CsvData<CsvField> = { headers, rows };
        const csvContents = csvDataSource.toString(csvData);

        return await downloadFile(csvContents, filename, "text/csv");
    }

    async saveColumns(columns: string[]): Promise<void> {
        return this.storageClient.saveObject<string[]>(Namespaces.NHWA_APPROVAL_STATUS_USER_COLUMNS, columns);
    }
}
const csvFields = ["id", "name", "username", "email", "disabled", "externalAuth", "twoFA"] as const;

type CsvField = typeof csvFields[number];
