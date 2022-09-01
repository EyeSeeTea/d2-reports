import _ from "lodash";
import { Paging, Sorting } from "../domain/common/entities/PaginatedObjects";
import { DataDuplicationItem, DataDuplicationItemIdentifier } from "../domain/mal-dataset-duplication/entities/DataDuplicationItem";
import {
    MALDataDuplicationRepository,
    MALDataDuplicationRepositoryGetOptions,
} from "../domain/mal-dataset-duplication/repositories/MALDataDuplicationRepository";
import { D2Api, Id, PaginatedObjects } from "../types/d2-api";
import { promiseMap } from "../utils/promises";
import { DataStoreStorageClient } from "./clients/storage/DataStoreStorageClient";
import { Namespaces } from "./clients/storage/Namespaces";
import { StorageClient } from "./clients/storage/StorageClient";
import { CsvData } from "./CsvDataSource";
import { CsvWriterDataSource } from "./CsvWriterCsvDataSource";
import { Dhis2SqlViews, SqlViewGetData } from "./Dhis2SqlViews";
import { Instance } from "./entities/Instance";
import { downloadFile } from "./utils/download-file";

export interface Pagination {
    page: number;
    pageSize: number;
}

export function paginate<Obj>(objects: Obj[], pagination: Pagination) {
    const pager = {
        page: pagination.page,
        pageSize: pagination.pageSize,
        pageCount: Math.ceil(objects.length / pagination.pageSize),
        total: objects.length,
    };
    const { page, pageSize } = pagination;
    const start = (page - 1) * pageSize;

    const paginatedObjects = _(objects)
        .slice(start, start + pageSize)
        .value();

    return { pager: pager, objects: paginatedObjects };
}

interface VariableHeaders {
    dataSets: string;
}
interface Variables {
    orgUnitRoot: string;
    dataSets: string;
    orgUnits: string;
    periods: string;
    completed: string;
    approved: string;
    duplicated: string;
    orderByColumn: SqlField;
    orderByDirection: "asc" | "desc";
}

type SqlFieldHeaders =
    | "datasetuid"
    | "dataset"
    | "orgunituid"
    | "orgunit";

type SqlField =
    | "datasetuid"
    | "dataset"
    | "orgunituid"
    | "orgunit"
    | "period"
    | "attribute"
    | "approvalworkflowuid"
    | "approvalworkflow"
    | "completed"
    | "validated"
    | "duplicated"
    | "lastupdatedvalue"
    | "lastdateofsubmission";

const fieldMapping: Record<keyof DataDuplicationItem, SqlField> = {
    dataSetUid: "datasetuid",
    dataSet: "dataset",
    orgUnitUid: "orgunit",
    orgUnit: "orgunit",
    period: "period",
    attribute: "attribute",
    approvalWorkflowUid: "approvalworkflowuid",
    approvalWorkflow: "approvalworkflow",
    completed: "completed",
    validated: "validated",
    duplicated: "duplicated",
    lastUpdatedValue: "lastupdatedvalue",
};

export class MALDataDuplicationDefaultRepository implements MALDataDuplicationRepository {
    private storageClient: StorageClient;

    constructor(private api: D2Api) {
        const instance = new Instance({ url: this.api.baseUrl });
        this.storageClient = new DataStoreStorageClient("user", instance);
    }

