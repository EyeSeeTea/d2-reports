import { TableSettings } from "../entities/TableSettings";

export interface TableSettingsRepository {
    get(name: string): Promise<TableSettings>;
    save(settings: TableSettings): Promise<void>;
}
