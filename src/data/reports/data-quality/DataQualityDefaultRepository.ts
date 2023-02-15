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
import { promiseMap } from "../../../utils/promises";
import { Namespaces } from "../../common/clients/storage/Namespaces";

type DataQualityItem = { [key: string]: any };

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

    async saveDataQuality(namespace: string, dataQuality: IndicatorConfig | ProgramIndicatorConfig): Promise<void> {
        return await this.globalStorageClient.saveObject<IndicatorConfig | ProgramIndicatorConfig>(
            namespace,
            dataQuality
        );
    }

    async reloadValidation(namespace: string, fromZero: boolean) {
        const dataQuality = await this.globalStorageClient.getObject<IndicatorConfig | ProgramIndicatorConfig>(
            namespace
        );
        const dataQualityErrors: any[] = [];

        if (fromZero && dataQuality?.validationResults.length === 0) {
            const { indicators } = await this.api.metadata
                .get({
                    indicators: {
                        fields: {
                            id: true,
                            name: true,
                            numerator: true,
                            denominator: true,
                            lastUpdated: true,
                            user: true,
                        },
                    },
                })
                .getData();
            const { programIndicators } = await this.api.metadata
                .get({
                    programIndicators: {
                        fields: {
                            id: true,
                            name: true,
                            numerator: true,
                            denominator: true,
                            lastUpdated: true,
                            user: true,
                            expression: true,
                            filter: true,
                        },
                    },
                })
                .getData();

            await promiseMap(indicators, async indicator => {
                const dataQualityItem: DataQualityItem = indicator;
                try {
                    const numeratorValidation = await this.api.expressions
                        .validate("indicator", indicator.numerator)
                        .getData();
                    const denominatorValidation = await this.api.expressions
                        .validate("indicator", indicator.denominator)
                        .getData();

                    if (numeratorValidation.status === "ERROR" || denominatorValidation.status === "ERROR") {
                        dataQualityItem.numeratorresult = numeratorValidation.status === "ERROR";
                        dataQualityItem.denominatorresult = denominatorValidation.status === "ERROR";
                        dataQualityItem.metadataType = "Indicator";
                        dataQualityErrors.push(dataQualityItem);
                    }
                } catch (error) {
                    console.debug(error);
                }
            });
            await promiseMap(programIndicators, async programIndicator => {
                const dataQualityItem: DataQualityItem = programIndicator;
                try {
                    const expressionValidation = await this.api.expressions
                        .validate("program-indicator-formula", programIndicator.expression)
                        .getData();
                    const filterValidation = await this.api.expressions
                        .validate("program-indicator-filter", programIndicator.filter)
                        .getData();

                    if (expressionValidation.status === "ERROR" || filterValidation.status === "ERROR") {
                        dataQualityItem.numeratorresult = expressionValidation.status === "ERROR";
                        dataQualityItem.denominatorresult = filterValidation.status === "ERROR";
                        dataQualityItem.metadataType = "ProgramIndicator";
                        dataQualityErrors.push(dataQualityItem);
                    }
                } catch (error) {
                    console.debug(error);
                }
            });

            await this.saveDataQuality(Namespaces.DATA_QUALITY, {
                indicatorsLastUpdated: new Date().toISOString(),
                programIndicatorsLastUpdated: new Date().toISOString(),
                validationResults: dataQualityErrors,
            });
        } else if (!fromZero) {
            const { indicators } = await this.api.metadata
                .get({
                    indicators: {
                        fields: {
                            id: true,
                            name: true,
                            numerator: true,
                            denominator: true,
                            lastUpdated: true,
                            user: true,
                        },
                        filter: {
                            lastUpdated: {
                                gt: dataQuality?.indicatorsLastUpdated,
                            },
                        },
                    },
                })
                .getData();
            const { programIndicators } = await this.api.metadata
                .get({
                    programIndicators: {
                        fields: {
                            id: true,
                            name: true,
                            numerator: true,
                            denominator: true,
                            lastUpdated: true,
                            user: true,
                            expression: true,
                            filter: true,
                        },
                        filter: {
                            lastUpdated: {
                                gt: dataQuality?.programIndicatorsLastUpdated,
                            },
                        },
                    },
                })
                .getData();

            await promiseMap(indicators, async indicator => {
                const dataQualityItem: DataQualityItem = indicator;
                try {
                    const numeratorValidation = await this.api.expressions
                        .validate("indicator", indicator.numerator)
                        .getData();
                    const denominatorValidation = await this.api.expressions
                        .validate("indicator", indicator.denominator)
                        .getData();

                    if (numeratorValidation.status === "ERROR" || denominatorValidation.status === "ERROR") {
                        dataQualityItem.numeratorresult = numeratorValidation.status === "ERROR";
                        dataQualityItem.denominatorresult = denominatorValidation.status === "ERROR";
                        dataQualityItem.metadataType = "Indicator";
                        dataQualityErrors.push(dataQualityItem);
                    }
                } catch (error) {
                    console.debug(error);
                }
            });
            await promiseMap(programIndicators, async programIndicator => {
                const dataQualityItem: DataQualityItem = programIndicator;
                try {
                    const expressionValidation = await this.api.expressions
                        .validate("program-indicator-formula", programIndicator.expression)
                        .getData();
                    const filterValidation = await this.api.expressions
                        .validate("program-indicator-filter", programIndicator.filter)
                        .getData();

                    if (expressionValidation.status === "ERROR" || filterValidation.status === "ERROR") {
                        dataQualityItem.numeratorresult = expressionValidation.status === "ERROR";
                        dataQualityItem.denominatorresult = filterValidation.status === "ERROR";
                        dataQualityItem.metadataType = "ProgramIndicator";
                        dataQualityErrors.push(dataQualityItem);
                    }
                } catch (error) {
                    console.debug(error);
                }
            });

            await this.saveDataQuality(Namespaces.DATA_QUALITY, {
                indicatorsLastUpdated: new Date().toISOString(),
                programIndicatorsLastUpdated: new Date().toISOString(),
                validationResults: dataQualityErrors,
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