    async get(options: MALDataDuplicationRepositoryGetOptions): Promise<PaginatedObjects<DataDuplicationItem>> {
        const { config, dataSetIds, orgUnitIds, periods } = options; // ?
        const { sorting, paging } = options; // ?

        const allDataSetIds = _.values(config.dataSets).map(ds => ds.id); // ?
        const sqlViews = new Dhis2SqlViews(this.api);
        const paging_to_download =
            { page: 1, pageSize: 10000 }
            
        const { pager, objects } = mergeHeadersAndData(sorting, paging, periods, await sqlViews
            .query<VariableHeaders, SqlFieldHeaders>(
                config.dataMalMetadataSqlView.id,
                {
                    dataSets: sqlViewJoinIds(_.isEmpty(dataSetIds) ? allDataSetIds : dataSetIds),
                }, paging_to_download
            )
            .getData(), await sqlViews
                .query<Variables, SqlField>(
                    config.dataDuplicationSqlView.id,
                    {
                        orgUnitRoot: sqlViewJoinIds(config.currentUser.orgUnits.map(({ id }) => id)),
                        orgUnits: sqlViewJoinIds(orgUnitIds),
                        periods: sqlViewJoinIds(periods),
                        dataSets: sqlViewJoinIds(_.isEmpty(dataSetIds) ? allDataSetIds : dataSetIds),
                        completed: options.completionStatus ?? "-",
                        approved: options.approvalStatus ?? "-",
                        duplicated: options.duplicationStatus ?? "-",
                        orderByColumn: fieldMapping[sorting.field],
                        orderByDirection: sorting.direction,
                    }, paging_to_download
                )
                .getData()
        );
        // A data value is not associated to a specific data set, but we can still map it
        // through the data ehjhlement (1 data value -> 1 data element -> N data sets).

        return paginate(objects, pager);
    }

