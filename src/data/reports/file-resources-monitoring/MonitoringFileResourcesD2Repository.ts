import { D2Api, MetadataPick } from "../../../types/d2-api";
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

import { promiseMap } from "../../../utils/promises";
import { InmemoryCache } from "../../common/cache/InmemoryCache";
import { isValidUid } from "d2/uid";

export const SQL_EVENT_FILERESOURCE_ID = "Rl8JnitnM6X";
export const SQL_DATASETVALUES_FILERESOURCE_ID = "gMg3im4cTYd";

export class MonitoringFileResourcesD2Repository implements MonitoringFileResourcesRepository {
    private storageClient: StorageClient;
    private cache: InmemoryCache = new InmemoryCache();

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
                        in: ["DOCUMENT", "DATA_VALUE", "USER_AVATAR", "MESSAGE_ATTACHMENT"],
                    },
                    name: { $ilike: `${options.filenameQuery}` },
                },
            })
            .getData();

        const refs = await this.getRefs();

        return {
            pager: files.pager,
            objects: files.objects.map(item => this.buildFileResource(refs, item as D2FileResource)),
        };
    }

    private async getDocuments(): Promise<DocumentFileRef[]> {
        return this.cache.getOrPromise("documents", async () => {
            const data = await this.api.models.documents
                .get({
                    fields: { id: true, url: true },
                    paging: false,
                })
                .getData();

            return data.objects.map<DocumentFileRef>(item => {
                return {
                    kind: "document",
                    documentId: item.id,
                    fileResourceId: item.url,
                };
            });
        });
    }

    private async getEventsWithFile(): Promise<EventFileRef[]> {
        return this.cache.getOrPromise("events", async () => {
            const response = await new Dhis2SqlViews(this.api)
                .query<{}, EventSqlField>(SQL_EVENT_FILERESOURCE_ID, undefined, { page: 1, pageSize: 10000 })
                .getData();

            const eventFileResources = response.rows
                .map(row => {
                    const values = Object.values(JSON.parse(row.eventdatavalues)) as { value: string }[];

                    const fileResourceValue = values.find(value => isValidUid(value.value));

                    return {
                        eventuid: row.eventuid,
                        fileresourceuid: fileResourceValue?.value,
                    };
                })
                .map<EventFileRef>(row => {
                    return {
                        kind: "event",
                        eventId: row.eventuid,
                        fileResourceId: row.fileresourceuid || "",
                    };
                })
                .filter(row => row.fileResourceId !== "");

            return eventFileResources;
        });
    }

    private async getDataValuesWithFile(): Promise<DataValueFileRef[]> {
        return this.cache.getOrPromise("dataValues", async () => {
            const response = await new Dhis2SqlViews(this.api)
                .query<{}, DataSetSqlField>(SQL_DATASETVALUES_FILERESOURCE_ID, undefined, { page: 1, pageSize: 10000 })
                .getData();

            const dataValuesFileResource = response.rows.map<DataValueFileRef>(row => ({
                kind: "dataValue",
                fileResourceId: row.fileresourceuid,
                dataElementUid: row.dataelementuid,
                period: row.period,
                categoryOptionComboUid: row.categoryoptioncombouid,
                organisationUnitUid: row.organisationunituid,
            }));

            return dataValuesFileResource;
        });
    }

    private async getUsersWithAvatar(): Promise<UserAvatarFileRef[]> {
        return this.cache.getOrPromise("users", async () => {
            const data = await this.api.models.users
                .get({
                    fields: { id: true, avatar: { id: true } },
                    paging: false,
                    filter: {
                        avatar: { "!null": true },
                    },
                })
                .getData();

            return data.objects.map<UserAvatarFileRef>(item => {
                return {
                    kind: "userAvatar",
                    userId: item.id,
                    fileResourceId: item.avatar?.id || "",
                };
            });
        });
    }

    private async getMessagesWithAttachments(): Promise<MessageAttachmentsFileRef[]> {
        return this.cache.getOrPromise("messages", async () => {
            const data = await this.api.models.messageConversations
                .get({
                    fields: { id: true, lastSender: { id: true }, messages: { id: true, attachments: { id: true } } },
                    paging: false,
                    filter: {
                        "messages.attachments.id": { "!null": true },
                    },
                })
                .getData();

            return data.objects
                .map(item => {
                    const messages = item.messages as { id: string; attachments: { id: string }[] }[];

                    return messages
                        .map(message => {
                            return message.attachments.map(attachment => {
                                return {
                                    kind: "messageAttachment" as const,
                                    messageConversationId: item.id,
                                    messageId: message.id,
                                    fileResourceId: attachment.id,
                                    lastSenderId: item.lastSender.id,
                                };
                            });
                        })
                        .flat()
                        .flat();
                })
                .flat();
        });
    }

    private buildFileResource(refs: FileResourceFileRefs, file: D2FileResource): MonitoringFileResourcesFile {
        const id = getIdByRef(file.id, refs);

        return {
            id: id,
            fileResourceId: file.id,
            name: file.name,
            created: file.created,
            createdBy: file.lastUpdatedBy,
            lastUpdated: file.lastUpdated,
            lastUpdatedBy: file.lastUpdatedBy,
            contentLength: file.contentLength ?? "-",
            href: file.href ?? "-",
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
        const refs = selectedIds.map(id => getRefById(id)).filter((ref): ref is FileRef => ref !== null);

        await promiseMap(refs, async (ref: FileRef) => {
            switch (ref.kind) {
                case "document": {
                    await this.deleteDocument(ref.documentId);
                    break;
                }
                case "event": {
                    await this.deleteEventFile(ref.eventId, ref.fileResourceId);
                    break;
                }
                case "dataValue": {
                    await this.deleteDataSetFile(ref);
                    break;
                }
                case "userAvatar": {
                    await this.deleteUserAvatar(ref);
                    break;
                }
                case "messageAttachment": {
                    await this.deleteMessageAttachment(ref);
                    break;
                }
            }
        });

        this.cache.clear();
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
                pe: dataSetFile.period,
                de: dataSetFile.dataElementUid,
            });
        } catch (error) {
            console.debug(error);
        }
    }

    private async deleteUserAvatar(ref: UserAvatarFileRef): Promise<void> {
        try {
            const data = await this.api.models.users
                .get({ fields: { $owner: true }, filter: { id: { in: [ref.userId] } } })
                .getData();

            const user = data.objects[0];

            if (user) {
                const userNoAvatar = {
                    ...user,
                    avatar: undefined,
                };

                await this.api.put(`/users/${ref.userId}`, undefined, userNoAvatar).getData();
            }
        } catch (error) {
            console.debug(error);
        }
    }

    private async deleteMessageAttachment(ref: MessageAttachmentsFileRef): Promise<void> {
        // Remove messageConversation because remove message or attachment not working
        await this.api.delete(`/messageConversations/${ref.messageConversationId}/${ref.lastSenderId}`).getData();
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

    private async getRefs(): Promise<FileResourceFileRefs> {
        const [docRefs, eventRefs, dataValuesRefs, userRefs, messageAttachments] = await Promise.all([
            this.getDocuments(),
            this.getEventsWithFile(),
            this.getDataValuesWithFile(),
            this.getUsersWithAvatar(),
            this.getMessagesWithAttachments(),
        ]);

        const refs: FileResourceFileRefs = {
            documents: docRefs,
            eventValues: eventRefs,
            dataValues: dataValuesRefs,
            userAvatar: userRefs,
            messageAttachments: messageAttachments,
        };
        return refs;
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
    period: string;
};

type EventSqlField = "eventuid" | "eventdatavalues" | "fileresourceuid";
type DataSetSqlField =
    | "fileresourceuid"
    | "dataelementuid"
    | "period"
    | "categoryoptioncombouid"
    | "organisationunituid";

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
    const ref = getRef(id, refs);

    switch (ref?.kind) {
        case "document":
            return "Document";
        case "event":
            return "Events";
        case "dataValue":
            return "Aggregated";
        case "userAvatar":
            return "UserAvatar";
        case "messageAttachment":
            return "MessageAttachment";
        default:
            return "Orphan";
    }
}

