import { D2Api } from "../../../types/d2-api";
import { StorageClient } from "../../common/clients/storage/StorageClient";
import { Instance } from "../../common/entities/Instance";
import { DataStoreStorageClient } from "../../common/clients/storage/DataStoreStorageClient";
import { Namespaces } from "../../common/clients/storage/Namespaces";
import { MonitoringRepository } from "../../../domain/reports/mal-data-subscription/repositories/MonitoringRepository";
import { Monitoring } from "../../../domain/reports/mal-data-subscription/entities/Monitoring";

export class MonitoringDataStoreRepository implements MonitoringRepository {
    private globalStorageClient: StorageClient;
    private namespace: string = Namespaces.MONITORING;

    constructor(private api: D2Api) {
        const instance = new Instance({ url: this.api.baseUrl });
        this.globalStorageClient = new DataStoreStorageClient("global", instance);
    }

    async get(): Promise<Monitoring> {
        const monitoring = await this.globalStorageClient.getObject<Monitoring>(this.namespace);

        return monitoring ?? { dataElements: [] };
    }

    async save(monitoring: Monitoring): Promise<void> {
        return await this.globalStorageClient.saveObject<Monitoring>(this.namespace, monitoring);
    }
}