    async save(filename: string, dataSets: DataDuplicationItem[]): Promise<void> {
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

    async complete(dataSets: DataDuplicationItemIdentifier[]): Promise<boolean> {
        const completeDataSetRegistrations = dataSets.map(ds => ({
            dataSet: ds.dataSet,
            period: ds.period,
            organisationUnit: ds.orgUnit,
            completed: true,
        }));

        try {
            const response = await this.api
                .post<any>("/completeDataSetRegistrations", {}, { completeDataSetRegistrations })
                .getData();

            return response.status === "SUCCESS";
        } catch (error: any) {
            return false;
        }
    }

    async approve(dataSets: DataDuplicationItemIdentifier[]): Promise<boolean> {
        try {
            const response = await promiseMap(dataSets, async approval =>
                this.api
                    .post<any>(
                        "/dataApprovals",
                        { wf: approval.workflow, pe: approval.period, ou: approval.orgUnit },
                        {}
                    )
                    .getData()
            );

            return _.every(response, item => item === "");
        } catch (error: any) {
            return false;
        }
    }

    async duplicate(dataSets: DataDuplicationItemIdentifier[]): Promise<boolean> {
        try {
            const approvalDataSetId = "fRrt4V8ImqD";

            const DSDataElements = await promiseMap(dataSets, async approval =>
                this.api
                    .get<any>(
                        `/dataSets/${approval.dataSet}`,
                        { fields: "dataSetElements[dataElement[id,name]]" }
                    )
                    .getData()
            );

            //console.log("DSDataElements: ", DSDataElements)

            const ADSDataElements2 = await this.api
                .get<any>(
                    `/dataSets/${approvalDataSetId}`,
                    { fields: "dataSetElements[dataElement[id,name]]" }
                )
                .getData();

            const ADSDataElements = ADSDataElements2.dataSetElements.map((element: { dataElement: { id: any; name: any; }; }) => {
                return {
                    id: element.dataElement.id,
                    name: element.dataElement.name
                };
            });

            //console.log("ADSDataElements: ", ADSDataElements)

            const dataValueSets = await promiseMap(dataSets, async approval =>
                this.api
                    .get<any>(
                        "/dataValueSets",
                        { dataSet: approval.dataSet, period: approval.period, orgUnit: approval.orgUnit }
                    )
                    .getData()
            );

            //console.log("dataValues: ", dataValueSets)

            //console.log("DSDataElements[0]: ", DSDataElements[0].dataSetElements)

            const dataElementsMatchedArray: { origId: any, destId: any; }[] = DSDataElements[0].dataSetElements.map((element: { dataElement: any; }) => {
                const dataElement = element.dataElement;
                const othername = dataElement.name + "-_APPROVED";
                const ADSDataElement = ADSDataElements.find((DataElement: { name: any; }) => String(DataElement.name) === othername);
                return {
                    origId: dataElement.id,
                    destId: ADSDataElement.id,
                };
            });

            //console.log("dataElementsMatchedArray: ", dataElementsMatchedArray)

            const dataValues = dataValueSets.map((dataValueSet) => {
                const data = dataValueSet.dataValues.map((dataValue: { dataElement: any, lastUpdated: any; }) => {
                    const data2 = { ...dataValue };
                    const destId = dataElementsMatchedArray.find((dataElementsMatchedObj) => dataElementsMatchedObj.origId === dataValue.dataElement)?.destId;
                    data2.dataElement = destId;
                    delete data2.lastUpdated;
                    return data2;
                })
                return data;
            }).flat();

            //console.log("approvalDataValues: ", dataValues)

            const copyResponse = await this.api.post<any>(
                "/dataValueSets.json",
                {},
                { dataValues }
            ).getData()

            //console.log("copyResponse: ", copyResponse)

            return copyResponse;
        } catch (error: any) {
            return false;
        }
    }

    async incomplete(dataSets: DataDuplicationItemIdentifier[]): Promise<boolean> {
        try {
            const response = await promiseMap(dataSets, item =>
                this.api
                    .delete<any>("/completeDataSetRegistrations", {
                        ds: item.dataSet,
                        pe: item.period,
                        ou: item.orgUnit,
                    })
                    .getData()
            );

            return _.every(response, item => item === "");
        } catch (error: any) {
            return false;
        }
    }

    async unapprove(dataSets: DataDuplicationItemIdentifier[]): Promise<boolean> {
        try {
            const response = await promiseMap(dataSets, async approval =>
                this.api
                    .delete<any>("/dataApprovals", { wf: approval.workflow, pe: approval.period, ou: approval.orgUnit })
                    .getData()
            );

            return _.every(response, item => item === "");
        } catch (error: any) {
            return false;
        }
    }

    async getColumns(): Promise<string[]> {
        const columns = await this.storageClient.getObject<string[]>(Namespaces.MAL_APPROVAL_STATUS_USER_COLUMNS);

        return columns ?? [];
    }

    async saveColumns(columns: string[]): Promise<void> {
        return this.storageClient.saveObject<string[]>(Namespaces.MAL_APPROVAL_STATUS_USER_COLUMNS, columns);
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


function mergeHeadersAndData(sorting: Sorting<DataDuplicationItem>,paging: Paging, periods: string[], headers: SqlViewGetData<SqlFieldHeaders>, data: SqlViewGetData<SqlField>) {
    const rows: Array<DataDuplicationItem> = [];
    for (const period of periods) {
        for (const header of headers.rows) {

            const datavalues = data.rows.filter(dv => {
                return dv.orgunituid === header.orgunituid && dv.period === period;
            });
            const lastUpdatedValue = datavalues.map(dv => dv.lastupdatedvalue)[0];
            const duplicated = datavalues.map(dv => dv.duplicated)[0];
            const validated = datavalues.map(dv => dv.validated)[0];
            const completed = datavalues.map(dv => dv.completed)[0];
            const approvalWorkflow = datavalues.map(dv => dv.approvalworkflow)[0];
            const approvalWorkflowUid = datavalues.map(dv => dv.approvalworkflowuid)[0];
            const attribute = datavalues.map(dv => dv.attribute)[0];

            const row: DataDuplicationItem = {
                dataSetUid: header.datasetuid,
                dataSet: header.dataset,
                orgUnitUid: header.orgunituid,
                orgUnit: header.orgunit,
                period: period,
                attribute: attribute,
                approvalWorkflow: approvalWorkflow,
                approvalWorkflowUid: approvalWorkflowUid,
                completed: Boolean(completed),
                validated: Boolean(validated),
                duplicated: Boolean(duplicated),
                lastUpdatedValue: lastUpdatedValue
            };
            rows.push(row);
        }
    }

    const rowsSorted = _(rows)
        .orderBy([row => row[sorting.field]], [sorting.direction]).value();

    return paginate(rowsSorted, paging);
}

