import { PaginatedObjects } from "../../../domain/common/entities/PaginatedObjects";
import { DataQualityConfig, DataQualityItem } from "../../../domain/reports/data-quality/entities/DataQualityItem";
import {
    DataQualityOptions,
    DataQualityRepository,
} from "../../../domain/reports/data-quality/repositories/DataQualityRepository";
import { D2Api } from "../../../types/d2-api";
import { DataStoreStorageClient } from "../../common/clients/storage/DataStoreStorageClient";
import { StorageClient } from "../../common/clients/storage/StorageClient";
import { Instance } from "../../common/entities/Instance";

export class DataQualityDefaultRepository implements DataQualityRepository {
    private storageClient: StorageClient;
    private globalStorageClient: StorageClient;

    constructor(private api: D2Api) {
        const instance = new Instance({ url: this.api.baseUrl });
        this.storageClient = new DataStoreStorageClient("user", instance);
        this.globalStorageClient = new DataStoreStorageClient("global", instance);
    }

    async getIndicators(options: DataQualityOptions, namespace: string): Promise<PaginatedObjects<DataQualityItem>> {
        const dataQuality = await this.globalStorageClient.getObject<DataQualityConfig>(namespace);

        const dataQualityIndicatorErrors =
            dataQuality?.validationResults.filter(
                r => (!r.denominatorresult || !r.numeratorresult) && r.metadataType === "Indicator"
            ) ?? [];

        const pager = { page: 1, pageSize: 10, pageCount: 100000, total: dataQualityIndicatorErrors.length };

        return { pager: pager, objects: dataQualityIndicatorErrors };
    }

    async getProgramIndicators(
        options: DataQualityOptions,
        namespace: string
    ): Promise<PaginatedObjects<DataQualityItem>> {
        const dataQuality = await this.globalStorageClient.getObject<DataQualityConfig>(namespace);

        const dataQualityProgramIndicatorErrors =
            dataQuality?.validationResults.filter(
                r => (!r.expressionresult || !r.filterresult) && r.metadataType === "ProgramIndicator"
            ) ?? [];

        const pager = { page: 1, pageSize: 10, pageCount: 100000, total: dataQualityProgramIndicatorErrors.length };

        return { pager: pager, objects: dataQualityProgramIndicatorErrors };
    }

    async getColumns(namespace: string): Promise<string[]> {
        const columns = await this.storageClient.getObject<string[]>(namespace);

        return columns ?? [];
    }

    async saveColumns(namespace: string, columns: string[]): Promise<void> {
        return this.storageClient.saveObject<string[]>(namespace, columns);
    }
}
