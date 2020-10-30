import { DataValue } from "../entities/DataValue";
import { Id, Ref } from "../entities/Base";
import { Config } from "../entities/Config";
import { PaginatedObjects, Paging, Sorting } from "../entities/PaginatedObjects";

export interface DataValueRepository {
    get(options: GetOptions): Promise<PaginatedObjects<DataValue>>;
}

export interface GetOptions {
    config: Config;
    paging: Paging;
    sorting: Sorting<DataValue>;
    periods: string[];
    dataSetIds: Id[];
    orgUnitIds: Id[];
}
