import { DataValue } from "../entities/DataValue";
import { Id } from "../entities/Base";
import { Config } from "../entities/Config";
import { PaginatedObjects, Paging } from "../entities/PaginatedObjects";

export interface DataValueRepository {
    get(options: GetOptions): Promise<PaginatedObjects<DataValue>>;
}

export interface GetOptions {
    config: Config;
    paging: Paging;
    periods: string[];
    dataSetIds: Id[];
    orgUnitIds: Id[];
}


