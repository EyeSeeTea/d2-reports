import { Id, NamedRef } from "../../../common/entities/Base";

export interface MonitoringFileResourcesFile {
    id: Id;
    name: string;
    createdBy: NamedRef;
    created: string;
    lastUpdatedBy: NamedRef;
    lastUpdated: string;
    contentLength: string;
    href: string;
}

export function getSizeInMB(file: MonitoringFileResourcesFile): string {
    const sizeInMB = parseFloat(file.contentLength) / (1024 * 1024);
    const truncatedSize = Math.floor(sizeInMB * 100) / 100;
    return `${truncatedSize} MB`;
}
