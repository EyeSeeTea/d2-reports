import { Config } from "../../common/entities/Config";
import { PaginatedObjects } from "../../common/entities/PaginatedObjects";
import { DataValue } from "../../entities/DataValue";
import { DataValueItem } from "../entities/DataValueItem";

export interface DataValueRepository {
    get(config: Config): Promise<PaginatedObjects<Array<DataValueItem>>>;
    push(dataValues: DataValue[], remove: boolean): Promise<boolean | undefined>;
}
