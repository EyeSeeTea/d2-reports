import { DataElementTotal } from "../../../domain/reports/nhwa-auto-complete-compute/entities/AutoCompleteComputeSettings";
import { AutoCompleteComputeSettingsRepository } from "../../../domain/reports/nhwa-auto-complete-compute/repositores/AutoCompleteComputeSettingsRepository";
import { D2Api } from "../../../types/d2-api";
import { d2ReportsDataStoreNamespace } from "../../common/clients/storage/Namespaces";

export class AutoCompleteComputeSettingsD2Repository implements AutoCompleteComputeSettingsRepository {
    constructor(private api: D2Api) {}

    async get(): Promise<DataElementTotal[]> {
        const key = "nhwa-auto-complete-compute";
        const dataStore = this.api.dataStore(d2ReportsDataStoreNamespace);
        const config = await dataStore.get<DataElementTotal[]>(key).getData();
        if (!config) {
            throw Error(`Could not load configuration from dataStore: ${d2ReportsDataStoreNamespace}/${key}`);
        }
        return config;
    }
}
