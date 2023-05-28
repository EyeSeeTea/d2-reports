import _ from "lodash";
import { PaginatedObjects } from "../../../domain/common/entities/PaginatedObjects";
import { AuditItem } from "../../../domain/reports/csy-audit-emergency/entities/AuditItem";
import {
    CSYAuditEmergencyOptions,
    CSYAuditEmergencyRepository,
} from "../../../domain/reports/csy-audit-emergency/repositories/CSYAuditEmergencyRepository";
import { AnalyticsResponse, D2Api, Pager } from "../../../types/d2-api";
import { getOrgUnitIdsFromPaths } from "../../../domain/common/entities/OrgUnit";
import { CsvWriterDataSource } from "../../common/CsvWriterCsvDataSource";
import { CsvData } from "../../common/CsvDataSource";
import { downloadFile } from "../../common/utils/download-file";
import { promiseMap } from "../../../utils/promises";

export class CSYAuditEmergencyDefaultRepository implements CSYAuditEmergencyRepository {
    constructor(private api: D2Api) {}

    async get(options: CSYAuditEmergencyOptions): Promise<PaginatedObjects<AuditItem>> {
        const { paging, year, orgUnitPaths, quarter, auditType } = options;
        const period = !quarter ? year : `${year}${quarter}`;
        const orgUnitIds = getOrgUnitIdsFromPaths(orgUnitPaths);
        const auditItems: AuditItem[] = [];

        try {
            const response = await promiseMap(
                auditQueryStrings[auditType as keyof typeof auditQueryStrings],
                async queryString => {
                    return await promiseMap(orgUnitIds, async orgUnitId => {
                        return await this.api
                            .get<AnalyticsResponse>(eventQueryUri(orgUnitId, period, queryString))
                            .getData();
                    });
                }
            );

            [...Array(response[0]?.length).keys()].map(a => {
                const res = _.compact(response.map(res => res[a]));
                const res2 = getAuditItems(auditType, res);

                auditItems.push(...res2);
                return auditItems;
            });

            const rowsInPage = _(auditItems)
                .drop((paging.page - 1) * paging.pageSize)
                .take(paging.pageSize)
                .value();

            const pager: Pager = {
                page: paging.page,
                pageSize: paging.pageSize,
                pageCount: Math.ceil(auditItems.length / paging.pageSize),
                total: auditItems.length,
            };

            return { pager, objects: rowsInPage };
        } catch (error) {
            console.debug(error);
            return { pager: { page: 1, pageCount: 1, pageSize: 10, total: 1 }, objects: [] };
        }
    }

    async save(filename: string, items: AuditItem[]): Promise<void> {
        const headers = csvFields.map(field => ({ id: field, text: field }));
        const rows = items.map(
            (dataValue): AuditItemRow => ({
                registerId: dataValue.registerId,
            })
        );
        const timestamp = new Date().toISOString();
        const csvDataSource = new CsvWriterDataSource();
        const csvData: CsvData<CsvField> = { headers, rows };
        const csvContents = `Time: ${timestamp}\n` + csvDataSource.toString(csvData);

        await downloadFile(csvContents, filename, "text/csv");
    }
}

const csvFields = ["registerId"] as const;

type CsvField = typeof csvFields[number];

type AuditItemRow = Record<CsvField, string>;

function eventQueryUri(orgUnit: string, period: string, query: string) {
    const uri =
        "/analytics/events/query/auqdJ66DqAT.json?dimension=pe:" +
        period +
        "&dimension=ou:" +
        orgUnit +
        query +
        "&pageSize=100000";
    return uri;
}

function findColumnIndex(response: AnalyticsResponse | undefined, columnId: string) {
    const headers = response?.headers ?? [];
    const columnHeader = headers.find(header => header.name === columnId);

    if (!columnHeader) return -1;
    return headers.indexOf(columnHeader);
}

