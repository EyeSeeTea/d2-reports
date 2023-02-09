import { Id } from "../entities/Base";
import { DataForm, DataFormValue, Period } from "../entities/DataForm";

export interface DataFormRepository {
    get(options: { id: Id }): Promise<DataForm>;
    getValues(options: { id: Id; orgUnitId: Id; period: Period }): Promise<DataFormValue[]>;
    saveValue(dataValue: DataFormValue): Promise<void>;
}
