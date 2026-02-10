import { MonitoringFileResourcesPaginatedObjects } from "../entities/MonitoringFileResourcesPaginatedObjects";
import { MonitoringFileResourcesFile } from "../entities/MonitoringFileResourcesFile";
import { MonitoringFileResourcesOptions } from "../entities/MonitoringFileResourcesOptions";

export interface MonitoringFileResourcesRepository {
    get(
        options: MonitoringFileResourcesOptions
    ): Promise<MonitoringFileResourcesPaginatedObjects<MonitoringFileResourcesFile>>;
    save(fileName: string, items: MonitoringFileResourcesFile[]): Promise<void>;
    delete(selectedIds: string[]): Promise<void>;
    getColumns(namespace: string): Promise<string[]>;
    saveColumns(namespace: string, columns: string[]): Promise<void>;
}
