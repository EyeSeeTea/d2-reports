import { D2Api } from "../../../types/d2-api";
import { StorageClient } from "../../common/clients/storage/StorageClient";
import { Instance } from "../../common/entities/Instance";
import { DataStoreStorageClient } from "../../common/clients/storage/DataStoreStorageClient";
import { Namespaces } from "../../common/clients/storage/Namespaces";
import { MonitoringRepository } from "../../../domain/reports/mal-data-subscription/repositories/MonitoringRepository";
import { MonitoringValue } from "../../../domain/reports/mal-data-subscription/entities/MalDataSubscriptionItem";

export class MonitoringDataStoreRepository implements MonitoringRepository {
    private globalStorageClient: StorageClient;

    constructor(private api: D2Api, private namespace: string = Namespaces.MONITORING) {
        const instance = new Instance({ url: this.api.baseUrl });
        this.globalStorageClient = new DataStoreStorageClient("global", instance);
    }

    async get(): Promise<MonitoringValue> {
        const monitoring = (await this.globalStorageClient.getObject<MonitoringValue>(this.namespace)) ?? {
            dataElements: [],
        };

        return monitoring;
    }

    async save(monitoring: MonitoringValue): Promise<void> {
        return await this.globalStorageClient.saveObject<MonitoringValue>(this.namespace, monitoring);
    }
}
