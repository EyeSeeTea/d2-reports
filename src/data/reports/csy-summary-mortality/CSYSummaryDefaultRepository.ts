import _ from "lodash";
import { getOrgUnitIdsFromPaths } from "../../../domain/common/entities/OrgUnit";
import { PaginatedObjects } from "../../../domain/common/entities/PaginatedObjects";
import { SummaryItem } from "../../../domain/reports/csy-summary-mortality/entities/SummaryItem";
import {
    CSYSummaryOptions,
    CSYSummaryRepository,
} from "../../../domain/reports/csy-summary-mortality/repositories/CSYSummaryRepository";
import { AnalyticsResponse, D2Api, Pager } from "../../../types/d2-api";
import { CsvData } from "../../common/CsvDataSource";
import { CsvWriterDataSource } from "../../common/CsvWriterCsvDataSource";
import { downloadFile } from "../../common/utils/download-file";
import { promiseMap } from "../../../utils/promises";

interface RowValue {
    scoringSystem: string;
    severity: string;
    mortalityCount: string;
    mortalityPercent: string;
    totalCount: string;
    totalPercent: string;
}

export class CSYSummaryMortalityDefaultRepository implements CSYSummaryRepository {
    constructor(private api: D2Api) {}

    async get(options: CSYSummaryOptions): Promise<PaginatedObjects<SummaryItem>> {
        const { paging, year, orgUnitPaths, quarter, summaryType } = options;

        const period = !quarter ? year : `${year}${quarter}`;
        const orgUnitIds = getOrgUnitIdsFromPaths(orgUnitPaths);

        const rows: RowValue[] = [];
        try {
            await promiseMap(
                summaryQueryStrings[summaryType as keyof typeof summaryQueryStrings],
                async queryString => {
                    await promiseMap(orgUnitIds, async orgUnitId => {
                        const analyticsReponse = await this.api.analytics
                            .get({
                                dimension: [`pe:${period}`, `dx:IN_GROUP-${queryString}`],
                                filter: [`ou:${orgUnitId}`],
                                skipMeta: true,
                                includeNumDen: false,
                            })
                            .getData();

                        const indicatorGroupResponse = await this.api
                            .get<{ indicators: { id: string; shortName: string }[] }>(
                                `indicatorGroups/${queryString}/indicators?fields=id,shortName`
                            )
                            .getData();

                        const cellValues = this.getColumnValue(analyticsReponse, "value");

                        _.forEach(indicatorGroupResponse.indicators, indicator => {
                            const index = _.indexOf(indicatorGroupResponse.indicators, indicator);
                            const { shortName: indicatorName } = indicator;

                            const scoringSystem = indicatorName.split(" ")[0] ?? "";
                            const severityLevel = indicatorName.match(/\((.*?)\)/)?.[1] || "";
                            const severityString: string = _.get(severity, [
                                scoringSystem,
                                severityLevel.toLowerCase(),
                            ]);
                            const isMortality = _.includes(indicatorName, "Mortality");
                            const isCount = _.includes(indicatorName, "Count");
                            const cellValue: string = cellValues[index] ?? "";

                            const rowValues = {
                                scoringSystem,
                                severity: `${severityLevel} (${severityString})`,
                                mortalityCount: isMortality && isCount ? cellValue : "",
                                mortalityPercent: isMortality && !isCount ? cellValue : "",
                                totalCount: !isMortality && isCount ? cellValue : "",
                                totalPercent: !isMortality && !isCount ? cellValue : "",
                            };

                            rows.push(rowValues);
                        });
                    });
                }
            );

            const objects: SummaryItem[] = _.chain(rows)
                .groupBy(row => `${row.scoringSystem}-${row.severity}`)
                .map(groupedRows => {
                    const combinedMortalityCount = _.sumBy(groupedRows, row => parseFloat(row.mortalityCount) || 0);
                    const combinedMortalityPercent = _.sumBy(groupedRows, row => parseFloat(row.mortalityPercent) || 0);
                    const combinedTotalCount = _.sumBy(groupedRows, row => parseFloat(row.totalCount) || 0);
                    const combinedTotalPercent = _.sumBy(groupedRows, row => parseFloat(row.totalPercent) || 0);

                    const resultRow = {
                        scoringSystem: groupedRows[0].scoringSystem,
                        severity: groupedRows[0].severity,
                        mortality: `${combinedMortalityCount} (${combinedMortalityPercent}%)`,
                        total: `${combinedTotalCount} (${combinedTotalPercent}%)`,
                    };

                    return resultRow;
                })
                .value();

            const sortedObjects = _.orderBy(objects, [
                row => scoringSystem.indexOf(row.scoringSystem),
                row =>
                    _.map(Object.keys(severity.GAP), _.capitalize).indexOf(row.severity.replace(/\(.+?\)/g, "").trim()),
            ]);

            const pager: Pager = {
                page: paging.page,
                pageSize: paging.pageSize,
                pageCount: 1,
                total: 1,
            };

            return { pager, objects: sortedObjects };
        } catch (error) {
            console.debug(error);
            return { pager: { page: 1, pageCount: 1, pageSize: 20, total: 1 }, objects: [] };
        }
    }

    async save(filename: string, items: SummaryItem[]): Promise<void> {
        const headers = csvFields.map(field => ({ id: field, text: field }));
        const rows = items.map(
            (dataValue): SummaryItemRow => ({
                scoringSystem: dataValue.scoringSystem,
                severity: dataValue.severity,
                mortality: dataValue.mortality,
                total: dataValue.total,
            })
        );

        const csvDataSource = new CsvWriterDataSource();
        const csvData: CsvData<CsvField> = { headers, rows };
        const csvContents = csvDataSource.toString(csvData);

        await downloadFile(csvContents, filename, "text/csv");
    }

    private findColumnIndex(response: AnalyticsResponse, columnId: string) {
        const headers = response.headers;
        const columnHeader = headers.find(header => header.name === columnId);

        if (!columnHeader) return -1;
        return headers.indexOf(columnHeader);
    }

    private getColumnValue(response: AnalyticsResponse, columnName: string) {
        const columnIndex = this.findColumnIndex(response, columnName);
        const values: string[] = [];
        const rows = response.rows;
        rows.map(row => values.push(String(row[columnIndex])));

        return values;
    }
}

// indicator groups
const summaryQueryStrings = {
    "mortality-injury-severity": [
        //"wwFwazs6FwA",
        //"stkqbeOxGOd",
        "ZKBM3iVefSr",
        "pCaxljXcHYr",
        "gYBciVYuJAV",
        "IGxgJpoAwbE",
        "S9cU3cNqmCV",
        "zQpmXtnkBOL",
    ],
};

const scoringSystem = ["GAP", "MGAP", "KTS", "RTS"];

const severity = {
    GAP: {
        mild: "19 - 24",
        moderate: "11 - 18",
        severe: "3 - 10",
    },
    MGAP: {
        mild: "23 - 29",
        moderate: "18 - 22",
        severe: "3 - 17",
    },
    KTS: {
        mild: "14 - 16",
        moderate: "18 - 22",
        severe: "<11",
    },
    RTS: {
        mild: "11 - 12",
        moderate: "4 - 10",
        severe: "<=3",
    },
};

const csvFields = ["scoringSystem", "severity", "mortality", "total"] as const;

type CsvField = typeof csvFields[number];

type SummaryItemRow = Record<CsvField, string>;
