import { D2Api } from "../../types/d2-api";
import { TableSettingsRepository } from "../../domain/common/repositories/TableSettingsRepository";
import { StorageClient } from "./clients/storage/StorageClient";
import { Instance } from "./entities/Instance";
import { DataStoreStorageClient } from "./clients/storage/DataStoreStorageClient";
import { TableSettings } from "../../domain/common/entities/TableSettings";

export class TableSettingsDataStoreRepository implements TableSettingsRepository {
    private storageClient: StorageClient;

    constructor(private api: D2Api) {
        const instance = Instance.fromInstance(api);
        this.storageClient = new DataStoreStorageClient("user", instance);
    }

    async get<T>(name: string): Promise<TableSettings<T>> {
        const visibleColumns = (await this.storageClient.getObject<Array<keyof T>>(name)) ?? [];

        return {
            visibleColumns: visibleColumns,
            name: name,
        };
    }

    async save<T>(settings: TableSettings<T>): Promise<void> {
        const { name, visibleColumns } = settings;

        return this.storageClient.saveObject<Array<keyof T>>(name, visibleColumns);
    }
}
