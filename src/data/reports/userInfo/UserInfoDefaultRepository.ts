import _ from "lodash";
import { User } from "../../../domain/common/entities/User";
import {
    UserInfoRepository,
    UserInfoRepositoryGetOptions,
} from "../../../domain/reports/userinfo/repositories/UserInfoRepository";
import { D2Api, PaginatedObjects } from "../../../types/d2-api";
import { DataStoreStorageClient } from "../../common/clients/storage/DataStoreStorageClient";
import { Namespaces } from "../../common/clients/storage/Namespaces";
import { StorageClient } from "../../common/clients/storage/StorageClient";
import { CsvData } from "../../common/CsvDataSource";
import { CsvWriterDataSource } from "../../common/CsvWriterCsvDataSource";
import { Instance } from "../../common/entities/Instance";
import { downloadFile } from "../../common/utils/download-file";
import { Pagination } from "../mal-data-approval/MalDataApprovalDefaultRepository";

export class UserInfoDefaultRepository implements UserInfoRepository {
    private storageClient: StorageClient;

    constructor(private api: D2Api) {
        const instance = new Instance({ url: this.api.baseUrl });
        this.storageClient = new DataStoreStorageClient("user", instance);
    }

    async getUserTwoFactorInfo(options: UserInfoRepositoryGetOptions): Promise<PaginatedObjects<User>> {
        const { config } = options;
        const { paging, sorting } = options;
        //const paging = { page: 1, pageSize: 10000 };

        //const { sorting } = options; //options
        const metadataResult: any = await this.api.metadata.d2Api
            .get(
                "users.json?fields=userCredentials[id,username,email,name,shortName,disabled,externalAuth,twoFA]&paging=false&filter=userCredentials.disabled:eq:false&filter=userCredentials.externalAuth:eq:false&filter=userCredentials.twoFA:eq:false&rootJunction=AND&order=firstName:asc"
            )
            .getData();

        const rows: Array<User> = [];
        for (const user of metadataResult["users"]) {
            const row: User = {
                id: user["userCredentials"].id,
                name: user["userCredentials"].name,
                username: user["userCredentials"].username,
                externalAuth: user["userCredentials"].externalAuth,
                disabled: user["userCredentials"].disabled,
                email: user["userCredentials"].email,
                twoFA: user["userCredentials"].twoFA,
            };
            rows.push(row);
        }
        /*         const rowsSorted = _(rows)
            .orderBy([row => row[sorting.field]], [sorting.direction])
            .value(); */

        return this.paginate(rows, paging);
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
