import _ from "lodash";
import { PaginatedObjects } from "../../../domain/common/entities/PaginatedObjects";
import { AuditItem } from "../../../domain/reports/csy-audit-trauma/entities/AuditItem";
import {
    CSYAuditTraumaOptions,
    CSYAuditTraumaRepository,
} from "../../../domain/reports/csy-audit-trauma/repositories/CSYAuditTraumaRepository";
import { AnalyticsResponse, D2Api, Pager } from "../../../types/d2-api";
import { getOrgUnitIdsFromPaths } from "../../../domain/common/entities/OrgUnit";
import { CsvWriterDataSource } from "../../common/CsvWriterCsvDataSource";
import { CsvData } from "../../common/CsvDataSource";
import { downloadFile } from "../../common/utils/download-file";
import { promiseMap } from "../../../utils/promises";

export class CSYAuditTraumaDefaultRepository implements CSYAuditTraumaRepository {
    constructor(private api: D2Api) {}

    async get(options: CSYAuditTraumaOptions): Promise<PaginatedObjects<AuditItem>> {
        const { paging, year, orgUnitPaths, quarter, auditType } = options;
        const period = !quarter ? year : `${year}${quarter}`;
        const orgUnitIds = getOrgUnitIdsFromPaths(orgUnitPaths);
        const auditItems: AuditItem[] = [];

        try {
            const response = await promiseMap(
                auditQueryStrings[auditType as keyof typeof auditQueryStrings],
                async queryString =>
                    await promiseMap(
                        orgUnitIds,
                        async orgUnitId =>
                            await this.api
                                .get<AnalyticsResponse>(this.eventQueryUri(orgUnitId, period, queryString))
                                .getData()
                    )
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

    private eventQueryUri(orgUnit: string, period: string, query: string) {
        const uri =
            // zdyu1RXVKg3 => WHO Clinical Registry - Emergency Care program
            "/analytics/events/query/zdyu1RXVKg3.json?dimension=pe:" +
            period +
            "&dimension=ou:" +
            orgUnit +
            query +
            // QStbireWKjW => ETA Registry ID dataElement
            // o8Hw1OCD7Tr => WHO Clinical Registry - Emergency Care program stage
            "&dimension=QStbireWKjW&stage=o8Hw1OCD7Tr&pageSize=100000";
        return uri;
    }
}

const csvFields = ["registerId"] as const;

type CsvField = typeof csvFields[number];

type AuditItemRow = Record<CsvField, string>;

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
    "overall-mortality": ["&dimension=ijG1c7IqeZb:IN:7", "&dimension=CZhIs5wGCiz:IN:5"],
    "low-acuity": [
        "&dimension=wfFqGrIfAa4:like:Green",
        "&dimension=wfFqGrIfAa4:like:Category%204",
        "&dimension=wfFqGrIfAa4:like:Category%205",
        "&dimension=wfFqGrIfAa4:like:Level%20IV",
        "&dimension=wfFqGrIfAa4:like:Level%20V",
        "&dimension=wfFqGrIfAa4:like:Level%204",
        "&dimension=wfFqGrIfAa4:like:Level%205",
        "&dimension=wfFqGrIfAa4:like:Priority%203",
        "&dimension=wfFqGrIfAa4:like:Minor(Green)",
        //"&dimension=wfFqGrIfAa4:like:Standard(Green,4)",
        //"&dimension=wfFqGrIfAa4:like:Non-urgent(Blue,5)",
        //"&dimension=ijG1c7IqeZb:in:6"
    ],
    "highest-triage": [
        "&dimension=wfFqGrIfAa4:like:Red",
        "&dimension=wfFqGrIfAa4:like:Category%201",
        "&dimension=wfFqGrIfAa4:like:Level%20I",
        "&dimension=wfFqGrIfAa4:like:Level%20II",
        "&dimension=wfFqGrIfAa4:like:Level%201",
        "&dimension=wfFqGrIfAa4:like:Level%202",
        "&dimension=wfFqGrIfAa4:like:Priority%201",
        "&dimension=wfFqGrIfAa4:like:Immediate(Red)",
        //"&dimension=wfFqGrIfAa4:like:Immediate(Red,1)",
    ],
    "initial-rbg": [
        "&dimension=bN3ZHmLQX4r:IN:3",
        //"&dimension=BhjTEQUYYO9:eq:true"
    ],
};

function getAuditItems(auditType: string, response: AnalyticsResponse[]) {
    switch (auditType) {
        case "overall-mortality": {
            const euMortalityIds = getColumnValue(response[0], "QStbireWKjW");
            const inpMortalityIds = getColumnValue(response[1], "QStbireWKjW");

            const matchedIds = _.compact(_.union(euMortalityIds, inpMortalityIds));

            const auditItems: AuditItem[] = matchedIds.map(matchedId => ({
                registerId: matchedId,
            }));

            return auditItems;
        }
        case "low-acuity": {
            const triageGreenIds = getColumnValue(response[0], "QStbireWKjW");
            const triageCategory4Ids = getColumnValue(response[1], "QStbireWKjW");
            const triageCategory5Ids = getColumnValue(response[2], "QStbireWKjW");
            const triageLevelIVIds = getColumnValue(response[3], "QStbireWKjW");
            const triageLevelVIds = getColumnValue(response[4], "QStbireWKjW");
            const triageLevel4Ids = getColumnValue(response[5], "QStbireWKjW");
            const triageLevel5Ids = getColumnValue(response[6], "QStbireWKjW");
            const triagePriority3Ids = getColumnValue(response[7], "QStbireWKjW");
            const triageMinorGreenIds = getColumnValue(response[8], "QStbireWKjW");
            const triageStandardGreenIds = getColumnValue(response[9], "QStbireWKjW");
            const triageNonUrgentIds = getColumnValue(response[10], "QStbireWKjW");

            const triageIds = _.union(
                triageGreenIds,
                triageCategory4Ids,
                triageCategory5Ids,
                triageLevel4Ids,
                triageLevel5Ids,
                triageLevelIVIds,
                triageLevelVIds,
                triagePriority3Ids,
                triageMinorGreenIds,
                triageStandardGreenIds,
                triageNonUrgentIds
            );

            const euICUIds = getColumnValue(response[11], "QStbireWKjW");

            const matchedIds = _.intersection(triageIds, euICUIds);

            const auditItems: AuditItem[] = matchedIds.map(matchedId => ({
                registerId: matchedId,
            }));

            return auditItems;
        }
        case "highest-triage": {
            const triageRedIds = getColumnValue(response[0], "QStbireWKjW");
            const triageCategory1Ids = getColumnValue(response[1], "QStbireWKjW");
            const triageLevelIIds = getColumnValue(response[3], "QStbireWKjW");
            const triageLevelIIIds = getColumnValue(response[4], "QStbireWKjW");
            const triageLevel1Ids = getColumnValue(response[5], "QStbireWKjW");
            const triageLevel2Ids = getColumnValue(response[6], "QStbireWKjW");
            const triagePriority1Ids = getColumnValue(response[7], "QStbireWKjW");
            const triageImmediateRedIds = getColumnValue(response[8], "QStbireWKjW");
            const triageImmediateRed1Ids = getColumnValue(response[10], "QStbireWKjW");

            const triageIds = _.union(
                triageRedIds,
                triageCategory1Ids,
                triageLevelIIds,
                triageLevelIIIds,
                triageLevel1Ids,
                triageLevel2Ids,
                triagePriority1Ids,
                triageImmediateRedIds,
                triageImmediateRed1Ids
            );

            const matchedIds = _.intersection(triageIds);

            const auditItems: AuditItem[] = matchedIds.map(matchedId => ({
                registerId: matchedId,
            }));

            return auditItems;
        }
        case "initial-rbg": {
            const initialRBGIds = getColumnValue(response[0], "QStbireWKjW");
            const glucoseInEUIds = getColumnValue(response[1], "QStbireWKjW");

            const matchedIds = _.difference(initialRBGIds, glucoseInEUIds);

            const auditItems: AuditItem[] = matchedIds.map(matchedId => ({
                registerId: matchedId,
            }));

            return auditItems;
        }
        default:
            return [];
    }
}
