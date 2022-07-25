import { PaginatedObjects } from "../../common/entities/PaginatedObjects";
import { DataValue } from "../../entities/DataValue";

export interface DataValueRepository {
    get(): Promise<PaginatedObjects<DataValue>>;
    push(dataValues: DataValue[], remove: boolean): Promise<boolean | undefined>;
}
