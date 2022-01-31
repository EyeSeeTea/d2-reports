import { D2Api, GetOptions, Selector } from "../types/d2-api";
import { CsvWriterDataSource } from "./CsvWriterCsvDataSource";
import { downloadFile } from "./utils/download-file";
import { CsvData } from "../data/CsvDataSource";
import { MetadataObject } from "../domain/common/entities/MetadataObject";
import _ from "lodash";
import { Indicator } from "../domain/common/entities/Indicator";
import { ProgramIndicator } from "../domain/common/entities/ProgramIndicator";
import { ValidationResults } from "../domain/common/entities/ValidationResults";
import { DataQualityRepository } from "../domain/data-quality/repositories/DataQualityRepository";
import { GetOptionGeneric } from "@eyeseetea/d2-api/api/common";
import { PaginatedObjects } from "../domain/common/entities/PaginatedObjects";
import { Namespaces } from "./clients/storage/Namespaces";
import { PersistedConfig } from "./entities/PersistedConfig";
import { InvalidIndicators } from "./entities/InvalidIndicators";
import { InvalidProgramIndicators } from "./entities/InvalidProgramIndicators";
import { DataStoreStorageClient } from "./clients/storage/DataStoreStorageClient";
import { StorageClient } from "./clients/storage/StorageClient";
import { Instance } from "./entities/Instance";

const filter = "filter=lastUpdated:gt:"

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

    getValidations(): Promise<ValidationResults> {
        const indicatorsValidationsResult = this.getValidatedIndicators()
        const programIndicatorsvalidationsResult = this.getValidatedProgramIndicators()
        return _.merge(indicatorsValidationsResult, programIndicatorsvalidationsResult)
    }


    getValidatedIndicators(): Promise<ValidationResults> {

        const startDate = this.getIndicatorsLastUpdated();

        const date = this.getParsedDate(new Date())
        const indicatorsResult = await this.api.models.indicators.get({
            fields: {
                id: true,
                filter: true,
                numerator: true,
                denominator: true,
                name: true,
                createdBy: true,
                lastUpdated: true,
            },
            filters: {
                startDate: startDate
            },
            paging: false,
        })
            .getData()

        const d2api = this.api
        const results = await promiseMap(indicatorsResult.objects, async indicator => {
            const numeratorResult = await d2api.expressions.validate("indicator", indicator.numerator).getData();
            const numerator = numeratorResult.message === "Valid";
            const denominatorResult = await d2api.expressions.validate("indicator", indicator.denominator).getData();
            const denominator = denominatorResult.message === "Valid";

            return { numerator, denominator, indicator };
        }
        this.saveIndicators(date, results);
        return results
    }

    getValidatedProgramIndicators(): Promise<ValidationResults> {

        const startDate = this.getProgramIndicatorsLastUpdated()

        const filters = {
            paging = false,
            startDate: startDate
        }
        const optionsTest = ({
            fields: {
                id: true,
                filter: true,
                expression: true,
                name: true,
                createdBy: true,
                lastUpdated: true,
            }, filters
        })
        const date = this.getParsedDate(new Date())
        const programIndicatorsResult: PaginatedObjects<any> = await this.api.models.programIndicators.get(optionsTest)
            .getData()

        const d2api = this.api
        const results: ValidationResults[] = promiseMap(programIndicatorsResult.objects, programIndicator => {
            const expressionResult = await d2api.expressions.validate("program-indicator-formula", programIndicator.expression).getData();
            const expression = expressionResult.message === "Valid";
            const filterResult = await d2api.expressions.validate("program-indicator-filter", programIndicator.filter).getData();
            const filter = filterResult.message === "Valid";

            return { expression, filter, programIndicator };
        }

        this.saveProgramIndicators(date, results);
        return results
    }

    private getParsedDate(strDate: Date) {
        return strDate.getFullYear() + '-' + ("0" + (new Date().getMonth() + 1)).slice(-2) + '-' + ("0" + new Date().getDate()).slice(-2)
    }

    private getIndicatorsLastUpdated(): string {
        const { indicatorsLastUpdated = "1970-01-01" } = await this.getConfig();
        return indicatorsLastUpdated;
    }

    private getProgramIndicatorsLastUpdated(): string {
        const { programIndicatorsLastUpdated = "1970-01-01" } = await this.getConfig();
        return programIndicatorsLastUpdated;
    }

    private async setIndicatorsLastUpdated(indicators: InvalidIndicators, indicatorsLastUpdated: string): Promise<void> {
        const config = await this.getConfig();

        await this.storageClient.saveObject<PersistedConfig>(Namespaces.DATA_QUALITY_CONFIG, {
            ...config,
            indicatorsLastUpdated,
        });
        await this.storageClient.saveObject<PersistedConfig>(Namespaces.DATA_QUALITY_CONFIG, {
            ...config,
            indicators,
        });
    }

    private async setProgramIndicatorsLastUpdated(programIndicators: InvalidProgramIndicators, programIndicatorsLastUpdated: string): Promise<void> {
        const config = await this.getConfig();

        await this.storageClient.saveObject<PersistedConfig>(Namespaces.DATA_QUALITY_CONFIG, {
            ...config,
            programIndicatorsLastUpdated,
        });
        await this.storageClient.saveObject<PersistedConfig>(Namespaces.DATA_QUALITY_CONFIG, {
            ...config,
            programIndicators,
        });
    }

    private async getConfig(): Promise<PersistedConfig> {
        const config = await this.storageClient.getObject<PersistedConfig>(Namespaces.DATA_QUALITY_CONFIG);
        return config ?? {};
    }

    private saveIndicators(lastUpdated: string, indicators: ValidationResults[]): Promise<void> {
        this.setIndicatorsLastUpdated(indicators, lastUpdated)
        //this.saveIndicators(indicators)
        const sections = _.mapValues(indexedSections, section => section.id);
    }

    private saveProgramIndicators(lastUpdated: string, programIndicators: ValidationResults[]): Promise<void> {
        const invalidProgramIndicators: InvalidProgramIndicators = _.map(programIndicators, programIndicator => {
            if (programIndicator === undefined) {
                return
            } else {
                return {
                    name: programIndicator.name ?? "-",
                    expression: programIndicator.expression ?? "-",
                    filter: programIndicator.filter ?? "-",
                    id: programIndicator.id ?? "-",
                }
            }
        })
        this.setProgramIndicatorsLastUpdated(invalidProgramIndicators, lastUpdated)
    }


    async exportToCsv(filename: string, metadataObjects: ValidationResults[]): Promise<void> {
        const headers = csvFields.map(field => ({ id: field, text: field }));
        const rows = metadataObjects.map(
            (ValidationResults): MetadataRow => ({
                metadataType: ValidationResults.metadataType,
                id: ValidationResults.id,
                name: ValidationResults.name,
                expression: ValidationResults.expression,
                numerator: ValidationResults.numerator,
                denominator: ValidationResults.denominator,
                filter: ValidationResults.filter,
            })
        );

        const csvDataSource = new CsvWriterDataSource();
        const csvData: CsvData<CsvField> = { headers, rows };
        const csvContents = csvDataSource.toString(csvData);

        await downloadFile(csvContents, filename, "text/csv");
    }
}

const csvFields = [
    "metadataType",
    "id",
    "name",
    "expression",
    "numerator",
    "denominator",
    "filter",
] as const;

type CsvField = typeof csvFields[number];

type MetadataRow = Record<CsvField, string | undefined>;