function combineScores(
    sharedUid: string,
    columnUid: string,
    scores1: AnalyticsResponse | undefined,
    scores2: AnalyticsResponse | undefined,
    columnValues1: string[],
    columnValues2: string[],
    minValue: number,
    maxValue: number
) {
    const score1Shared = findColumnIndex(scores1, sharedUid);
    const score2Shared = findColumnIndex(scores2, sharedUid);
    const sharedIds = _.compact(_.intersection(columnValues1, columnValues2));

    const ids: Record<string, any> = {};

    const ind1 = findColumnIndex(scores1, columnUid);
    scores1?.rows.map(row => {
        if (sharedIds.includes(row[score1Shared] ?? "")) {
            ids[row[score1Shared] ?? ""] = row[ind1];
        }
        return ids;
    });

    const ind2 = findColumnIndex(scores2, columnUid);
    scores2?.rows.map(row => {
        if (sharedIds.includes(row[score2Shared] ?? "")) {
            ids[row[score2Shared] ?? ""] += row[ind2];
        }
        return ids;
    });

    for (const val in ids) {
        if (!(ids[val] >= minValue && ids[val] <= maxValue)) {
            delete ids[val];
        }
    }

    return Object.keys(ids);
}

function getColumnValue(response: AnalyticsResponse | undefined, columnId: string) {
    const columnIndex = findColumnIndex(response, columnId);
    const values: string[] = [];
    const rows = response?.rows ?? [];

    rows.map(row => values.push(String(row[columnIndex])));

    return values;
}

