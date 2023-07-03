import { Id } from "../entities/Base";
import { DataForm } from "../entities/DataForm";
import { Period } from "../entities/DataValue";

export interface DataFormRepository {
    get(options: { id: Id; period: Period; orgUnitId: Id }): Promise<DataForm>;
}