function getIdByRef(id: string, refs: FileResourceFileRefs): string {
    const ref = getRef(id, refs);

    switch (ref?.kind) {
        case "document":
            return `document|${ref.documentId}`;
        case "event":
            return `event|${ref.eventId}|${id}`;
        case "dataValue":
            return `dataValue|${ref.organisationUnitUid}|${ref.period}|${ref.dataElementUid}|${ref.categoryOptionComboUid}|${id}`;
        case "userAvatar":
            return `user|${ref.userId}|${id}`;
        case "messageAttachment":
            return `messageAttachment|${ref.messageConversationId}|${ref.lastSenderId}|${ref.messageId}|${id}`;
        default:
            return "";
    }
}

function getRefById(id: string): FileRef | null {
    const idParts = id.split("|");
    const type = idParts[0];

    const getPart = (partIndex: number) => idParts[partIndex] || "";

    switch (type) {
        case "document":
            return { kind: "document", documentId: getPart(1), fileResourceId: getPart(2) };
        case "event":
            return { kind: "event", eventId: getPart(1), fileResourceId: getPart(2) };
        case "dataValue":
            return {
                kind: "dataValue",
                dataElementUid: getPart(1),
                period: getPart(2),
                categoryOptionComboUid: getPart(3),
                organisationUnitUid: getPart(4),
                fileResourceId: getPart(5),
            };
        case "user":
            return {
                kind: "userAvatar",
                userId: getPart(1),
                fileResourceId: getPart(2),
            };
        case "messageAttachment":
            return {
                kind: "messageAttachment",
                messageConversationId: getPart(1),
                lastSenderId: getPart(2),
                messageId: getPart(3),
                fileResourceId: getPart(4),
            };
        default:
            return null;
    }
}

