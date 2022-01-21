import { D2Api } from "../types/d2-api";
import { CsvWriterDataSource } from "./CsvWriterCsvDataSource";
import { downloadFile } from "./utils/download-file";
import { CsvData } from "../data/CsvDataSource";
import { MetadataObject } from "../domain/common/entities/MetadataObject";
import _ from "lodash";
import { Indicator } from "../domain/common/entities/Indicator";
import { ProgramIndicator } from "../domain/common/entities/ProgramIndicator";
import { IndicatorsByExpression } from "../domain/common/entities/IndicatorsByExpression";
import { DataQualityRepository } from "../domain/data-quality/repositories/DataQualityRepository";

const filter = "filter=lastUpdated:gt:"

export class DataQualityDefaultRepository implements DataQualityRepository {
    constructor(private api: D2Api) { }

    async getIndicators(startDate?: string): Promise<Indicator[]> {

        const indicatorsResult: any = await this.api.metadata.d2Api
            .get(
                "/indicators.json?paging=false&fields=*" + startDate
            )
            .getData();

        return indicatorsResult
    }

    async getIndicatorByExpression(lastUpdated: string): Promise<IndicatorsByExpression> {
        const d2api = this.api
        const list: IndicatorsByExpression = {
            right: [],
            wrongDenominator: [],
            wrongNumerator: [],
            wrongFilter: []
        };
        const startDate = lastUpdated ? lastUpdated : "&startDate=1970-01-01";
        const indicatorsResult: any = await this.getIndicators(startDate)



        _.map(indicatorsResult, function (indicator) {
            const expresionResult: any = d2api.expressions.validate("indicator", indicator.numerator
            )
                .getData()

            if (expresionResult["message"] != "Valid") {
                list.wrongNumerator.push(indicator)
            } else {
                const expresionResult: any = d2api.expressions.validate("indicator", indicator.denominator
                )
                    .getData()
                if (expresionResult["filter"] != "Valid") {
                    list.wrongDenominator.push(indicator)
                }
                else {
                    //todo maybe the filter needs other key?
                    const expresionResult: any = d2api.expressions.validate("indicator", indicator.filter
                    )
                        .getData()

                    if (expresionResult["filter"] != "Valid") {
                        list.wrongFilter.push(indicator)
                    } else {
                        list.right.push(indicator)

                    }
                }
            }
        })
        return list;

        /*         return Promise.all(_.map(indicatorsResult, function (indicator) {
                    const expresionResult: any = d2api.metadata.d2Api
                        .post(
                            "/indicators/expression/description", indicator.numerator
                        )
                        .getData()
        
                    if (expresionResult["message"] != "Valid") {
                        list.wrongNumerator.push(indicator)
                    } else {
                        const expresionResult: any = d2api.metadata.d2Api
                            .post(
                                "/indicators/expression/description", indicator.denominator
                            )
                            .getData()
                        if (expresionResult["filter"] != "Valid") {
                            list.wrongDenominator.push(indicator)
                        }
                        else {
                            const expresionResult: any = d2api.metadata.d2Api
                                .post(
                                    "/indicators/expression/description", indicator.filter
                                )
                                .getData()
        
                            if (expresionResult["filter"] != "Valid") {
                                list.wrongFilter.push(indicator)
                            } else {
                                list.right.push(indicator)
        
                            }
                        }
                    }
                })); */
    }


    async getProgramIndicators(startDate?: string): Promise<Indicator[]> {

        const indicatorsResult: any = await this.api.metadata.d2Api
            .get(
                "/programIndicators.json?ields=id,name,shortName,numerator,denominator,filter,expression,lastUpdatedBy[displayName],user[displayName],created,lastUpdated,userGroupAccesses,userAccess,publicAccess&paging=false" + startDate
            )
            .getData();

        return indicatorsResult
    }


    async getProgramIndicatorsByExpression(lastUpdated: string): Promise<ProgramIndicator[]> {

        const startDate = lastUpdated ? lastUpdated : "&startDate=1970-01-01";
        const programIndicatorsResult: any = await this.getIndicators(startDate)
        const programIndicators: ProgramIndicator[] = programIndicatorsResult
        const d2api = this.api
        const programIndicatorsByExpression = await Promise.all(_.map(programIndicators, function (programIndicator) {
            const expresionResult: any = d2api.expressions.validate("program-indicator-formula", programIndicator.expression
            )
                .getData()

            if (expresionResult["message"] != "Valid") {
                wrongExpression: programIndicator
            } else {
                const expresionResult: any = d2api.expressions.validate("program-indicator-filter", programIndicator.filter
                )
                    .getData()
                if (expresionResult["filter"] != "Valid") {
                    wrongFilter: programIndicator
                }
                else {
                    correct: programIndicator
                }
            }
        }));
        return programIndicatorsByExpression;
    }
    async saveLastUpdated(key: string, date: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
    async saveIndicators(key: string, indicators: Indicator[]): Promise<void> {
        throw new Error("Method not implemented.");
    }
    async saveProgramIndicators(key: string, programIndicators: ProgramIndicator[]): Promise<void> {
        throw new Error("Method not implemented.");
    }


    async save(filename: string, metadataObjects: MetadataObject[]): Promise<void> {
        const headers = csvFields.map(field => ({ id: field, text: field }));
        const rows = metadataObjects.map(
            (metadataObject): MetadataRow => ({
                metadataType: metadataObject.metadataType,
                id: metadataObject.Id,
                name: metadataObject.name,
                publicAccess: metadataObject.publicAccess,
                userGroupAccess: metadataObject.userGroupAccess || "-",
                userAccess: metadataObject.userAccess || "-",
                createdBy: metadataObject.createdBy || "-",
                lastUpdatedBy: metadataObject.lastUpdatedBy || "-",
                created: metadataObject.created || "-",
                lastUpdated: metadataObject.lastUpdated || "-",
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
    "publicAccess",
    "userGroupAccess",
    "userAccess",
    "createdBy",
    "lastUpdatedBy",
    "created",
    "lastUpdated",
] as const;

type CsvField = typeof csvFields[number];

type MetadataRow = Record<CsvField, string>;
