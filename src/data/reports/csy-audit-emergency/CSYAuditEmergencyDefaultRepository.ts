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

        try {
            const response = _(
                await promiseMap(
                    auditQueryStrings[auditType as keyof typeof auditQueryStrings],
                    async queryString =>
                        await promiseMap(orgUnitIds, async orgUnitId => {
                            return await this.api
                                .get<AnalyticsResponse>(this.eventQueryUri(orgUnitId, period, queryString))
                                .getData();
                        })
                )
            )
                .flatten()
                .value();

            const auditItems = getAuditItems(auditType, response);
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
    "low-acuity": ["&dimension=wfFqGrIfAa4:IN:3;34;29;24;25;19;20;14;15;9;10", "&dimension=ijG1c7IqeZb:IN:6"],
    "highest-triage": [
        "&dimension=wfFqGrIfAa4:IN:1;6;21;22;11;12;16;27;32",
        "&dimension=xCMeFQWSPCb",
        "&dimension=yJfWxXN5Rel",
    ],
    "initial-rbg": ["&dimension=bN3ZHmLQX4r:IN:3", "&dimension=BhjTEQUYYO9"],
    "shock-ivf": [
        "&dimension=aZCay6g4LX6:GE:16",
        "&dimension=PaU3O4hknYt:IN:3",
        "&dimension=hWdpU2Wqfvy:LT:90",
        "&dimension=neKXuzIRaFm",
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
            const triageCategoryIds = getColumnValue(response[0], "QStbireWKjW");
            const euICUIds = getColumnValue(response[1], "QStbireWKjW");

            const matchedIds = _.intersection(triageCategoryIds, euICUIds);

            const auditItems: AuditItem[] = matchedIds.map(matchedId => ({
                registerId: matchedId,
            }));

            return auditItems;
        }
        case "highest-triage": {
            const triageCategoryIds = getColumnValue(response[0], "QStbireWKjW");
            const dateIds = getColumnValue(response[1], "QStbireWKjW");

            const arrivalDates = _.map(getColumnValue(response[1], "xCMeFQWSPCb"), arrivalDate => {
                return new Date(arrivalDate);
            });
            const providerDates = _.map(getColumnValue(response[2], "yJfWxXN5Rel"), providerDate => {
                return new Date(providerDate);
            });

            const timeDiffIds = _.filter(dateIds, (_, index) => {
                const arrivalDate = arrivalDates[index]?.getTime() ?? 0;
                const providerDate = providerDates[index]?.getTime() ?? 0;

                return providerDate - arrivalDate > 1800000;
            });

            const matchedIds = _.intersection(triageCategoryIds, timeDiffIds);

            const auditItems: AuditItem[] = matchedIds.map(matchedId => ({
                registerId: matchedId,
            }));

            return auditItems;
        }
        case "initial-rbg": {
            const initialRBGIds = getColumnValue(response[0], "QStbireWKjW");
            const glucoseInEUIds = getColumnValue(response[1], "QStbireWKjW");
            const glucoseEvents = getColumnValue(response[1], "BhjTEQUYYO9");

            const glucoseNotTickedIds = _.filter(glucoseInEUIds, (_, index) => glucoseEvents[index] !== "1");

            const matchedIds = _.intersection(initialRBGIds, glucoseNotTickedIds);

            const auditItems: AuditItem[] = matchedIds.map(matchedId => ({
                registerId: matchedId,
            }));

            return auditItems;
        }
        case "shock-ivf": {
            const ageGreaterThan16Ids = getColumnValue(response[0], "QStbireWKjW");
            const ageCategoryAdultUnknownIds = getColumnValue(response[1], "QStbireWKjW");
            const initialSBPIds = getColumnValue(response[2], "QStbireWKjW");
            const ivfInEUIds = getColumnValue(response[3], "QStbireWKjW");
            const ivfEvents = getColumnValue(response[3], "neKXuzIRaFm");

            const ageAdultIds = _.union(ageGreaterThan16Ids, ageCategoryAdultUnknownIds);
            const ivfNotTickedIds = _.filter(ivfInEUIds, (_, index) => ivfEvents[index] !== "1");

            const matchedIds = _.intersection(ageAdultIds, initialSBPIds, ivfNotTickedIds);

            const auditItems: AuditItem[] = matchedIds.map(matchedId => ({
                registerId: matchedId,
            }));

            return auditItems;
        }
        default:
            return [];
    }
}
