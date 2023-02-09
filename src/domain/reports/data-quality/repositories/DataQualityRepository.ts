import { Config } from "../../../common/entities/Config";
import { PaginatedObjects, Paging, Sorting } from "../../../common/entities/PaginatedObjects";
import { IndicatorItem, ProgramIndicatorItem } from "../entities/DataQualityItem";

export interface DataQualityRepository {
    getIndicators(options: IndicatorOptions, namespace: string): Promise<PaginatedObjects<IndicatorItem>>;
    saveDataQuality(namespace: string, dataQuality: IndicatorItem[] | ProgramIndicatorItem[]): Promise<void>;
    getProgramIndicators(
        options: ProgramIndicatorOptions,
        namespace: string
    ): Promise<PaginatedObjects<ProgramIndicatorItem>>;
    getColumns(namespace: string): Promise<string[]>;
    saveColumns(namespace: string, columns: string[]): Promise<void>;
}

export interface IndicatorOptions {
    config: Config;
    paging: Paging;
    sorting: Sorting<IndicatorItem>;
}

export interface ProgramIndicatorOptions {
    config: Config;
    paging: Paging;
    sorting: Sorting<ProgramIndicatorItem>;
}
