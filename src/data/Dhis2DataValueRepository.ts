import _ from "lodash";
import { DataValue } from "../domain/entities/DataValue";
import { DataValueRepository, DataValueRepositoryGetOptions } from "../domain/repositories/DataValueRepository";
import { D2Api, PaginatedObjects, Id } from "../types/d2-api";
import { Dhis2SqlViews } from "./Dhis2SqlViews";
import { CsvWriterDataSource } from "./CsvWriterCsvDataSource";
import { downloadFile } from "./utils/download-file";
import { CsvData } from "../data/CsvDataSource";

interface Variables {
    orgUnitIds: string;
    dataSetIds: string;
    sectionIds: string;
    periods: string;
    orderByColumn: SqlField;
    orderByDirection: "asc" | "desc";
    commentPairs: string;
}

type SqlField =
    | "datasetname"
    | "dataelementid"
    | "dataelementname"
    | "section"
    | "cocname"
    | "period"
    | "value"
    | "comment"
    | "storedby"
    | "orgunit"
    | "lastupdated"
    | "completed"
    | "validated";

const fieldMapping: Record<keyof DataValue, SqlField> = {
    period: "period",
    orgUnit: "orgunit",
    dataSet: "datasetname",
    dataElement: "dataelementname",
    section: "section",
    categoryOptionCombo: "cocname",
    value: "value",
    comment: "comment",
    lastUpdated: "lastupdated",
    storedBy: "storedby",
    completed: "completed",
    validated: "validated",
};

export class Dhis2DataValueRepository implements DataValueRepository {
    constructor(private api: D2Api) {}

    async get(options: DataValueRepositoryGetOptions): Promise<PaginatedObjects<DataValue>> {
        const { config, dataSetIds, sectionIds, orgUnitIds, periods } = options;
        const { paging, sorting } = options;

        const allDataSetIds = _.values(config.dataSets).map(ds => ds.id);
        const dataSetIds2 = _.isEmpty(dataSetIds) ? allDataSetIds : dataSetIds;
        const commentPairs =
            _(config.pairedDataElementsByDataSet)
                .at(dataSetIds2)
                .flatten()
                .map(pair => `${pair.dataValueVal}_${pair.dataValueComment}`)
                .join("-") || "-";

        const sqlViews = new Dhis2SqlViews(this.api);
        const { pager, rows } = await sqlViews
            .query<Variables, SqlField>(
                config.getDataValuesSqlView.id,
                {
                    orgUnitIds: sqlViewJoinIds(orgUnitIds),
                    periods: sqlViewJoinIds(_.isEmpty(periods) ? config.years : periods),
                    dataSetIds: sqlViewJoinIds(dataSetIds2),
                    sectionIds: sqlViewJoinIds(sectionIds),
                    orderByColumn: fieldMapping[sorting.field],
                    orderByDirection: sorting.direction,
                    commentPairs,
                },
                paging
            )
            .getData();

        // A data value is not associated to a specific data set, but we can still map it
        // through the data element (1 data value -> 1 data element -> N data sets).

        const dataValues: Array<DataValue> = rows.map(
            (dv): DataValue => ({
                period: dv.period.split("-")[0] ?? "",
                orgUnit: { name: dv.orgunit },
                dataSet: { name: dv.datasetname },
                dataElement: { id: dv.dataelementid, name: dv.dataelementname },
                section: dv.section,
                categoryOptionCombo: { name: dv.cocname },
                value: dv.value,
                comment: dv.comment,
                lastUpdated: new Date(dv.lastupdated),
                storedBy: dv.storedby,
                completed: Math.random() < 0.5,
                validated: Math.random() < 0.5,
            })
        );

        return { pager, objects: dataValues };
    }

    async save(filename: string, dataValues: DataValue[]): Promise<void> {
        const headers = csvFields.map(field => ({ id: field, text: field }));
        const rows = dataValues.map(
            (dataValue): DataValueRow => ({
                period: dataValue.period,
                orgUnit: dataValue.orgUnit.name,
                dataSet: dataValue.dataSet.name,
                dataElement: dataValue.dataElement.name,
                categoryOptionCombo: dataValue.categoryOptionCombo.name,
                value: dataValue.value,
                comment: dataValue.comment || "",
                lastUpdated: dataValue.lastUpdated.toISOString(),
                storedBy: dataValue.storedBy,
            })
        );

        const csvDataSource = new CsvWriterDataSource();
        const csvData: CsvData<CsvField> = { headers, rows };
        const csvContents = csvDataSource.toString(csvData);

        await downloadFile(csvContents, filename, "text/csv");
    }
}

const csvFields = [
    "dataSet",
    "period",
    "orgUnit",
    "dataElement",
    "categoryOptionCombo",
    "value",
    "comment",
    "lastUpdated",
    "storedBy",
] as const;

type CsvField = typeof csvFields[number];

type DataValueRow = Record<CsvField, string>;

/* From the docs: "The variables must contain alphanumeric, dash, underscore and
   whitespace characters only.". Use "-" as id separator and also "-" as empty value.
*/
function sqlViewJoinIds(ids: Id[]): string {
    return ids.join("-") || "-";
}
