import { D2Api, GetOptions, Selector } from "../types/d2-api";
import { CsvWriterDataSource } from "./CsvWriterCsvDataSource";
import { downloadFile } from "./utils/download-file";
import { CsvData } from "../data/CsvDataSource";
import { ValidationResults } from "../domain/common/entities/ValidationResults";
import { DataQualityRepository } from "../domain/data-quality/repositories/DataQualityRepository";
import { Namespaces } from "./clients/storage/Namespaces";
import { PersistedConfig } from "./entities/PersistedConfig";
import { DataStoreStorageClient } from "./clients/storage/DataStoreStorageClient";
import { StorageClient } from "./clients/storage/StorageClient";
import { Instance } from "./entities/Instance";

export async function promiseMap<T, S>(inputValues: T[], mapper: (value: T) => Promise<S>): Promise<S[]> {
    const output: S[] = [];
    for (const value of inputValues) {
        const res = await mapper(value);
        output.push(res);
    }
    return output;
}
export class DataQualityDefaultRepository implements DataQualityRepository {
    private storageClient: StorageClient;

    constructor(private api: D2Api) {
        const instance = new Instance({ url: this.api.baseUrl });
        this.storageClient = new DataStoreStorageClient("global", instance);
    }
    
    async reloadValidations(): Promise<ValidationResults[]> {
        await this.storageClient.saveObject<PersistedConfig>(Namespaces.DATA_QUALITY_CONFIG, 
            {});
        return await this.getValidations()
    }

    async getValidations(): Promise<ValidationResults[]> {
        const programIndicatorDate = this.getParsedDate(new Date());
        const programIndicatorsvalidationsResult = await this.getValidatedProgramIndicators();
        const indicatorDate = this.getParsedDate(new Date());
        const indicatorsValidationsResult = await this.getValidatedIndicators();
        const result: ValidationResults[] = [...indicatorsValidationsResult, ...programIndicatorsvalidationsResult];
        const persistedData = await this.saveResult(result, indicatorDate, programIndicatorDate);
        return persistedData;
    }

    async getValidatedIndicators(): Promise<ValidationResults[]> {
        const startDate = await this.getIndicatorsLastUpdated();

        const indicatorsResult = await this.api.models.indicators
            .get({
                fields: {
                    id: true,
                    numerator: true,
                    denominator: true,
                    name: true,
                    user: true,
                    lastUpdated: true,
                },
                filter: {
                    lastUpdated: { gt: startDate },
                },
                paging: false,
            })
            .getData();

        const d2api = this.api;
        const results = await promiseMap(indicatorsResult.objects, async indicator => {
            const numeratorResult =
                indicator.numerator === ""
                    ? undefined
                    : await d2api.expressions.validate("indicator", indicator.numerator).getData();
            const numerator = numeratorResult === undefined ? false : numeratorResult.message === "Valid";
            const denominatorResult =
                indicator.denominator === ""
                    ? undefined
                    : await d2api.expressions.validate("indicator", indicator.denominator).getData();
            const denominator = denominatorResult === undefined ? false : denominatorResult.message === "Valid";

            return {
                metadataType: "Indicator",
                id: indicator.id,
                name: indicator.name,
                numerator: indicator.numerator,
                numeratorresult: numerator,
                denominator: indicator.denominator,
                denominatorresult: denominator,
                user: indicator.user.id,
                lastUpdated: indicator.lastUpdated,
            };
        });

        return results;
    }

