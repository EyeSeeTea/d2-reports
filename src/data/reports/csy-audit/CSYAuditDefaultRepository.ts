import _ from "lodash";
import { PaginatedObjects } from "../../../domain/common/entities/PaginatedObjects";
import { AuditItem } from "../../../domain/reports/csy-audit/entities/AuditItem";
import { CSYAuditOptions, CSYAuditRepository } from "../../../domain/reports/csy-audit/repositories/CSYAuditRepository";
import { AnalyticsResponse, D2Api, Pager } from "../../../types/d2-api";
import { DataStoreStorageClient } from "../../common/clients/storage/DataStoreStorageClient";
import { StorageClient } from "../../common/clients/storage/StorageClient";
import { Instance } from "../../common/entities/Instance";
import { getOrgUnitIdsFromPaths } from "../../../domain/common/entities/OrgUnit";
import { CsvWriterDataSource } from "../../common/CsvWriterCsvDataSource";
import { CsvData } from "../../common/CsvDataSource";
import { downloadFile } from "../../common/utils/download-file";
import { promiseMap } from "../../../utils/promises";

export class CSYAuditDefaultRepository implements CSYAuditRepository {
    private storageClient: StorageClient;
    private globalStorageClient: StorageClient;

    constructor(private api: D2Api) {
        const instance = new Instance({ url: this.api.baseUrl });
        this.storageClient = new DataStoreStorageClient("user", instance);
        this.globalStorageClient = new DataStoreStorageClient("global", instance);
    }

    async get(options: CSYAuditOptions): Promise<PaginatedObjects<AuditItem>> {
        const { paging, year, orgUnitPaths, quarter, auditType } = options;

        const { objects } = await this.api.models.dataElements
            .get({
                fields: { id: true },
                filter: { name: { $like: "ETA_Registry ID" } },
            })
            .getData();

        const { programs } = await this.api.metadata
            .get({
                programs: {
                    fields: { id: true },
                    filter: { name: { eq: "WHO Clinical Registry - Trauma" } },
                },
            })
            .getData();

        const { programStages } = await this.api.metadata
            .get({
                programStages: {
                    fields: { id: true },
                    filter: { name: { eq: "WHO Clinical Registry - Trauma" } },
                },
            })
            .getData();

        if (auditType === "mortality") {
            const queryStrings = [
                "&dimension=ijG1c7IqeZb:IN:7&dimension=QStbireWKjW&stage=mnNpBtanIQo",
                "&dimension=QStbireWKjW&dimension=CZhIs5wGCiz:IN:5&stage=mnNpBtanIQo",
                "&dimension=UQ8ENntnDDd&dimension=O38wkAQbK9z&dimension=NebmxV8fnTD&dimension=h0XlP7VstW7&dimension=QStbireWKjW&stage=mnNpBtanIQo",
            ];

            const response = await promiseMap(queryStrings, async queryString => {
                return await this.api
                    .get<AnalyticsResponse>(
                        eventQueryUri(_.last(getOrgUnitIdsFromPaths(orgUnitPaths)) ?? "", "202001", queryString)
                    )
                    .getData();
            });

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

            console.log(auditItems);
        }

        try {
            const { rows } = await this.api
                // program
                .get<AnalyticsResponse>(`/analytics/events/query/${programs[0]?.id}.json`, {
                    dimension: [
                        `pe:${!quarter ? year : `${year}${quarter}`}`,
                        `ou:${_.last(getOrgUnitIdsFromPaths(orgUnitPaths))}`,
                        "ijG1c7IqeZb:IN:7", // ETA_EU Dispo in option died (code: 7)
                        `${objects[0]?.id}`, // dataElement: QStbireWKjW
                    ],
                    stage: programStages[0]?.id, // program stage
                })
                .getData();

            const auditItems: Array<AuditItem> = rows.map(item => ({
                registerId: _.last(item) ?? "",
            }));

            const pager: Pager = {
                page: paging.page,
                pageSize: paging.pageSize,
                pageCount: Math.ceil(rows.length / paging.pageSize),
                total: rows.length,
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

        const csvDataSource = new CsvWriterDataSource();
        const csvData: CsvData<CsvField> = { headers, rows };
        const csvContents = csvDataSource.toString(csvData);

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
