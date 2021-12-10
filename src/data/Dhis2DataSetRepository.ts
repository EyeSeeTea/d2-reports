import _ from "lodash";
import { DataSet } from "../domain/entities/DataSet";
import { DataSetRepository, DataSetRepositoryGetOptions } from "../domain/repositories/DataSetRepository";
import { D2Api, PaginatedObjects, Id } from "../types/d2-api";
import { Dhis2SqlViews } from "./Dhis2SqlViews";
import { CsvWriterDataSource } from "./CsvWriterCsvDataSource";
import { downloadFile } from "./utils/download-file";
import { CsvData } from "../data/CsvDataSource";

interface Variables {
    orgUnitIds: string;
    dataSetIds: string;
    periods: string;
    orderByColumn: SqlField;
    orderByDirection: "asc" | "desc";
}

type SqlField = "datasetname" | "orgunit" | "period" | "completed";

const fieldMapping: Record<keyof DataSet, SqlField> = {
    dataSet: "datasetname",
    orgUnit: "orgunit",
    period: "period",
    completed: "completed",
};

export class Dhis2DataSetRepository implements DataSetRepository {
    constructor(private api: D2Api) {}

    async get(options: DataSetRepositoryGetOptions): Promise<PaginatedObjects<DataSet>> {
        const { config, dataSetIds, orgUnitIds, periods } = options; // ?
        const { paging, sorting } = options; // ?

        const allDataSetIds = _.values(config.dataSets).map(ds => ds.id); // ?
        const dataSetIds2 = _.isEmpty(dataSetIds) ? allDataSetIds : dataSetIds;

        const sqlViews = new Dhis2SqlViews(this.api);
        const { pager, rows } = await sqlViews
            .query<Variables, SqlField>(
                config.getDataSetsSqlView.id,
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

        const dataValues: Array<DataSet> = rows.map(
            (dv): DataSet => ({
                dataSet: { name: dv.datasetname },
                orgUnit: { name: dv.orgunit },
                period: dv.period.split("-")[0] ?? "",
                completed: dv.completed,
            })
        );

        return { pager, objects: dataValues };
    }

    async save(filename: string, dataSets: DataSet[]): Promise<void> {
        const headers = csvFields.map(field => ({ id: field, text: field }));
        const rows = dataSets.map(
            (dataSet): DataSetRow => ({
                dataSet: dataSet.dataSet.name,
                orgUnit: dataSet.orgUnit.name,
                period: dataSet.period,
                completed: dataSet.completed,
            })
        );

        const csvDataSource = new CsvWriterDataSource();
        const csvData: CsvData<CsvField> = { headers, rows };
        const csvContents = csvDataSource.toString(csvData);

        await downloadFile(csvContents, filename, "text/csv");
    }
}

const csvFields = ["dataSet", "orgUnit", "period", "completed"] as const;

type CsvField = typeof csvFields[number];

type DataSetRow = Record<CsvField, string>;

/* From the docs: "The variables must contain alphanumeric, dash, underscore and
   whitespace characters only.". Use "-" as id separator and also "-" as empty value.
*/
function sqlViewJoinIds(ids: Id[]): string {
    return ids.join("-") || "-";
}
