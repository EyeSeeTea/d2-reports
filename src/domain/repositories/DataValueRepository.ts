import { DataValue } from "../entities/DataValue";
import { Id } from "../entities/Base";
import { Config } from "../entities/Config";

export interface DataValueRepository {
    get(options: GetOptions): Promise<DataValue[]>;
}

export interface GetOptions {
    config: Config;
    periods: string[];
    dataSets: Id[];
}
