import _ from "lodash";
import { D2Api } from "../../../types/d2-api";
import { DataStoreStorageClient } from "../../common/clients/storage/DataStoreStorageClient";
import { StorageClient } from "../../common/clients/storage/StorageClient";
import { CsvData } from "../../common/CsvDataSource";
import { CsvWriterDataSource } from "../../common/CsvWriterCsvDataSource";
import { Instance } from "../../common/entities/Instance";
import { downloadFile } from "../../common/utils/download-file";
import { MonitoringFileResourcesOptions } from "../../../domain/reports/file-resources-monitoring/entities/MonitoringFileResourcesOptions";
import {
    FileResourceType,
    formatBytes,
    MonitoringFileResourcesFile,
} from "../../../domain/reports/file-resources-monitoring/entities/MonitoringFileResourcesFile";
import { MonitoringFileResourcesPaginatedObjects } from "../../../domain/reports/file-resources-monitoring/entities/MonitoringFileResourcesPaginatedObjects";
import { Dhis2SqlViews } from "../../common/Dhis2SqlViews";
import { MonitoringFileResourcesRepository } from "../../../domain/reports/file-resources-monitoring/repositories/MonitoringFileResourcesRepository";
import { MetadataPick } from "@eyeseetea/d2-api/2.36";
import { Id } from "../../../domain/common/entities/Base";
import { promiseMap } from "../../../utils/promises";

export const SQL_EVENT_FILERESOURCE_ID = "kMGTBR65nue";
export const SQL_DATASETVALUES_FILERESOURCE_ID = "gMg3im4cTYd";
export const SQL_DOCUMENT_FILERESOURCE = "NJ9a3HivW8W";

type FileResourceFileRefs = {
    documents: Document[];
    tei: string[];
    events: string[];
};

type Document = {
    documentId: string;
    fileResourceId: string;
};

export class MonitoringFileResourcesD2Repository implements MonitoringFileResourcesRepository {
    private storageClient: StorageClient;

    constructor(private api: D2Api) {
        const instance = new Instance({ url: this.api.baseUrl });
        this.storageClient = new DataStoreStorageClient("user", instance);
    }

    async get(
        options: MonitoringFileResourcesOptions
    ): Promise<MonitoringFileResourcesPaginatedObjects<MonitoringFileResourcesFile>> {
        const { paging, sorting } = options;

        const files = await this.api.models.fileResources
            .get({
                fields: fileResourcesFields,
                page: paging.page,
                pageSize: paging.pageSize,
                order: `${sorting.field}:${sorting.direction}`,
                filter: {
                    domain: {
                        in: ["DOCUMENT"],
                    },
                },
            })
            .getData();

        const ids = files.objects.map(item => item.id);

        const [docRefs, teiRefs = [], eventRefs = []] = await Promise.all([this.getDocumentResourceFileIds(ids)]);

        const refs = {
            documents: docRefs,
            tei: teiRefs,
            events: eventRefs,
        };

        return {
            pager: files.pager,
            objects: files.objects.map(item => this.buildFileResource(refs, item as D2FileResource)),
        };

        // const objects = await this.getFileResources();

        // const filteredRows = await this.getFilteredRows(objects, options);

        // const { pager, objects: rowsInPage } = paginate(filteredRows, paging, sorting);
        // return {
        //     pager: pager,
        //     objects: rowsInPage,
        //     files: objects,
        // };
    }

    async getDocumentResourceFileIds(ids: string[]): Promise<Document[]> {
        if (ids.length === 0) return [];

        const data = await this.api.models.documents
            .get({
                fields: { id: true, url: true },
                filter: { url: { in: ids } },
            })
            .getData();

        return data.objects.map(item => {
            return {
                documentId: item.id,
                fileResourceId: item.url,
            };
        });
    }