const auditQueryStrings = {
    mortality: [
        "&dimension=ijG1c7IqeZb:IN:7&dimension=QStbireWKjW&stage=mnNpBtanIQo",
        "&dimension=QStbireWKjW&dimension=CZhIs5wGCiz:IN:5&stage=mnNpBtanIQo",
        "&dimension=UQ8ENntnDDd&dimension=O38wkAQbK9z&dimension=NebmxV8fnTD&dimension=h0XlP7VstW7&dimension=QStbireWKjW&stage=mnNpBtanIQo",
    ],
    hypoxia: [
        "&dimension=AlkbwOe8hCK:IN:4&stage=mnNpBtanIQo",
        "&dimension=RBQXVln19aY:IN:2&dimension=QStbireWKjW&stage=mnNpBtanIQo",
        "&dimension=QStbireWKjW&filter=pvnRZkpycwP:LT:92&stage=mnNpBtanIQo",
    ],
    tachypnea: [
        "&dimension=AlkbwOe8hCK:IN:4&stage=mnNpBtanIQo",
        "&dimension=QStbireWKjW&dimension=CVodhbK2wQ2:GT:30&stage=mnNpBtanIQo",
        "&dimension=QStbireWKjW&dimension=CVodhbK2wQ2:LT:12&stage=mnNpBtanIQo",
    ],
    mental: [
        "&dimension=QStbireWKjW&dimension=AlkbwOe8hCK:IN:2;3;5&stage=mnNpBtanIQo",
        "&dimension=WJE7ozQ21LA&dimension=kj3SOKykiDg&dimension=QStbireWKjW&stage=mnNpBtanIQo",
    ],
    "all-mortality": [
        "&dimension=ijG1c7IqeZb:IN:7&dimension=QStbireWKjW&stage=mnNpBtanIQo",
        "&dimension=QStbireWKjW&dimension=CZhIs5wGCiz:IN:5&stage=mnNpBtanIQo",
    ],
    "emergency-unit": ["&dimension=ijG1c7IqeZb:IN:7&dimension=QStbireWKjW&stage=mnNpBtanIQo"],
    "hospital-mortality": ["&dimension=QStbireWKjW&dimension=CZhIs5wGCiz:IN:5&stage=mnNpBtanIQo"],
    "severe-injuries": [
        "&dimension=F8UsnxWi9XM:GE:1&dimension=h0XlP7VstW7:GE:3:LE:10&dimension=QStbireWKjW&stage=mnNpBtanIQo",
        "&dimension=NebmxV8fnTD:GE:1&dimension=fg1VDHZ2QkJ:GE:0:LE:3&dimension=QStbireWKjW&stage=mnNpBtanIQo",
        "&dimension=UQ8ENntnDDd&dimension=lbnI2bNoDVO:GE:1&dimension=QStbireWKjW&stage=mnNpBtanIQo",
        "&dimension=UQ8ENntnDDd&dimension=W7WKKF11CDB:GE:1&dimension=QStbireWKjW&stage=mnNpBtanIQo",
        "&dimension=O38wkAQbK9z&dimension=NCvjnccLi17:GE:1&dimension=QStbireWKjW&stage=mnNpBtanIQo",
        "&dimension=O38wkAQbK9z&dimension=xp4OMOI1c1z:GE:1&dimension=QStbireWKjW&stage=mnNpBtanIQo",
    ],
    "moderate-severe-injuries": [
        "&dimension=F8UsnxWi9XM:GE:1&dimension=h0XlP7VstW7:GE:3:LE:18&dimension=QStbireWKjW&stage=mnNpBtanIQo",
        "&dimension=NebmxV8fnTD:GE:1&dimension=fg1VDHZ2QkJ:GE:0:LE:10&dimension=QStbireWKjW&stage=mnNpBtanIQo",
        "&dimension=UQ8ENntnDDd&dimension=lbnI2bNoDVO:GE:1&dimension=QStbireWKjW&stage=mnNpBtanIQo",
        "&dimension=UQ8ENntnDDd&dimension=W7WKKF11CDB:GE:1&dimension=QStbireWKjW&stage=mnNpBtanIQo",
        "&dimension=O38wkAQbK9z&dimension=NCvjnccLi17:GE:1&dimension=QStbireWKjW&stage=mnNpBtanIQo",
        "&dimension=O38wkAQbK9z&dimension=xp4OMOI1c1z:GE:1&dimension=QStbireWKjW&stage=mnNpBtanIQo",
    ],
    "moderate-injuries": [
        "&dimension=F8UsnxWi9XM:GE:1&dimension=h0XlP7VstW7:GE:11:LE:18&dimension=QStbireWKjW&stage=mnNpBtanIQo",
        "&dimension=NebmxV8fnTD:GE:1&dimension=fg1VDHZ2QkJ:GE:4:LE:10&dimension=QStbireWKjW&stage=mnNpBtanIQo",
        "&dimension=UQ8ENntnDDd&dimension=lbnI2bNoDVO:GE:1&dimension=QStbireWKjW&stage=mnNpBtanIQo",
        "&dimension=UQ8ENntnDDd&dimension=W7WKKF11CDB:GE:1&dimension=QStbireWKjW&stage=mnNpBtanIQo",
        "&dimension=O38wkAQbK9z&dimension=NCvjnccLi17:GE:1&dimension=QStbireWKjW&stage=mnNpBtanIQo",
        "&dimension=O38wkAQbK9z&dimension=xp4OMOI1c1z:GE:1&dimension=QStbireWKjW&stage=mnNpBtanIQo",
    ],
};

