import _ from "lodash";
import { PaginatedObjects } from "../../../domain/common/entities/PaginatedObjects";
import {
    DataQualityConfig,
    IndicatorItem,
    ProgramIndicatorItem,
    isIndicatorItem,
    isProgramIndicatorItem,
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
import { promiseMap } from "../../../utils/promises";
import { Namespaces } from "../../common/clients/storage/Namespaces";

export class DataQualityDefaultRepository implements DataQualityRepository {
    private storageClient: StorageClient;
    private globalStorageClient: StorageClient;

    constructor(private api: D2Api) {
        const instance = new Instance({ url: this.api.baseUrl });
        this.storageClient = new DataStoreStorageClient("user", instance);
        this.globalStorageClient = new DataStoreStorageClient("global", instance);
    }

    async getIndicators(options: IndicatorOptions, namespace: string): Promise<PaginatedObjects<IndicatorItem>> {
        const dataQuality = await this.globalStorageClient.getObject<DataQualityConfig>(namespace);
        const { paging, sorting } = options;

        const dataQualityIndicatorErrors =
            (dataQuality?.validationResults?.filter(
                r => isIndicatorItem(r) && (!r.denominatorResult || !r.numeratorResult)
            ) as IndicatorItem[]) ?? [];

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

    async getProgramIndicators(
        options: ProgramIndicatorOptions,
        namespace: string
    ): Promise<PaginatedObjects<ProgramIndicatorItem>> {
        const dataQuality = await this.globalStorageClient.getObject<DataQualityConfig>(namespace);
        const { paging, sorting } = options;

        const dataQualityProgramIndicatorErrors =
            (dataQuality?.validationResults?.filter(
                r => isProgramIndicatorItem(r) && (!r.expressionResult || !r.filterResult)
            ) as ProgramIndicatorItem[]) ?? [];

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

    async saveDataQuality(namespace: string, dataQuality: DataQualityConfig): Promise<void> {
        return await this.globalStorageClient.saveObject<DataQualityConfig>(namespace, dataQuality);
    }

    async reloadValidation(namespace: string, fromZero: boolean) {
        const dataQuality = await this.globalStorageClient.getObject<DataQualityConfig>(namespace);
        const dataQualityErrors: any[] = [];

        if (fromZero && dataQuality?.validationResults.length === 0) {
            const { indicators, programIndicators } = await getMetadata(this.api, {});
            validateExpression(this.api, "Indicator", indicators, dataQualityErrors);
            validateExpression(this.api, "ProgramIndicator", programIndicators, dataQualityErrors);

            await this.saveDataQuality(Namespaces.DATA_QUALITY, {
                indicatorsLastUpdated: new Date().toISOString(),
                programIndicatorsLastUpdated: new Date().toISOString(),
                validationResults: _.union(dataQualityErrors, dataQuality?.validationResults),
            });
        } else if (!fromZero) {
            const { indicators, programIndicators } = await getMetadata(this.api, {
                lastUpdated: { gt: dataQuality?.indicatorsLastUpdated },
            });
            validateExpression(this.api, "Indicator", indicators, dataQualityErrors);
            validateExpression(this.api, "ProgramIndicator", programIndicators, dataQualityErrors);

            await this.saveDataQuality(Namespaces.DATA_QUALITY, {
                indicatorsLastUpdated: new Date().toISOString(),
                programIndicatorsLastUpdated: new Date().toISOString(),
                validationResults: _.union(dataQualityErrors, dataQuality?.validationResults),
            });
        }
    }

    async getColumns(namespace: string): Promise<string[]> {
        const columns = await this.storageClient.getObject<string[]>(namespace);

        return columns ?? [];
    }

    async saveColumns(namespace: string, columns: string[]): Promise<void> {
        return this.storageClient.saveObject<string[]>(namespace, columns);
    }
}

async function getMetadata(api: D2Api, filter: Record<string, any>) {
    const { indicators } = await api.metadata
        .get({
            indicators: {
                fields: {
                    id: true,
                    name: true,
                    numerator: true,
                    denominator: true,
                    lastUpdated: true,
                    user: { displayName: true },
                },
                filter: filter,
            },
        })
        .getData();

    const { programIndicators } = await api.metadata
        .get({
            programIndicators: {
                fields: {
                    id: true,
                    name: true,
                    numerator: true,
                    denominator: true,
                    lastUpdated: true,
                    user: { displayName: true },
                    expression: true,
                    filter: true,
                },
                filter: filter,
            },
        })
        .getData();

    return { indicators, programIndicators };
}

async function validateExpression(
    api: D2Api,
    metadataType: "Indicator" | "ProgramIndicator",
    metadataItems: any[],
    errors: Array<IndicatorItem | ProgramIndicatorItem>
) {
    await promiseMap(metadataItems, async item => {
        try {
            if (metadataType === "Indicator") {
                const numeratorValidation = await api.expressions.validate("indicator", item.numerator).getData();
                const denominatorValidation = await api.expressions.validate("indicator", item.denominator).getData();

                if (numeratorValidation.status === "ERROR" || denominatorValidation.status === "ERROR") {
                    const numeratorResult = numeratorValidation.status !== "ERROR";
                    const denominatorResult = denominatorValidation.status !== "ERROR";
                    const dataQualityItem: IndicatorItem = {
                        ...item,
                        user: item.user.displayName,
                        numeratorResult,
                        denominatorResult,
                        metadataType,
                    };
                    errors.push(dataQualityItem);
                }
            } else if (metadataType === "ProgramIndicator" && (item.filter || item.expression)) {
                const expressionValidation = await api.expressions
                    .validate("program-indicator-formula", item.expression)
                    .getData();
                const filterValidation = await api.expressions
                    .validate("program-indicator-filter", item.filter)
                    .getData();

                if (expressionValidation.status === "ERROR" || filterValidation.status === "ERROR") {
                    const expressionResult = expressionValidation.status !== "ERROR";
                    const filterResult = filterValidation.status !== "ERROR";
                    const dataQualityItem: ProgramIndicatorItem = {
                        ...item,
                        user: item.user.displayName,
                        expressionResult,
                        filterResult,
                        metadataType,
                    };
                    errors.push(dataQualityItem);
                }
            }
        } catch (error) {
            console.debug(error);
        }
    });
}
