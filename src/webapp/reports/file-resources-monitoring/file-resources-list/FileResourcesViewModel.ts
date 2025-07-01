import {
    FileResourceType,
    formatBytes,
    MonitoringFileResourcesFile,
} from "../../../../domain/reports/file-resources-monitoring/entities/MonitoringFileResourcesFile";

export interface FileResourcesViewModel {
    id: string;
    fileResourceId: string;
    name: string;
    created: string;
    createdBy: string;
    lastUpdated: string;
    lastUpdatedBy: string;
    size: string;
    contentLength: number;
    href: string;
    type: FileResourceType;
    contentMd5: string;
}

export function getFileResourcesMonitoringViews(items: MonitoringFileResourcesFile[]): FileResourcesViewModel[] {
    return items.map(item => {
        return {
            fileResourceId: item.fileResourceId,
            id: item.id,
            name: item.name,
            created: item.created !== undefined ? item.created : "-",
            createdBy: item.createdBy !== undefined ? item.createdBy.name : "-",
            lastUpdatedBy: item.lastUpdatedBy !== undefined ? item.lastUpdatedBy.name : "-",
            lastUpdated: item.lastUpdated !== undefined ? item.lastUpdated : "-",
            size: item.contentLength !== undefined ? String(formatBytes(item)) : "-",
            contentLength: parseInt(item.contentLength) ?? 0,
            href: item.href,
            type: item.type,
            contentMd5: item.contentMd5,
        };
    });
}