    async getValidatedProgramIndicators(): Promise<ValidationResults[]> {
        const startDate = await this.getProgramIndicatorsLastUpdated();
        const programIndicatorsResult = await this.api.models.programIndicators
            .get({
                fields: {
                    id: true,
                    filter: true,
                    expression: true,
                    name: true,
                    user: true,
                    lastUpdated: true,
                },
                filter: {
                    lastUpdated: { gt: startDate },
                },
                paging: false,
            })
            .getData();

        const d2api = this.api;
        const results = await promiseMap(programIndicatorsResult.objects, async programIndicator => {
            const expressionResult =
                !("expression" in programIndicator) || programIndicator.expression === ""
                    ? undefined
                    : await d2api.expressions
                          .validate("program-indicator-formula", programIndicator.expression)
                          .getData();
            const expression = expressionResult === undefined ? false : expressionResult.message === "Valid";
            const filterResult =
                !("filter" in programIndicator) || programIndicator.filter === ""
                    ? undefined
                    : await d2api.expressions.validate("program-indicator-filter", programIndicator.filter).getData();
            const filter = filterResult === undefined ? false : filterResult.message === "Valid";
            return {
                metadataType: "ProgramIndicator",
                id: programIndicator.id,
                name: programIndicator.name,
                expression: programIndicator.expression,
                expressionresult: expression,
                filter: programIndicator.filter,
                filterresult: filter,
                user: programIndicator.user.id,
                lastUpdated: programIndicator.lastUpdated,
            };
        });
        return results;
    }

    private getParsedDate(strDate: Date) {
        return (
            strDate.getFullYear() +
            "-" +
            ("0" + (new Date().getMonth() + 1)).slice(-2) +
            "-" +
            ("0" + new Date().getDate()).slice(-2)
        );
    }

    private async getIndicatorsLastUpdated(): Promise<string> {
        const { indicatorsLastUpdated = "1970-01-01" } = await this.getConfig();
        return indicatorsLastUpdated;
    }

    private async getProgramIndicatorsLastUpdated(): Promise<string> {
        const { programIndicatorsLastUpdated = "1970-01-01" } = await this.getConfig();
        return programIndicatorsLastUpdated;
    }

    private async saveResult(
        validationResults: ValidationResults[],
        indicatorsLastUpdated: string,
        programIndicatorsLastUpdated: string
    ): Promise<ValidationResults[]> {
        const config = await this.getConfig();
        config.indicatorsLastUpdated = indicatorsLastUpdated;
        config.programIndicatorsLastUpdated = programIndicatorsLastUpdated;

        config.validationResults = config.validationResults
            ? [...config.validationResults, ...validationResults]
            : validationResults;

        await this.storageClient.saveObject<PersistedConfig>(Namespaces.DATA_QUALITY_CONFIG, {
            ...config,
        });
        return config.validationResults;
    }

    private async getConfig(): Promise<PersistedConfig> {
        const config = await this.storageClient.getObject<PersistedConfig>(Namespaces.DATA_QUALITY_CONFIG);
        return config ?? {};
    }

    async exportToCsv(): Promise<void> {
        const metadataObjects = await (await this.getConfig()).validationResults;
        const headers = csvFields.map(field => ({ id: field, text: field }));
        if (metadataObjects === undefined) {
            return;
        } else {
            const rows = metadataObjects.map(
                (ValidationResults): MetadataRow => ({
                    metadataType: ValidationResults.metadataType,
                    id: ValidationResults.id,
                    name: ValidationResults.name,
                    expression: ValidationResults.expression,
                    expressionresult: ValidationResults.expressionresult ? "valid" : "invalid",
                    filter: ValidationResults.filter,
                    filterresult: ValidationResults.filterresult ? "valid" : "invalid",
                    numerator: ValidationResults.numerator,
                    numeratorresult: ValidationResults.numeratorresult ? "valid" : "invalid",
                    denominator: ValidationResults.denominator,
                    denominatorresult: ValidationResults.denominatorresult ? "valid" : "invalid",
                    user: ValidationResults.user,
                })
            );

            const csvDataSource = new CsvWriterDataSource();
            const csvData: CsvData<CsvField> = { headers, rows };
            const csvContents = csvDataSource.toString(csvData);

            await downloadFile(csvContents, "export.csv", "text/csv");
        }
    }
}

const csvFields = [
    "metadataType",
    "id",
    "name",
    "expression",
    "expressionresult",
    "filter",
    "filterresult",
    "numerator",
    "numeratorresult",
    "denominator",
    "denominatorresult",
    "user",
] as const;

type CsvField = typeof csvFields[number];

type MetadataRow = Record<CsvField, string | undefined>;