function getRef(id: string, refs: FileResourceFileRefs): FileRef | null {
    const parentDoc = refs.documents.find(doc => doc.fileResourceId === id);
    const eventValueDoc = refs.eventValues.find(event => event.fileResourceId === id);
    const dataValueDoc = refs.dataValues.find(data => data.fileResourceId === id);
    const userAvatarDoc = refs.userAvatar.find(user => user.fileResourceId === id);
    const messageAttachmentDoc = refs.messageAttachments?.find(message => message.fileResourceId === id);

    return parentDoc ?? eventValueDoc ?? dataValueDoc ?? userAvatarDoc ?? messageAttachmentDoc ?? null;
}

type FileResourceFileRefs = {
    documents: DocumentFileRef[];
    eventValues: EventFileRef[];
    dataValues: DataValueFileRef[];
    userAvatar: UserAvatarFileRef[];
    messageAttachments?: MessageAttachmentsFileRef[];
};

type DocumentFileRef = {
    kind: "document";
    documentId: string;
    fileResourceId: string;
};

type EventFileRef = {
    kind: "event";
    eventId: string;
    fileResourceId: string;
};

type DataValueFileRef = {
    kind: "dataValue";
    fileResourceId: string;
    dataElementUid: string;
    period: string;
    categoryOptionComboUid: string;
    organisationUnitUid: string;
};

type UserAvatarFileRef = {
    kind: "userAvatar";
    userId: string;
    fileResourceId: string;
};

type MessageAttachmentsFileRef = {
    kind: "messageAttachment";
    messageConversationId: string;
    messageId: string;
    fileResourceId: string;
    lastSenderId: string;
};

type FileRef = DocumentFileRef | EventFileRef | DataValueFileRef | UserAvatarFileRef | MessageAttachmentsFileRef;