    private buildFileResource(refs: FileResourceFileRefs, file: D2FileResource): MonitoringFileResourcesFile {
        return {
            id: file.id,
            name: file.name,
            created: file.created,
            createdBy: file.createdBy,
            lastUpdated: file.lastUpdated,
            lastUpdatedBy: file.lastUpdatedBy,
            contentLength: file.contentLength ?? "-",
            href: file.href ?? "-",
            action_url: "",
            type: getFileResourceType(file.id, refs),
        };
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
            size: formatBytes(file),
            href: file.href,
            type: file.type,
        }));

        const csvDataSource = new CsvWriterDataSource();
        const csvData: CsvData<CsvField> = { headers, rows };
        const csvContents = csvDataSource.toString(csvData);

        return await downloadFile(csvContents, filename, "text/csv");
    }

    async delete(selectedIds: string[]): Promise<void> {
        const [docRefs, teiRefs = [], eventRefs = []] = await Promise.all([
            this.getDocumentResourceFileIds(selectedIds),
        ]);

        const refs = {
            documents: docRefs,
            tei: teiRefs,
            events: eventRefs,
        };

        await promiseMap(selectedIds, async (id: string) => {
            const type = getFileResourceType(id, refs);

            if (type === "Document") {
                const parentId = getParentId(id, refs);

                if (parentId) {
                    await this.deleteDocument(parentId);
                }
            }
        });
    }

    // async delete(selectedIds: string[]): Promise<void> {
    //     const datavalueMap = await this.getDataSetValueFileResources();
    //     const documentsMap = await this.getDocumentAndFileResourcesUIds();
    //     const eventMap = await this.getEventFileResources();

    //     const deleteActions = selectedIds.map(id => {
    //         if (id in datavalueMap) {
    //             const dataValueInfo = datavalueMap[id];
    //             if (dataValueInfo !== undefined) {
    //                 return this.deleteDataSetFile(dataValueInfo);
    //             }
    //         } else if (id in documentsMap) {
    //             const document = documentsMap[id];
    //             if (document !== undefined) {
    //                 return this.deleteDocument(id);
    //             }
    //         } else if (id in eventMap) {
    //             const event = eventMap[id];
    //             if (event !== undefined) {
    //                 return this.deleteEventFile(event, id);
    //             }
    //         }
    //         console.warn(`ID ${id} not found`);
    //         return Promise.resolve();
    //     });

    //     await Promise.all(deleteActions);
    // }

    async getColumns(namespace: string): Promise<string[]> {
        const columns = await this.storageClient.getObject<string[]>(namespace);

        return columns ?? [];
    }

    async saveColumns(namespace: string, columns: string[]): Promise<void> {
        return this.storageClient.saveObject<string[]>(namespace, columns);
    }

    private async deleteDocument(id: string) {
        await this.api.models.documents.delete({ id: id }).getData();
    }

    private async deleteDataSetFile(dataSetFile: DataSetValueFileResource) {
        try {
            await this.api.delete("/dataValues", {
                ou: dataSetFile.organisationUnitUid,
                pe: dataSetFile.startDate,
                de: dataSetFile.dataElementUid,
            });
        } catch (error) {
            console.debug(error);
        }
    }

    private async deleteEventFile(eventId: string, fileResourceId: string): Promise<void> {
        try {
            const eventResponse = await this.api.events
                .get({
                    fields: {
                        id: true,
                        dataValues: { dataElement: true, value: true },
                        event: true,
                        orgUnit: true,
                        program: true,
                        programStage: true,
                        status: true,
                        eventDate: true,
                    },
                    event: eventId,
                })
                .getData();

            const event = eventResponse.events[0];
            if (!event) {
                throw new Error(`Event not found ${eventId}`);
            }

            const filteredDataValues = event.dataValues.filter(dv => dv.value !== fileResourceId);

            const payload = {
                events: [
                    {
                        dataValues: filteredDataValues,
                        event: eventId,
                        orgUnit: event.orgUnit,
                        program: event.program,
                        status: event.status,
                        eventDate: event.eventDate,
                        programStage: event.programStage,
                    },
                ],
            };
            this.api.events.post({}, payload);
        } catch (error) {
            console.debug(error);
        }
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

    private async getDocumentAndFileResourcesUIds(): Promise<Record<string, string>> {
        const response = await new Dhis2SqlViews(this.api)
            .query<{}, DocumentSqlField>(SQL_DOCUMENT_FILERESOURCE, undefined, {})
            .getData();

        const documentFileResourceMap = response.rows.reduce<Record<string, string>>((acc, row) => {
            if (row.fileresourceuid && row.documentuid) {
                acc[row.fileresourceuid] = row.documentuid;
            }
            acc[row.fileresourceuid] = row.documentuid;
            return acc;
        }, {});

        return documentFileResourceMap;
    }

    private async getEventFileResources(): Promise<Record<string, string>> {
        const response = await new Dhis2SqlViews(this.api)
            .query<{}, EventSqlField>(SQL_EVENT_FILERESOURCE_ID, undefined, { page: 1, pageSize: 10000 })
            .getData();

        const eventFileResourceMap = response.rows.reduce<Record<string, string>>((acc, row) => {
            if (row.fileresourceuid && row.eventuid) {
                acc[row.fileresourceuid] = row.eventuid;
            }
            acc[row.fileresourceuid] = row.eventuid;
            return acc;
        }, {});
        return eventFileResourceMap;
    }

    private async getDataSetValueFileResources(): Promise<Record<string, DataSetValueFileResource>> {
        const response = await new Dhis2SqlViews(this.api)
            .query<{}, DataSetSqlField>(SQL_DATASETVALUES_FILERESOURCE_ID, undefined, { page: 1, pageSize: 10000 })
            .getData();

        const dataSetValueResourceMap = response.rows.reduce<Record<string, DataSetValueFileResource>>((acc, row) => {
            acc[row.fileresourceuid] = {
                dataElementUid: row.dataelementuid,
                organisationUnitUid: row.organisationunituid,
                categoryOptionComboUid: row.categoryoptioncombouid,
                startDate: row.startdate,
            };
            return acc;
        }, {});

        return dataSetValueResourceMap;
    }

    private async getFileResources(): Promise<MonitoringFileResourcesFile[]> {
        let files: MonitoringFileResourcesFile[] = [];
        let currentPage = 1;
        let response;
        const pageSize = 250;
        const documentFileResource = await this.getDocumentAndFileResourcesUIds();
        const eventFileResources = await this.getEventFileResources();
        const datasetFileresources = await this.getDataSetValueFileResources();
        try {
            do {
                const filter = ["DATA_VALUE", "DOCUMENT"];
                response = await this.getFileResourcesQuery(response, currentPage, pageSize, filter);

                const responseFiles: MonitoringFileResourcesFile = response.objects.map((file: any) => {
                    return {
                        id: file.id,
                        name: file.name,
                        created: file.created,
                        createdBy: file.createdBy,
                        lastUpdated: file.lastUpdated,
                        lastUpdatedBy: file.lastUpdatedBy,
                        contentLength: file.contentLength ?? "-",
                        href: file.href ?? "-",
                        action_url: getActionUrl(
                            file.id,
                            eventFileResources,
                            datasetFileresources,
                            documentFileResource
                        ),
                        type: getType(file.id, eventFileResources, datasetFileresources, file.domain),
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

    private async getFileResourcesQuery(response: any, currentPage: number, pageSize: number, filter: string[]) {
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
                    domain: true,
                },
                filter: {
                    domain: {
                        in: filter,
                    },
                },
                page: currentPage,
                pageSize: pageSize,
            })
            .getData();
        return response;
    }
}

const csvFields = [
    "id",
    "name",
    "createdBy",
    "created",
    "lastUpdatedBy",
    "lastUpdated",
    "size",
    "href",
    "type",
] as const;

type CsvField = typeof csvFields[number];

type DataSetValueFileResource = {
    dataElementUid: string;
    organisationUnitUid: string;
    categoryOptionComboUid: string;
    startDate: string;
};

type DocumentSqlField = "documentuid" | "fileresourceuid";
type EventSqlField = "eventuid" | "fileresourceuid";
type DataSetSqlField =
    | "fileresourceuid"
    | "dataelementuid"
    | "startdate"
    | "categoryoptioncombouid"
    | "organisationunituid"
    | "fileresourceuid";

function getType(
    id: any,
    eventIdFileResources: Record<string, string>,
    datasetFileresources: Record<string, DataSetValueFileResource>,
    domain: string
): FileResourceType {
    if (domain === "DATA_VALUE") {
        if (id in datasetFileresources) {
            return "Aggregated";
        } else if (id in eventIdFileResources) {
            return "Individual";
        }
    }
    if (domain === "DOCUMENT") return "Document";
    return "Unknown";
}

function getActionUrl(
    id: any,
    eventIdFileResources: Record<string, string>,
    datasetFileresources: Record<string, DataSetValueFileResource>,
    documentFileresources: Record<string, string>
): string {
    if (id in eventIdFileResources) {
        return `api/event/${eventIdFileResources[id]}`;
    } else if (id in datasetFileresources) {
        return `api/dataValues?de=${datasetFileresources[id]?.dataElementUid}&co=${datasetFileresources[id]?.categoryOptionComboUid}&ou=${datasetFileresources[id]?.organisationUnitUid}&pe=${datasetFileresources[id]?.startDate}`;
    } else if (id in documentFileresources) {
        return `api/document/${documentFileresources[id]}`;
    }
    return "-";
}

const fileResourcesFields = {
    id: true,
    name: true,
    created: true,
    lastUpdated: true,
    createdBy: {
        id: true,
        name: true,
    },
    lastUpdatedBy: {
        id: true,
        name: true,
    },
    contentLength: true,
    href: true,
    domain: true,
} as const;

type D2FileResource = MetadataPick<{ fileResources: { fields: typeof fileResourcesFields } }>["fileResources"][number];

function getFileResourceType(id: string, refs: FileResourceFileRefs): FileResourceType {
    if (refs.documents.find(doc => doc.fileResourceId === id)) {
        return "Document";
    } else if (id in refs.tei) {
        return "Individual";
    } else if (id in refs.events) {
        return "Aggregated";
    }
    return "Unknown";
}

function getParentId(id: string, refs: FileResourceFileRefs): Id {
    const parentDoc = refs.documents.find(doc => doc.fileResourceId === id);

    if (parentDoc) {
        return parentDoc.documentId;
    } else {
        return "";
    }
}
