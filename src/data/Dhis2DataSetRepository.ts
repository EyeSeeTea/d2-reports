import _ from "lodash";
import { DataApprovalItem } from "../domain/nhwa-approval-status/entities/DataApprovalItem";
import { NHWADataApprovalRepository, NHWADataApprovalRepositoryGetOptions } from "../domain/nhwa-approval-status/repositories/NHWADataApprovalRepository";
import { D2Api, PaginatedObjects, Id } from "../types/d2-api";
import { Dhis2SqlViews } from "./Dhis2SqlViews";
import { CsvWriterDataSource } from "./CsvWriterCsvDataSource";
import { downloadFile } from "./utils/download-file";
import { CsvData } from "../data/CsvDataSource";

interface Variables {
    dataSets: string;
    approvalWorkflows: string;
    orgUnits: string;
    periods: string;
    orderByColumn: SqlField;
    orderByDirection: "asc" | "desc";
}

type SqlField = "dataset" | "orgunit" | "period" | "attribute" | "completed" | "validated" | "lastupdatedvalue";

const fieldMapping: Record<keyof DataApprovalItem, SqlField> = {
    dataSet: "dataset",
    orgUnit: "orgunit",
    period: "period",
    attribute: "attribute",
    completed: "completed",
    validated: "validated",
    lastUpdatedValue: "lastupdatedvalue",
};

export class Dhis2DataSetRepository implements NHWADataApprovalRepository {
    constructor(private api: D2Api) {}

    async get(options: NHWADataApprovalRepositoryGetOptions): Promise<PaginatedObjects<DataApprovalItem>> {
        const { config, dataSetIds, orgUnitIds, periods } = options; // ?
        const { paging, sorting } = options; // ?

        const allDataSetIds = _.values(config.dataSets).map(ds => ds.id); // ?
        const dataSetIds2 = _.isEmpty(dataSetIds) ? allDataSetIds : dataSetIds;

        const sqlViews = new Dhis2SqlViews(this.api);
        const { pager, rows } = await sqlViews
            .query<Variables, SqlField>(
                config.dataApprovalSqlView.id,
                {
                    orgUnits: sqlViewJoinIds(orgUnitIds),
                    periods: sqlViewJoinIds(_.isEmpty(periods) ? config.years : periods),
                    dataSets: sqlViewJoinIds(dataSetIds2),
                    approvalWorkflows: '-',
                    orderByColumn: fieldMapping[sorting.field],
                    orderByDirection: sorting.direction,
                },
                paging
            )
            .getData();

        // A data value is not associated to a specific data set, but we can still map it
        // through the data element (1 data value -> 1 data element -> N data sets).

        const dataValues: Array<DataApprovalItem> = rows.map(
            (dv): DataApprovalItem => ({
                dataSet: dv.dataset,
                orgUnit: dv.orgunit,
                period: dv.period,
                attribute: dv.attribute,
                completed: Boolean(dv.completed),
                validated: Boolean(dv.validated),
                lastUpdatedValue: dv.lastupdatedvalue,
            })
        );

        return { pager, objects: dataValues };
    }

    async save(filename: string, dataSets: DataApprovalItem[]): Promise<void> {
        const headers = csvFields.map(field => ({ id: field, text: field }));
        const rows = dataSets.map(
            (dataSet): DataSetRow => ({
                dataSet: dataSet.dataSet,
                orgUnit: dataSet.orgUnit,
                period: dataSet.period,
                completed: String(dataSet.completed),
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
