import { Paging, Sorting } from "../../../common/entities/PaginatedObjects";
import { MonitoringFileResourcesFile } from "./MonitoringFileResourcesFile";

export interface MonitoringFileResourcesOptions {
    paging: Paging;
    sorting: Sorting<MonitoringFileResourcesFile>;
    filenameQuery: string;
}
