import _ from "lodash";
import { getOrgUnitIdsFromPaths } from "../../../domain/common/entities/OrgUnit";
import { emptyPage, paginate, PaginatedObjects } from "../../../domain/common/entities/PaginatedObjects";
import { SummaryItem, SummaryType } from "../../../domain/reports/csy-summary-patient/entities/SummaryItem";
import { D2Api } from "../../../types/d2-api";
import { promiseMap } from "../../../utils/promises";
import { CsvData } from "../../common/CsvDataSource";
import { CsvWriterDataSource } from "../../common/CsvWriterCsvDataSource";
import { downloadFile } from "../../common/utils/download-file";
import { NamedRef } from "../../../domain/common/entities/Base";
import {
    SummaryItemRepository,
    SummaryOptions,
} from "../../../domain/reports/csy-summary-patient/repositories/SummaryItemRepository";
import { AuditAnalyticsData } from "../../../domain/common/entities/AuditAnalyticsResponse";
import { Maybe } from "../../../types/utils";

type IndicatorGroup = {
    displayName: string;
    indicators: NamedRef[];
};

export class SummaryItemD2Repository implements SummaryItemRepository {
    constructor(private api: D2Api) {}

    async get(options: SummaryOptions): Promise<PaginatedObjects<SummaryItem>> {
        const { paging, year, orgUnitPaths, quarter, summaryType } = options;

        const period = !quarter ? year : `${year}${quarter}`;
        const orgUnitIds = getOrgUnitIdsFromPaths(orgUnitPaths);

        if (_.isEmpty(orgUnitIds)) return emptyPage;

        const rows = await this.getSummaryItems(summaryType, period, orgUnitIds);

        return paginate(rows, paging);
    }

    private async getSummaryItems(
        summaryType: SummaryType,
        period: string,
        orgUnitIds: string[]
    ): Promise<SummaryItem[]> {
        return _.flatten(
            await promiseMap(summaryQueryStrings[summaryType], async queryString => {
                const analyticsResponse = await this.getAnalyticsResponse(period, queryString, orgUnitIds);
                const analyticsData = new AuditAnalyticsData(analyticsResponse);

                const indicatorGroup = (await this.getIndicatorGroup(queryString)) ?? {
                    displayName: "",
                    indicators: [],
                };

                return this.getSummaryRows(analyticsData, indicatorGroup);
            })
        );
    }

    private getSummaryRows(analyticsData: AuditAnalyticsData, indicatorGroup: IndicatorGroup): SummaryItem[] {
        const dataColumnValues = analyticsData.getColumnValues("dx");
        const percentageColumnValues = analyticsData.getColumnValues("value");
        const numeratorColumnValues = analyticsData.getColumnValues("numerator");

        const { indicators, displayName } = indicatorGroup;
        const indicatorsInGroup = indicators.filter(indicator => dataColumnValues.includes(indicator.id));
        const groupName = getIndicatorGroupName(displayName);

        const rows = _.map(
            _.zip(indicatorsInGroup, numeratorColumnValues, percentageColumnValues),
            ([indicator, numeratorColumnValue, percentageColumnValue]) => {
                const { name: indicatorName } = indicator ?? { name: "" };
                const { subGroup, yearType } = processName(indicatorName, groupName);
                const value = `${numeratorColumnValue} (${percentageColumnValue}%)`;

                return {
                    group: groupName,
                    subGroup: subGroup,
                    yearLessThan1: this.getSummaryItemValue(yearType, "< 1 yr", value),
                    year1To4: this.getSummaryItemValue(yearType, "1 - 4 yr", value),
                    year5To9: this.getSummaryItemValue(yearType, "5 - 9 yr", value),
                    year10To14: this.getSummaryItemValue(yearType, "10 - 14 yr", value),
                    year15To19: this.getSummaryItemValue(yearType, "15 - 19 yr", value),
                    year20To40: this.getSummaryItemValue(yearType, "20 - 40 yr", value),
                    year40To60: this.getSummaryItemValue(yearType, "40 - 60 yr", value),
                    year60To80: this.getSummaryItemValue(yearType, "60 - 80 yr", value),
                    yearGreaterThan80: this.getSummaryItemValue(yearType, "80+ yr", value),
                    unknown: this.getSummaryItemValue(yearType, "Unknown", value),
                    total: this.getSummaryItemValue(yearType, "Total", value),
                };
            }
        );

        return buildSummaryRows(rows);
    }

