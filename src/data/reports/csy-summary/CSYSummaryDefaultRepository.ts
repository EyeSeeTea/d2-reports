import _ from "lodash";
import { getOrgUnitIdsFromPaths } from "../../../domain/common/entities/OrgUnit";
import { PaginatedObjects } from "../../../domain/common/entities/PaginatedObjects";
import { SummaryItem } from "../../../domain/reports/csy-summary/entities/SummaryItem";
import {
    CSYSummaryOptions,
    CSYSummaryRepository,
} from "../../../domain/reports/csy-summary/repositories/CSYSummaryRepository";
import { AnalyticsResponse, D2Api, Pager } from "../../../types/d2-api";
import { promiseMap } from "../../../utils/promises";
import { CsvData } from "../../common/CsvDataSource";
import { CsvWriterDataSource } from "../../common/CsvWriterCsvDataSource";
import { downloadFile } from "../../common/utils/download-file";
import { NamedRef } from "../../../domain/common/entities/Base";

export class CSYSummaryDefaultRepository implements CSYSummaryRepository {
    constructor(private api: D2Api) {}

    async get(options: CSYSummaryOptions): Promise<PaginatedObjects<SummaryItem>> {
        const { paging, year, orgUnitPaths, quarter, summaryType } = options;

        const period = !quarter ? year : `${year}${quarter}`;
        const orgUnitIds = getOrgUnitIdsFromPaths(orgUnitPaths);

        try {
            const rows = _.flattenDeep(
                await promiseMap(
                    summaryQueryStrings[summaryType as keyof typeof summaryQueryStrings],
                    async queryString => {
                        const rowGroup = await promiseMap(orgUnitIds, async orgUnitId => {
                            const analyticsReponse = await this.api.analytics
                                .get({
                                    dimension: [`pe:${period}`, `dx:IN_GROUP-${queryString}`],
                                    filter: [`ou:${orgUnitId}`],
                                    skipMeta: true,
                                    includeNumDen: true,
                                })
                                .getData();

                            const dataColumnValues = this.getColumnValue(analyticsReponse, "dx");
                            const percentageColumnValues = this.getColumnValue(analyticsReponse, "value");
                            const numeratorColumnValues = this.getColumnValue(analyticsReponse, "numerator");

                            const indicatorGroup: { displayName: string; indicators: NamedRef[] } = await this.api
                                .get<any>(`/indicatorGroups/${queryString}?fields=displayName,indicators[id,name]`)
                                .getData();

                            const indicatorsInGroup = indicatorGroup.indicators.filter(indicator =>
                                dataColumnValues.includes(indicator.id)
                            );

                            const groupName = _.chain(indicatorGroup.displayName)
                                .split(" ")
                                .filter(
                                    word =>
                                        word !== "ETA" &&
                                        word !== "Patient" &&
                                        !_.endsWith(word, "%") &&
                                        !_.startsWith(word, "(")
                                )
                                .join(" ")
                                .value();

                            const row = indicatorsInGroup.map(({ name: indicator }, index) => {
                                const indexOfGroupName = indicator.indexOf(groupName);

                                let firstLetter = 0;
                                for (let i = indexOfGroupName + groupName.length; i < indicator.length; i++) {
                                    if (indicator[i] === " " || indicator[i] === "-") {
                                        continue;
                                    }
                                    firstLetter = i;
                                    break;
                                }

                                const skipLetters = [" ", "<", "-"];
                                let lastLetter = 0;
                                let realLastLetter = 0;
                                for (let i = indicator.length; i > firstLetter; i--) {
                                    // @ts-ignore
                                    if (lastLetter === 0 && indicator[i] >= "0" && indicator[i] <= "9") {
                                        lastLetter = i;
                                        continue;
                                    }
                                    if (
                                        lastLetter !== 0 &&
                                        // @ts-ignore
                                        !skipLetters.includes(indicator[i]) &&
                                        // @ts-ignore
                                        (indicator[i] < "0" || indicator[i] > "9")
                                    ) {
                                        realLastLetter = i;
                                        break;
                                    }
                                }

                                const subGroup = indicator.slice(firstLetter, realLastLetter + 1);
                                const year = indicator.includes("Total")
                                    ? "Total"
                                    : (indicator.slice(realLastLetter + 1, lastLetter + 1) + " yr").trim();
                                const value = `${numeratorColumnValues[index]} (${percentageColumnValues[index]}%)`;

                                return {
                                    group: groupName,
                                    subGroup,
                                    yearLessThan1: year === "< 1 yr" ? value : "0 (0%)",
                                    year1To4: year === "1 - 4yr" ? value : "0 (0%)",
                                    year5To9: year === "5 - 9 yr" ? value : "0 (0%)",
                                    year10To14: year === "10 - 14 yr" ? value : "0 (0%)",
                                    year15To19: year === "15 - 19 yr" ? value : "0 (0%)",
                                    year20To40: year === "20 - 40 yr" ? value : "0 (0%)",
                                    year40To60: year === "40 - 60 yr" ? value : "0 (0%)",
                                    year60To80: year === "60 - 80 yr" ? value : "0 (0%)",
                                    yearGreaterThan80: year === "80+ yr" ? value : "0 (0%)",
                                    unknown: year === "Unknown" ? value : "0 (0%)",
                                    total: year === "Total" ? value : "0 (0%)",
                                };
                            });

                            const result: SummaryItem[] = _.chain(row)
                                .groupBy(row => `${row.group}-${row.subGroup}`)
                                .map(groupedRows => {
                                    return {
                                        group: groupedRows[0].group,
                                        subGroup: groupedRows[0].subGroup === "" ? "Other" : groupedRows[0].subGroup,
                                        yearLessThan1: groupedRows.reduce(
                                            (acc, obj) => (obj.yearLessThan1 !== "0 (0%)" ? obj.yearLessThan1 : acc),
                                            "0 (0%)"
                                        ),
                                        year1To4: groupedRows.reduce(
                                            (acc, obj) => (obj.year1To4 !== "0 (0%)" ? obj.year1To4 : acc),
                                            "0 (0%)"
                                        ),
                                        year5To9: groupedRows.reduce(
                                            (acc, obj) => (obj.year5To9 !== "0 (0%)" ? obj.year5To9 : acc),
                                            "0 (0%)"
                                        ),
                                        year10To14: groupedRows.reduce(
                                            (acc, obj) => (obj.year10To14 !== "0 (0%)" ? obj.year10To14 : acc),
                                            "0 (0%)"
                                        ),
                                        year15To19: groupedRows.reduce(
                                            (acc, obj) => (obj.year15To19 !== "0 (0%)" ? obj.year15To19 : acc),
                                            "0 (0%)"
                                        ),
                                        year20To40: groupedRows.reduce(
                                            (acc, obj) => (obj.year20To40 !== "0 (0%)" ? obj.year20To40 : acc),
                                            "0 (0%)"
                                        ),
                                        year40To60: groupedRows.reduce(
                                            (acc, obj) => (obj.year40To60 !== "0 (0%)" ? obj.year40To60 : acc),
                                            "0 (0%)"
                                        ),
                                        year60To80: groupedRows.reduce(
                                            (acc, obj) => (obj.year60To80 !== "0 (0%)" ? obj.year60To80 : acc),
                                            "0 (0%)"
                                        ),
                                        yearGreaterThan80: groupedRows.reduce(
                                            (acc, obj) =>
                                                obj.yearGreaterThan80 !== "0 (0%)" ? obj.yearGreaterThan80 : acc,
                                            "0 (0%)"
                                        ),
                                        unknown: groupedRows.reduce(
                                            (acc, obj) => (obj.unknown !== "0 (0%)" ? obj.unknown : acc),
                                            "0 (0%)"
                                        ),
                                        total: groupedRows.reduce(
                                            (acc, obj) => (obj.total !== "0 (0%)" ? obj.total : acc),
                                            "0 (0%)"
                                        ),
                                    };
                                })
                                .value();

                            return result;
                        });

                        return rowGroup;
                    }
                )
            );

            const pager: Pager = {
                page: paging.page,
                pageSize: paging.pageSize,
                pageCount: 1,
                total: 1,
            };

            return { pager, objects: rows };
        } catch (error) {
            console.debug(error);
            return { pager: { page: 1, pageCount: 1, pageSize: 20, total: 1 }, objects: [] };
        }
    }

    async save(filename: string, items: SummaryItem[]): Promise<void> {
        const headers = csvFields.map(field => ({ id: field, text: field }));
        const rows = items.map(
            (dataValue): SummaryItemRow => ({
                group: dataValue.group,
                subGroup: dataValue.subGroup,
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
    "patient-characteristics": [
        "yrtwRP26Q35",
        "IY9sVVwtt1Z",
        "Sdw6iy0I7Bv",
        "LWwKbbP7YgC",
        //"dYXNSdQFH3X",
        "fZKMM7uw3Ud",
        "yEg8gT6e7DC",
        "u5uO6aSPFbv",
        "MoBX2wbZ4Db",
        "Hd7fLgnzPQ8",
    ],
};

const csvFields = [
    "group",
    "subGroup",
    "yearLessThan1",
    "year1To4",
    "year5To9",
    "year10To14",
    "year15To19",
    "year20To40",
    "year40To60",
    "year60To80",
    "yearGreaterThan80",
    "unknown",
    "total",
] as const;

type CsvField = typeof csvFields[number];

type SummaryItemRow = Record<CsvField, string>;
