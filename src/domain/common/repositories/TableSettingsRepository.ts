import { TableSettings } from "../entities/TableSettings";

export interface TableSettingsRepository {
    get<T>(name: string): Promise<TableSettings<T>>;
    save<T>(settings: TableSettings<T>): Promise<void>;
}