    private getSummaryItemValue(yearType: string, yearTypeValue: string, value: string) {
        return yearType === yearTypeValue ? value : "0 (0%)";
    }

    private async getIndicatorGroup(indicatorGroupId: string): Promise<Maybe<IndicatorGroup>> {
        const { indicatorGroups } = await this.api.metadata
            .get({
                indicatorGroups: {
                    fields: {
                        displayName: true,
                        indicators: {
                            id: true,
                            name: true,
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

        return _.first(indicatorGroups);
    }

    private async getAnalyticsResponse(period: string, queryString: string, orgUnitIds: string[]) {
        return await this.api.analytics
            .get({
                dimension: [`pe:${period}`, `dx:IN_GROUP-${queryString}`],
                filter: [`ou:${orgUnitIds.join(";")}`],
                skipMeta: true,
                includeNumDen: true,
            })
            .getData();
    }

    async save(filename: string, items: SummaryItem[]): Promise<void> {
        const headers = csvFields.map(field => ({ id: field, text: field }));
        const rows = items.map(
            (dataValue): SummaryItemRow => ({
                group: dataValue.group,
                subGroup: dataValue.subGroup,
                yearLessThan1: dataValue.yearLessThan1,
                year1To4: dataValue.year1To4,
                year5To9: dataValue.year5To9,
                year10To14: dataValue.year15To19,
                year15To19: dataValue.year15To19,
                year20To40: dataValue.year20To40,
                year40To60: dataValue.year40To60,
                year60To80: dataValue.year60To80,
                yearGreaterThan80: dataValue.yearGreaterThan80,
                unknown: dataValue.unknown,
                total: dataValue.total,
            })
        );

        const csvDataSource = new CsvWriterDataSource();
        const csvData: CsvData<CsvField> = { headers, rows };
        const csvContents = csvDataSource.toString(csvData);

        await downloadFile(csvContents, filename, "text/csv");
    }
}

const metadata = {
    indicatorGroups: {
        sexPatientId: "yrtwRP26Q35",
        medicalComorbiditiesId: "IY9sVVwtt1Z",
        injuryMechanismId: "Sdw6iy0I7Bv",
        injuryTypeId: "LWwKbbP7YgC",
        injuryLocationId: "dYXNSdQFH3X",
        arrivalModeId: "fZKMM7uw3Ud",
        otUtilizationId: "yEg8gT6e7DC",
        lengthOfStayId: "u5uO6aSPFbv",
        dispositionId: "MoBX2wbZ4Db",
        mortalityId: "Hd7fLgnzPQ8",
    },
};

const summaryQueryStrings = {
    patientCharacteristics: [
        metadata.indicatorGroups.sexPatientId,
        metadata.indicatorGroups.medicalComorbiditiesId,
        metadata.indicatorGroups.injuryMechanismId,
        metadata.indicatorGroups.injuryTypeId,
        metadata.indicatorGroups.injuryLocationId,
        metadata.indicatorGroups.arrivalModeId,
        metadata.indicatorGroups.otUtilizationId,
        metadata.indicatorGroups.lengthOfStayId,
        metadata.indicatorGroups.dispositionId,
        metadata.indicatorGroups.mortalityId,
    ],
};

const yearTypes = {
    yearLessThan1: "< 1 yr",
    year1To4: "1 - 4 yr",
    year5To9: "5 - 9 yr",
    year10To14: "10 - 14 yr",
    year15To19: "15 - 19 yr",
    year20To40: "20 - 40 yr",
    year40To60: "40 - 60 yr",
    year60To80: "60 - 80 yr",
    yearGreaterThan80: "80+ yr",
    total: "Total",
    unknown: "Unknown",
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

function getIndicatorGroupName(displayName: string) {
    return _(displayName)
        .split(" ")
        .filter(word => word !== "ETA" && word !== "Patient" && !_.endsWith(word, "%") && !_.startsWith(word, "("))
        .join(" ")
        .valueOf();
}

function cleanIndicatorName(indicatorName: string): string {
    const cleanedString = _.flow([
        (name: string) => _.replace(name, /^ETA\s*/, ""), // Remove "ETA"
        (name: string) => _.replace(name, /\s*Patient\s*%\s*\((events)\)\s*$/gi, ""), // Remove "Patient %(events)"
        (name: string) => _.replace(name, /(\(%\)\(events\)|""\(%\) \(events\)|%\s*\(events\))/gi, ""), // Remove "(%)(events)"
        (name: string) => _.replace(name, /\(avg\)\(events\)|""\(avg\) \(events\)|\(avg\)|\(events\)/gi, ""), // Remove "(avg)(events)"
        (name: string) => _.replace(name, /\(sd\)\(events\)|""\(sd\) \(events\)|\(sd\)|\(events\)/gi, ""), // Remove "(SD)(events)"
    ])(indicatorName);

    return cleanedString;
}

function processName(indicatorName: string, groupName: string): { subGroup: string; yearType: string } {
    const cleanedString = cleanIndicatorName(indicatorName);

    const cleanedFromGroupName = _.replace(cleanedString, groupName, ""); // Remove groupName
    const matchedYear = _.values(yearTypes).find(type => cleanedString.includes(type)) ?? "Unknown";
    const subGroup = _.replace(cleanedFromGroupName, matchedYear, "").trim() || "Other"; // Remove matchedYearType

    return {
        subGroup: _.trimStart(subGroup, "-").trim(),
        yearType: matchedYear,
    };
}

function buildSummaryRows(rows: SummaryItemRow[]): SummaryItem[] {
    return _(rows)
        .groupBy(row => `${row.group}-${row.subGroup}`)
        .map(groupedRows => {
            return {
                group: groupedRows[0].group,
                subGroup: groupedRows[0].subGroup,
                yearLessThan1: groupedRows.reduce((acc, obj) => getRowValue(obj.yearLessThan1, acc), "0 (0%)"),
                year1To4: groupedRows.reduce((acc, obj) => getRowValue(obj.year1To4, acc), "0 (0%)"),
                year5To9: groupedRows.reduce((acc, obj) => getRowValue(obj.year5To9, acc), "0 (0%)"),
                year10To14: groupedRows.reduce((acc, obj) => getRowValue(obj.year10To14, acc), "0 (0%)"),
                year15To19: groupedRows.reduce((acc, obj) => getRowValue(obj.year15To19, acc), "0 (0%)"),
                year20To40: groupedRows.reduce((acc, obj) => getRowValue(obj.year20To40, acc), "0 (0%)"),
                year40To60: groupedRows.reduce((acc, obj) => getRowValue(obj.year40To60, acc), "0 (0%)"),
                year60To80: groupedRows.reduce((acc, obj) => getRowValue(obj.year60To80, acc), "0 (0%)"),
                yearGreaterThan80: groupedRows.reduce((acc, obj) => getRowValue(obj.yearGreaterThan80, acc), "0 (0%)"),
                unknown: groupedRows.reduce((acc, obj) => getRowValue(obj.unknown, acc), "0 (0%)"),
                total: groupedRows.reduce((acc, obj) => getRowValue(obj.total, acc), "0 (0%)"),
            };
        })
        .value();
}

function getRowValue(obj: string, acc: string): string {
    return obj !== "0 (0%)" ? obj : acc;
}
