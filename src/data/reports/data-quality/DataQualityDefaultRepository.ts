import _ from "lodash";
import { PaginatedObjects } from "../../../domain/common/entities/PaginatedObjects";
import {
    IndicatorConfig,
    IndicatorItem,
    ProgramIndicatorConfig,
    ProgramIndicatorItem,
} from "../../../domain/reports/data-quality/entities/DataQualityItem";
import {
    DataQualityRepository,
    IndicatorOptions,
    ProgramIndicatorOptions,
} from "../../../domain/reports/data-quality/repositories/DataQualityRepository";
import { D2Api, Pager } from "../../../types/d2-api";
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

    async getIndicators(options: IndicatorOptions, namespace: string): Promise<PaginatedObjects<IndicatorItem>> {
        const dataQuality = await this.globalStorageClient.getObject<IndicatorConfig>(namespace);
        const { paging, sorting } = options;

        const dataQualityIndicatorErrors =
            dataQuality?.validationResults?.filter(
                r => (!r.denominatorresult || !r.numeratorresult) && r.metadataType === "Indicator"
            ) ?? [];

        const dataQualityIndicatorErrorsInPage = _(dataQualityIndicatorErrors)
            .orderBy([row => row[sorting.field]], [sorting.direction])
            .drop((paging.page - 1) * paging.pageSize)
            .take(paging.pageSize)
            .value();

        const pager: Pager = {
            page: paging.page,
            pageSize: paging.pageSize,
            pageCount: Math.ceil(dataQualityIndicatorErrors.length / paging.pageSize),
            total: dataQualityIndicatorErrors.length,
        };

        return { pager: pager, objects: dataQualityIndicatorErrorsInPage };
    }

    async saveDataQuality(namespace: string, dataQuality: IndicatorItem[] | ProgramIndicatorItem[]): Promise<void> {
        return await this.globalStorageClient.saveObject<IndicatorItem[] | ProgramIndicatorItem[]>(
            namespace,
            dataQuality
        );
    }

    async getProgramIndicators(
        options: ProgramIndicatorOptions,
        namespace: string
    ): Promise<PaginatedObjects<ProgramIndicatorItem>> {
        const dataQuality = await this.globalStorageClient.getObject<ProgramIndicatorConfig>(namespace);
        const { paging, sorting } = options;

        const dataQualityProgramIndicatorErrors =
            dataQuality?.validationResults?.filter(
                r => (!r.expressionresult || !r.filterresult) && r.metadataType === "ProgramIndicator"
            ) ?? [];

        const dataQualityIndicatorErrorsInPage = _(dataQualityProgramIndicatorErrors)
            .orderBy([row => row[sorting.field]], [sorting.direction])
            .drop((paging.page - 1) * paging.pageSize)
            .take(paging.pageSize)
            .value();

        const pager: Pager = {
            page: paging.page,
            pageSize: paging.pageSize,
            pageCount: Math.ceil(dataQualityProgramIndicatorErrors.length / paging.pageSize),
            total: dataQualityProgramIndicatorErrors.length,
        };
        return { pager: pager, objects: dataQualityIndicatorErrorsInPage };
    }

    async getColumns(namespace: string): Promise<string[]> {
        const columns = await this.storageClient.getObject<string[]>(namespace);

        return columns ?? [];
    }

    async saveColumns(namespace: string, columns: string[]): Promise<void> {
        return this.storageClient.saveObject<string[]>(namespace, columns);
    }
}
