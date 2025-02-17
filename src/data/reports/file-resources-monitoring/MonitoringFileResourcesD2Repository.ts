import _ from "lodash";
import { D2Api } from "../../../types/d2-api";
import { DataStoreStorageClient } from "../../common/clients/storage/DataStoreStorageClient";
import { StorageClient } from "../../common/clients/storage/StorageClient";
import { CsvData } from "../../common/CsvDataSource";
import { CsvWriterDataSource } from "../../common/CsvWriterCsvDataSource";
import { Instance } from "../../common/entities/Instance";
import { downloadFile } from "../../common/utils/download-file";
import { Pagination } from "../mal-data-approval/MalDataApprovalDefaultRepository";
import { MonitoringFileResourcesOptions } from "../../../domain/reports/file-resources-monitoring/entities/MonitoringFileResourcesOptions";
import {
    getSizeInMB,
    MonitoringFileResourcesFile,
} from "../../../domain/reports/file-resources-monitoring/entities/MonitoringFileResourcesFile";
import { paginate } from "../../../domain/common/entities/PaginatedObjects";
import { MonitoringFileResourcesPaginatedObjects } from "../../../domain/reports/file-resources-monitoring/entities/MonitoringFileResourcesPaginatedObjects";
import { MonitoringFileResourcesRepository } from "../../../domain/reports/file-resources-monitoring/repositories/MonitoringFileResourcesRepository";

export class MonitoringFileResourcesD2Repository implements MonitoringFileResourcesRepository {
    private storageClient: StorageClient;

    constructor(private api: D2Api) {
        const instance = new Instance({ url: this.api.baseUrl });
        this.storageClient = new DataStoreStorageClient("user", instance);
    }

    async delete(ids: string[]): Promise<void> {
        const deletePromises = ids.map(async id => {
            try {
                await this.api.models.fileResources.delete({ id: id }).getData();
            } catch (error) {
                console.debug(error);
            }
        });

        await Promise.all(deletePromises);
    }

    async get(
        options: MonitoringFileResourcesOptions
    ): Promise<MonitoringFileResourcesPaginatedObjects<MonitoringFileResourcesFile>> {
        const { paging, sorting } = options;
        const objects = await this.getFileResources();

        const filteredRows = await this.getFilteredRows(objects, options);

        const { pager, objects: rowsInPage } = paginate(filteredRows, sorting, paging);
        return {
            pager: pager,
            objects: rowsInPage,
            files: objects,
        };
    }

    private async getFilteredRows(
        objects: MonitoringFileResourcesFile[],
        options: MonitoringFileResourcesOptions
    ): Promise<MonitoringFileResourcesFile[]> {
        const { filenameQuery } = options;

        return objects.filter(row => {
            const isInSearchQuery = _.includes(row.name, filenameQuery);

            return isInSearchQuery;
        });
    }

    private async getFileResources(): Promise<MonitoringFileResourcesFile[]> {
        let files: MonitoringFileResourcesFile[] = [];
        let currentPage = 1;
        let response;
        const pageSize = 250;
        try {
            do {
                response = await this.api.models.fileResources
                    .get({
                        fields: {
                            id: true,
                            name: true,
                            created: true,
                            lastUpdated: true,
                            createdBy: {
                                name: true,
                            },
                            lastUpdatedBy: {
                                name: true,
                            },
                            href: true,
                            contentLength: true,
                        },
                        filter: {
                            domain: {
                                eq: "DATA_VALUE",
                            },
                        },
                        page: currentPage,
                        pageSize: pageSize,
                    })
                    .getData();

                const responseFiles = response.objects.map((file: any) => {
                    return {
                        id: file.id,
                        name: file.name,
                        created: file.created,
                        createdBy: file.createdBy,
                        lastUpdated: file.lastUpdated,
                        lastUpdatedBy: file.lastUpdatedBy,
                        contentLength: file.contentLength ?? "-",
                        href: file.href ?? "-",
                    };
                });
                files = files.concat(responseFiles);
                currentPage++;
            } while (response.pager.page < Math.ceil(response.pager.total / pageSize));
            return files;
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

    async save(filename: string, files: MonitoringFileResourcesFile[]): Promise<void> {
        const headers = csvFields.map(field => ({ id: field, text: field }));
        const rows = files.map(file => ({
            id: file.id,
            name: file.name,
            createdBy: file.createdBy.name,
            created: file.created,
            lastUpdatedBy: file.lastUpdatedBy?.name ?? "-",
            lastUpdated: file.lastUpdated,
            size: getSizeInMB(file),
            href: file.href,
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
const csvFields = ["id", "name", "createdBy", "created", "lastUpdatedBy", "lastUpdated", "size", "href"] as const;

type CsvField = typeof csvFields[number];
