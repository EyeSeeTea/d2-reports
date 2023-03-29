import _ from "lodash";
import { PaginatedObjects } from "../../../domain/common/entities/PaginatedObjects";
import { AuditItem } from "../../../domain/reports/csy-audit/entities/AuditItem";
import { CSYAuditOptions, CSYAuditRepository } from "../../../domain/reports/csy-audit/repositories/CSYAuditRepository";
import { AnalyticsResponse, D2Api, Pager } from "../../../types/d2-api";
import { getOrgUnitIdsFromPaths } from "../../../domain/common/entities/OrgUnit";
import { CsvWriterDataSource } from "../../common/CsvWriterCsvDataSource";
import { CsvData } from "../../common/CsvDataSource";
import { downloadFile } from "../../common/utils/download-file";
import { promiseMap } from "../../../utils/promises";

export class CSYAuditDefaultRepository implements CSYAuditRepository {
    constructor(private api: D2Api) {}

    async get(options: CSYAuditOptions): Promise<PaginatedObjects<AuditItem>> {
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

            const pager: Pager = {
                page: paging.page,
                pageSize: paging.pageSize,
                pageCount: Math.ceil(auditItems.length / paging.pageSize),
                total: auditItems.length,
            };

            return { pager, objects: auditItems };
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
        default:
            return [];
    }
}
