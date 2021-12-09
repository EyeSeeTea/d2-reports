import { DataSet } from "../entities/DataSet";
import { Id } from "../entities/Base";
import { Config } from "../entities/Config";
import { PaginatedObjects, Paging, Sorting } from "../entities/PaginatedObjects";

export interface DataSetRepository {
    get(options: DataSetRepositoryGetOptions): Promise<PaginatedObjects<DataSet>>;
    save(filename: string, dataSets: DataSet[]): Promise<void>;
}

export interface DataSetRepositoryGetOptions {
    config: Config;
    paging: Paging;
    sorting: Sorting<DataSet>;
    periods: string[];
    orgUnitIds: Id[];
    dataSetIds: Id[];
    sectionIds: Id[];
}
