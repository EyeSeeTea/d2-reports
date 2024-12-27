import { PaginatedObjects } from "../../../common/entities/PaginatedObjects";
import { MonitoringFileResourcesFile } from "./MonitoringFileResourcesFile";

export interface MonitoringFileResourcesPaginatedObjects<T> extends PaginatedObjects<T> {
    files: MonitoringFileResourcesFile[];
}
