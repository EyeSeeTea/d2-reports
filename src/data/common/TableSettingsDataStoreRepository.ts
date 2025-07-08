import { D2Api } from "../../types/d2-api";
import { TableSettingsRepository } from "../../domain/common/repositories/TableSettingsRepository";
import { StorageClient } from "./clients/storage/StorageClient";
import { Instance } from "./entities/Instance";
import { DataStoreStorageClient } from "./clients/storage/DataStoreStorageClient";
import { TableSettings } from "../../domain/common/entities/TableSettings";

export class TableSettingsDataStoreRepository implements TableSettingsRepository {
    private storageClient: StorageClient;

    constructor(private api: D2Api) {
        const instance = new Instance({ url: this.api.baseUrl });
        this.storageClient = new DataStoreStorageClient("user", instance);
    }

    async get(name: string): Promise<TableSettings> {
        const visibleColumns = (await this.storageClient.getObject<string[]>(name)) ?? [];

        return {
            visibleColumns: visibleColumns,
            name: name,
        };
    }

    async save(settings: TableSettings): Promise<void> {
        const { name, visibleColumns } = settings;

        return this.storageClient.saveObject<string[]>(name, visibleColumns);
    }
}
