import { DataValue } from "../entities/DataValue";
import { Id } from "../entities/Base";
import { Config } from "../entities/Config";
import { PaginatedObjects, Paging, Sorting } from "../entities/PaginatedObjects";

export interface DataValueRepository {
    get(options: DataValueRepositoryGetOptions): Promise<PaginatedObjects<DataValue>>;
}

export interface DataValueRepositoryGetOptions {
    // TODO: Don't pass full config
    config: Config;
    paging: Paging;
    sorting: Sorting<DataValue>;
    periods: string[];
    orgUnitIds: Id[];
    dataSetIds: Id[];
    dataElementGroupIds: Id[];
}
