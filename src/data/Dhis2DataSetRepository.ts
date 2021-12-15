import _ from "lodash";
import { DataApprovalItem } from "../domain/nhwa-approval-status/entities/DataApprovalItem";
import {
    NHWADataApprovalRepository,
    NHWADataApprovalRepositoryGetOptions,
} from "../domain/nhwa-approval-status/repositories/NHWADataApprovalRepository";
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
    completed: string;
    approved: string;
    orderByColumn: SqlField;
    orderByDirection: "asc" | "desc";
}

type SqlField =
    | "datasetuid"
    | "dataset"
    | "orgunituid"
    | "orgunit"
    | "period"
    | "attribute"
    | "approvalworkflow"
    | "completed"
    | "validated"
    | "lastupdatedvalue";

const fieldMapping: Record<keyof DataApprovalItem, SqlField> = {
    dataSetUid: "datasetuid",
    dataSet: "dataset",
    orgUnitUid: "orgunit",
    orgUnit: "orgunit",
    period: "period",
    attribute: "attribute",
    approvalWorkflow: "approvalworkflow",
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
        const sqlViews = new Dhis2SqlViews(this.api);

        const { pager, rows } = await sqlViews
            .query<Variables, SqlField>(
                config.dataApprovalSqlView.id,
                {
                    orgUnits: sqlViewJoinIds(orgUnitIds),
                    periods: sqlViewJoinIds(_.isEmpty(periods) ? config.years : periods),
                    dataSets: sqlViewJoinIds(_.isEmpty(dataSetIds) ? allDataSetIds : dataSetIds),
                    completed: options.completionStatus ?? "-",
                    approved: options.approvalStatus ?? "-",
                    approvalWorkflows: sqlViewJoinIds(
                        _.isEmpty(options.approvalWorkflow)
                            ? config.approvalWorkflow.map(({ id }) => id)
                            : options.approvalWorkflow
                    ),
                    orderByColumn: fieldMapping[sorting.field],
                    orderByDirection: sorting.direction,
                },
                paging
            )
            .getData();

        // A data value is not associated to a specific data set, but we can still map it
        // through the data element (1 data value -> 1 data element -> N data sets).

        const items: Array<DataApprovalItem> = rows.map(
            (item): DataApprovalItem => ({
                dataSetUid: item.datasetuid,
                dataSet: item.dataset,
                orgUnitUid: item.orgunituid,
                orgUnit: item.orgunit,
                period: item.period,
                attribute: item.attribute,
                approvalWorkflow: item.approvalworkflow,
                completed: Boolean(item.completed),
                validated: Boolean(item.validated),
                lastUpdatedValue: item.lastupdatedvalue,
            })
        );

        return { pager, objects: items };
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

    async complete(dataSets: DataApprovalItem[]): Promise<void> {
        console.debug("COMPLETING...", dataSets);

        const completeDataSetRegistrations = dataSets.map(ds => ({
            dataSet: ds.dataSetUid,
            period: ds.period,
            organisationUnit: ds.orgUnitUid,
            completed: true,
        }));

        const result: any = await this.api
            .post<any>("/completeDataSetRegistrations", {}, { completeDataSetRegistrations })
            .getData();

        console.debug(result);
        // TODO see if I can refresh the report after this action
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
