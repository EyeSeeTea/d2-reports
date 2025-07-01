import { Id, NamedRef } from "../../../common/entities/Base";

export interface MonitoringFileResourcesFile {
    id: Id;
    fileResourceId: string;
    name: string;
    createdBy: NamedRef;
    created: string;
    lastUpdatedBy: NamedRef;
    lastUpdated: string;
    contentLength: string;
    href: string;
    type: FileResourceType;
    contentMd5: string;
    ownerUrl?: string;
}

export function formatBytes(file: MonitoringFileResourcesFile): string {
    const bytes = parseFloat(file.contentLength);

    if (bytes === 0 || isNaN(bytes)) return "0 Bytes";

    const k = 1024;
    const dm = 1;

    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB"];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    const value = parseFloat((bytes / Math.pow(k, i)).toFixed(dm));

    return `${value} ${sizes[i]}`;
}

export type FileResourceType = "Document" | "Aggregated" | "Events" | "UserAvatar" | "MessageAttachment" | "Orphan";
