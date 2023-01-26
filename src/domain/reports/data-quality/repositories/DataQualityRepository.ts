import { Config } from "../../../common/entities/Config";
import { PaginatedObjects, Paging, Sorting } from "../../../common/entities/PaginatedObjects";
import { DataQualityItem } from "../entities/DataQualityItem";

export interface DataQualityRepository {
    getIndicators(options: DataQualityOptions, namespace: string): Promise<PaginatedObjects<DataQualityItem>>;
    saveDataQuality(namespace: string, dataQuality: DataQualityItem[]): Promise<void>;
    getProgramIndicators(options: DataQualityOptions, namespace: string): Promise<PaginatedObjects<DataQualityItem>>;
    getColumns(namespace: string): Promise<string[]>;
    saveColumns(namespace: string, columns: string[]): Promise<void>;
}

export interface DataQualityOptions {
    config: Config;
    paging: Paging;
    sorting: Sorting<DataQualityItem>;
}
