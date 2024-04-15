import _ from "lodash";
import { getOrgUnitIdsFromPaths } from "../../../domain/common/entities/OrgUnit";
import { PaginatedObjects } from "../../../domain/common/entities/PaginatedObjects";
import { SummaryItem, SummaryType } from "../../../domain/reports/csy-summary-mortality/entities/SummaryItem";
import {
    SummaryItemOptions,
    SummaryItemRepository,
} from "../../../domain/reports/csy-summary-mortality/repositories/SummaryItemRepository";
import { D2Api, Pager } from "../../../types/d2-api";
import { CsvData } from "../../common/CsvDataSource";
import { CsvWriterDataSource } from "../../common/CsvWriterCsvDataSource";
import { downloadFile } from "../../common/utils/download-file";
import { promiseMap } from "../../../utils/promises";
import { AuditAnalyticsData } from "../../../domain/common/entities/AuditAnalyticsResponse";

interface RowValue {
    scoringSystem: string;
    severity: string;
    mortalityCount: string;
    mortalityPercent: string;
    totalCount: string;
    totalPercent: string;
}

export class SummaryItemD2Repository implements SummaryItemRepository {
    constructor(private api: D2Api) {}

    async get(options: SummaryItemOptions): Promise<PaginatedObjects<SummaryItem>> {
        const { paging, year, orgUnitPaths, quarter, summaryType } = options;

        const period = !quarter ? year : `${year}${quarter}`;
        const orgUnitIds = getOrgUnitIdsFromPaths(orgUnitPaths);

        try {
            const objects = await this.getSummaryItems(summaryType, orgUnitIds, period);
            const pager: Pager = {
                page: paging.page,
                pageSize: paging.pageSize,
                pageCount: 1,
                total: 1,
            };

            return { pager: pager, objects: objects };
        } catch (error) {
            console.debug(error);
            return { pager: { page: 1, pageCount: 1, pageSize: 20, total: 1 }, objects: [] };
        }
    }

    private async getSummaryItems(
        summaryType: SummaryType,
        orgUnitIds: string[],
        period: string
    ): Promise<SummaryItem[]> {
        const queryStrings = indicatorGroups[summaryType];

        const rows = _(
            await promiseMap(queryStrings, async indicatorGroup => {
                return await promiseMap(orgUnitIds, async orgUnitId => {
                    const analyticsResponse = await this.api.analytics
                        .get({
                            dimension: [`pe:${period}`, `dx:IN_GROUP-${indicatorGroup}`],
                            filter: [`ou:${orgUnitId}`],
                            skipMeta: true,
                            includeNumDen: false,
                        })
                        .getData();

                    const analyticsData = new AuditAnalyticsData(analyticsResponse);
                    const cellValues = analyticsData.getColumnValues("value");
                    const indicators = await this.getIndicators(indicatorGroup);

                    const rows: RowValue[] = indicators.map((indicator, index) => {
                        const { shortName: indicatorName } = indicator;

                        const scoringSystem = _.first(indicatorName.split(" ")) ?? "";
                        const severityLevel = indicatorName.match(/\((.*?)\)/)?.[1] || "";
                        const severityString: string = _.get(severity, [scoringSystem, severityLevel.toLowerCase()]);
                        const isMortality = _.includes(indicatorName, "Mortality");
                        const isCount = _.includes(indicatorName, "Count");

                        const cellValue: string = cellValues[index] ?? "";

                        return {
                            scoringSystem: scoringSystem,
                            severity: `${severityLevel} (${severityString})`,
                            mortalityCount: isMortality && isCount ? cellValue : "",
                            mortalityPercent: isMortality && !isCount ? cellValue : "",
                            totalCount: !isMortality && isCount ? cellValue : "",
                            totalPercent: !isMortality && !isCount ? cellValue : "",
                        };
                    });

                    return rows;
                });
            })
        )
            .flattenDeep()
            .value();

        const objects: SummaryItem[] = _(rows)
            .groupBy(row => `${row.scoringSystem}-${row.severity}`)
            .map(groupedRows => {
                const combinedMortalityCount = _.sumBy(groupedRows, row => parseFloat(row.mortalityCount) || 0);
                const combinedMortalityPercent = _.sumBy(groupedRows, row => parseFloat(row.mortalityPercent) || 0);
                const combinedTotalCount = _.sumBy(groupedRows, row => parseFloat(row.totalCount) || 0);
                const combinedTotalPercent = _.sumBy(groupedRows, row => parseFloat(row.totalPercent) || 0);

                return {
                    scoringSystem: groupedRows[0].scoringSystem,
                    severity: groupedRows[0].severity,
                    mortality: `${combinedMortalityCount} (${combinedMortalityPercent}%)`,
                    total: `${combinedTotalCount} (${combinedTotalPercent}%)`,
                };
            })
            .value();

        return _.orderBy(objects, [
            row => scoringSystem.indexOf(row.scoringSystem),
            row => _.map(Object.keys(severity.GAP), _.capitalize).indexOf(row.severity.replace(/\(.+?\)/g, "").trim()),
        ]);
    }

    private async getIndicators(indicatorGroupId: string): Promise<{ id: string; shortName: string }[]> {
        const { indicatorGroups } = await this.api.metadata
            .get({
                indicatorGroups: {
                    fields: {
                        indicators: {
                            id: true,
                            shortName: true,
                        },
                    },
                    filter: {
                        id: {
                            eq: indicatorGroupId,
                        },
                    },
                },
            })
            .getData();

        return _.first(indicatorGroups)?.indicators ?? [];
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
}

const indicatorGroups = {
    "mortality-injury-severity": [
        "wwFwazs6FwA",
        "stkqbeOxGOd",
        "ZKBM3iVefSr",
        "pCaxljXcHYr",
        "gYBciVYuJAV",
        "IGxgJpoAwbE",
        "S9cU3cNqmCV",
        "zQpmXtnkBOL",
    ],
};

const metadata = {
    indicatorGroups: {
        gapScoreCountId: "wwFwazs6FwA",
        gapScorePercentageId: "stkqbeOxGOd",
        ktsScoreCountId: "ZKBM3iVefSr",
        ktsScorePercentageId: "pCaxljXcHYr",
        mgapScoreCountId: "gYBciVYuJAV",
        mgapScorePercentageId: "IGxgJpoAwbE",
        rtsScoreCountId: "S9cU3cNqmCV",
        rtsScorePercentageId: "zQpmXtnkBOL",
    },
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