function getAuditItems(auditType: string, response: AnalyticsResponse[]) {
    switch (auditType) {
        case "mortality": {
            // for (KTS=14-16) OR (MGAP=23-29) OR (GAP=19-24) OR (RTS=11-12)
            const scoreRows = response[2]?.rows ?? [];
            const scoreIds: string[] = [];
            scoreRows.map(scoreRow => {
                const gap = Number(scoreRow[findColumnIndex(response[2], "h0XlP7VstW7")]);
                const mgap = Number(scoreRow[findColumnIndex(response[2], "NebmxV8fnTD")]);
                const rts = Number(scoreRow[findColumnIndex(response[2], "NebmxV8fnTD")]);
                const kts = Number(scoreRow[findColumnIndex(response[2], "UQ8ENntnDDd")]);

                if (
                    (gap >= 19 && gap <= 24) ||
                    (mgap >= 23 && mgap <= 29) ||
                    (rts >= 11 && rts <= 12) ||
                    (kts >= 14 && kts <= 16)
                )
                    scoreIds.push(String(scoreRow[findColumnIndex(response[2], "QStbireWKjW")]));

                return scoreIds;
            });

            const euMortalityIds = getColumnValue(response[0], "QStbireWKjW");
            const inpMortalityIds = getColumnValue(response[1], "QStbireWKjW");

            const mortality = _.union(euMortalityIds, inpMortalityIds);
            const matchedIds = _.compact(_.intersection(mortality, scoreIds));

            const auditItems: AuditItem[] = matchedIds.map(matchedId => ({
                registerId: matchedId,
            }));

            return auditItems;
        }
        case "hypoxia": {
            const euProcedureIds = getColumnValue(response[0], "QStbireWKjW");
            const oxMethIds = getColumnValue(response[1], "QStbireWKjW");
            const oxSatIds = getColumnValue(response[2], "QStbireWKjW");
            const matchedIds = _.union(_.intersection(euProcedureIds, oxMethIds), oxSatIds);

            const auditItems: AuditItem[] = matchedIds.map(matchedId => ({
                registerId: matchedId,
            }));

            return auditItems;
        }
        case "tachypnea": {
            const euProcedureIds = getColumnValue(response[0], "QStbireWKjW");
            const spontaneousRR30 = getColumnValue(response[1], "QStbireWKjW");
            const spontaneousRR12 = getColumnValue(response[2], "QStbireWKjW");
            const matchedIds = _.union(spontaneousRR30, spontaneousRR12).filter(item => !euProcedureIds.includes(item));

            const auditItems: AuditItem[] = matchedIds.map(matchedId => ({
                registerId: matchedId,
            }));

            return auditItems;
        }
        case "mental": {
            const euProcedureIds = getColumnValue(response[0], "QStbireWKjW");
            const rows = response[1]?.rows ?? [];
            const gcsAndAvpuIds: string[] = [];
            rows.map(
                row =>
                    (Number(row[findColumnIndex(response[1], "WJE7ozQ21LA")]) < 8 ||
                        // @ts-ignore
                        [3, 4].includes(row[findColumnIndex(response[1], "kj3SOKykiDg")])) &&
                    gcsAndAvpuIds.push(String(row[findColumnIndex(response[1], "QStbireWKjW")]))
            );

            const matchedIds = gcsAndAvpuIds.filter(item => !euProcedureIds.includes(item));

            const auditItems: AuditItem[] = matchedIds.map(matchedId => ({
                registerId: matchedId,
            }));

            return auditItems;
        }
        case "all-mortality": {
            const euMortIds = getColumnValue(response[0], "QStbireWKjW");
            const inpMortIds = getColumnValue(response[1], "QStbireWKjW");
            const matchedIds = _.union(euMortIds, inpMortIds);

            const auditItems: AuditItem[] = matchedIds.map(matchedId => ({
                registerId: matchedId,
            }));

            return auditItems;
        }
        case "emergency-unit": {
            const euMortIds = getColumnValue(response[0], "QStbireWKjW");

            const auditItems: AuditItem[] = euMortIds.map(euMortId => ({
                registerId: euMortId,
            }));

            return auditItems;
        }
        case "hospital-mortality": {
            const inpMortIds = getColumnValue(response[0], "QStbireWKjW");

            const auditItems: AuditItem[] = inpMortIds.map(inpMortId => ({
                registerId: inpMortId,
            }));

            return auditItems;
        }
        case "severe-injuries": {
            // audit definition = (KTS<11) OR (MGAP=3-17) OR (GAP=3-10) OR (RTS≤3)
            const gapIds = getColumnValue(response[0], "QStbireWKjW");
            const rtsIds = getColumnValue(response[1], "QStbireWKjW");

            const ktsInjuries = getColumnValue(response[2], "QStbireWKjW");
            const ktsIcc = getColumnValue(response[3], "QStbireWKjW");
            const ktsIds = combineScores(
                "QStbireWKjW",
                "UQ8ENntnDDd",
                response[2],
                response[3],
                ktsInjuries,
                ktsIcc,
                0,
                10
            );

            const mgapDetails = getColumnValue(response[4], "QStbireWKjW");
            const mgapIcc = getColumnValue(response[5], "QStbireWKjW");
            const mgapIds = combineScores(
                "QStbireWKjW",
                "O38wkAQbK9z",
                response[4],
                response[5],
                mgapDetails,
                mgapIcc,
                3,
                17
            );

            const matchedIds = _.intersection(..._.filter([gapIds, rtsIds, ktsIds, mgapIds], ids => !_.isEmpty(ids)));
            const auditItems: AuditItem[] = matchedIds.map(matchedId => ({
                registerId: matchedId,
            }));

            return auditItems;
        }
        case "moderate-severe-injuries": {
            // audit definition = (KTS≤13) OR (MGAP≤22) OR (GAP≤18) OR (RTS≤10)
            const gapIds = getColumnValue(response[0], "QStbireWKjW");
            const rtsIds = getColumnValue(response[1], "QStbireWKjW");

            const ktsInjuries = getColumnValue(response[2], "QStbireWKjW");
            const ktsIcc = getColumnValue(response[3], "QStbireWKjW");
            const ktsIds = combineScores(
                "QStbireWKjW",
                "UQ8ENntnDDd",
                response[2],
                response[3],
                ktsInjuries,
                ktsIcc,
                0,
                13
            );

            const mgapDetails = getColumnValue(response[4], "QStbireWKjW");
            const mgapIcc = getColumnValue(response[5], "QStbireWKjW");
            const mgapIds = combineScores(
                "QStbireWKjW",
                "O38wkAQbK9z",
                response[4],
                response[5],
                mgapDetails,
                mgapIcc,
                3,
                22
            );

            const matchedIds = _.intersection(..._.filter([gapIds, rtsIds, ktsIds, mgapIds], ids => !_.isEmpty(ids)));
            const auditItems: AuditItem[] = matchedIds.map(matchedId => ({
                registerId: matchedId,
            }));

            return auditItems;
        }
        case "moderate-injuries": {
            // audit definition = (KTS=11-13) OR (MGAP=18-22) OR (GAP=11-18) OR (RTS=4-10)
            const gapIds = getColumnValue(response[0], "QStbireWKjW");
            const rtsIds = getColumnValue(response[1], "QStbireWKjW");

            const ktsInjuries = getColumnValue(response[2], "QStbireWKjW");
            const ktsIcc = getColumnValue(response[3], "QStbireWKjW");
            const ktsIds = combineScores(
                "QStbireWKjW",
                "UQ8ENntnDDd",
                response[2],
                response[3],
                ktsInjuries,
                ktsIcc,
                11,
                13
            );

            const mgapDetails = getColumnValue(response[4], "QStbireWKjW");
            const mgapIcc = getColumnValue(response[5], "QStbireWKjW");
            const mgapIds = combineScores(
                "QStbireWKjW",
                "O38wkAQbK9z",
                response[4],
                response[5],
                mgapDetails,
                mgapIcc,
                18,
                22
            );

            const matchedIds = _.intersection(..._.filter([gapIds, rtsIds, ktsIds, mgapIds], ids => !_.isEmpty(ids)));
            const auditItems: AuditItem[] = matchedIds.map(matchedId => ({
                registerId: matchedId,
            }));

            return auditItems;
        }
        default:
            return [];
    }
}
