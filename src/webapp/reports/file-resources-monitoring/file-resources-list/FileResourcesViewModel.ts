import {
    getSizeInMB,
    MonitoringFileResourcesFile,
} from "../../../../domain/reports/file-resources-monitoring/entities/MonitoringFileResourcesFile";

export interface FileResourcesViewModel {
    id: string;
    name: string;
    created: string;
    createdBy: string;
    lastUpdated: string;
    lastUpdatedBy: string;
    size: string;
    contentLength: number;
    href: string;
}

export function getFileResourcesMonitoringViews(items: MonitoringFileResourcesFile[]): FileResourcesViewModel[] {
    return items.map(item => {
        return {
            id: item.id,
            name: item.name,
            created: item.created !== undefined ? item.created : "-",
            createdBy: item.createdBy !== undefined ? item.createdBy.name : "-",
            lastUpdatedBy: item.lastUpdatedBy !== undefined ? item.lastUpdatedBy.name : "-",
            lastUpdated: item.lastUpdated !== undefined ? item.lastUpdated : "-",
            size: item.contentLength !== undefined ? String(getSizeInMB(item)) : "-",
            contentLength: parseInt(item.contentLength) ?? 0,
            href: item.href,
        };
    });
}
