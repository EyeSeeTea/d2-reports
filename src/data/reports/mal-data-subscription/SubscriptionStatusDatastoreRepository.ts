import { D2Api } from "../../../types/d2-api";
import { SubscriptionStatusRepository } from "../../../domain/reports/mal-data-subscription/repositories/SubscriptionStatusRepository";
import { StorageClient } from "../../common/clients/storage/StorageClient";
import { Instance } from "../../common/entities/Instance";
import { DataStoreStorageClient } from "../../common/clients/storage/DataStoreStorageClient";
import { SubscriptionStatus } from "../../../domain/reports/mal-data-subscription/entities/SubscriptionStatus";
import { Namespaces } from "../../common/clients/storage/Namespaces";

export class SubscriptionStatusDatastoreRepository implements SubscriptionStatusRepository {
    private globalStorageClient: StorageClient;

    constructor(private api: D2Api, private namespace: string = Namespaces.MAL_SUBSCRIPTION_STATUS) {
        const instance = new Instance({ url: this.api.baseUrl });
        this.globalStorageClient = new DataStoreStorageClient("global", instance);
    }

    async get(): Promise<SubscriptionStatus[]> {
        const subscription = await this.globalStorageClient.getObject<SubscriptionStatus[]>(this.namespace);

        return subscription ?? [];
    }

    async save(subscription: SubscriptionStatus[]): Promise<void> {
        return await this.globalStorageClient.saveObject<SubscriptionStatus[]>(this.namespace, subscription);
    }
}
