import _ from "lodash";
import { DataAttachmentItem } from "../domain/nhwa-attachments/entities/DataAttachmentItem";
import {
    NHWADataAttachmentsRepository,
    NHWADataAttachmentsRepositoryGetOptions,
} from "../domain/nhwa-attachments/repositories/NHWADataAttachmentsRepository";
import { D2Api, PaginatedObjects, Id } from "../types/d2-api";
import { Dhis2SqlViews } from "./Dhis2SqlViews";
import { CsvWriterDataSource } from "./CsvWriterCsvDataSource";
import { downloadFile } from "./utils/download-file";
import { CsvData } from "./CsvDataSource";

interface Variables {
    orgUnitIds: string;
    dataSetIds: string;
    periods: string;
    orderByColumn: SqlField;
    orderByDirection: "asc" | "desc";
}

type SqlField = "datasetname" | "link" | "period" | "storedby" | "orgunit" | "lastupdated";

const fieldMapping: Record<keyof DataAttachmentItem, SqlField> = {
    period: "period",
    orgUnit: "orgunit",
    dataSet: "datasetname",
    link: "link",
    lastUpdated: "lastupdated",
    storedBy: "storedby",
};

export class NHWAAttachementsDefaultRepository implements NHWADataAttachmentsRepository {
    constructor(private api: D2Api) {}

    async get(options: NHWADataAttachmentsRepositoryGetOptions): Promise<PaginatedObjects<DataAttachmentItem>> {
        const { config, dataSetIds, orgUnitIds, periods } = options;
        const { paging, sorting } = options;

        const allDataSetIds = _.values(config.dataSets).map(ds => ds.id);
        const dataSetIds2 = _.isEmpty(dataSetIds) ? allDataSetIds : dataSetIds;

        const sqlViews = new Dhis2SqlViews(this.api);
        const { pager, rows } = await sqlViews
            .query<Variables, SqlField>(
                config.dataAttachmentSqlView.id,
                {
                    orgUnitIds: sqlViewJoinIds(orgUnitIds),
                    periods: sqlViewJoinIds(_.isEmpty(periods) ? config.years : periods),
                    dataSetIds: sqlViewJoinIds(dataSetIds2),
                    orderByColumn: fieldMapping[sorting.field],
                    orderByDirection: sorting.direction,
                },
                paging
            )
            .getData();

        // A data value is not associated to a specific data set, but we can still map it
        // through the data element (1 data value -> 1 data element -> N data sets).

        const dataValues: Array<DataAttachmentItem> = rows.map(
            (dv): DataAttachmentItem => ({
                period: dv.period.split("-")[0] ?? "",
                orgUnit: { name: dv.orgunit },
                dataSet: { name: dv.datasetname },
                link: this.api.apiPath + dv.link,
                lastUpdated: new Date(dv.lastupdated),
                storedBy: dv.storedby,
            })
        );

        return { pager, objects: dataValues };
    }

    async save(filename: string, dataValues: DataAttachmentItem[]): Promise<void> {
        const headers = csvFields.map(field => ({ id: field, text: field }));
        const rows = dataValues.map(
            (dataValue): DataValueRow => ({
                period: dataValue.period,
                orgUnit: dataValue.orgUnit.name,
                dataSet: dataValue.dataSet.name,
                lastUpdated: dataValue.lastUpdated.toISOString(),
                storedBy: dataValue.storedBy,
                link: dataValue.link,
            })
        );

        const csvDataSource = new CsvWriterDataSource();
        const csvData: CsvData<CsvField> = { headers, rows };
        const csvContents = csvDataSource.toString(csvData);

        await downloadFile(csvContents, filename, "text/csv");
    }
}

const csvFields = ["dataSet", "period", "orgUnit", "link", "lastUpdated", "storedBy"] as const;

type CsvField = typeof csvFields[number];

type DataValueRow = Record<CsvField, string>;

/* From the docs: "The variables must contain alphanumeric, dash, underscore and
   whitespace characters only.". Use "-" as id separator and also "-" as empty value.
*/
function sqlViewJoinIds(ids: Id[]): string {
    return ids.join("-") || "-";
}
