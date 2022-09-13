import _ from "lodash";
import { format } from "date-fns";
import { DataDiffItem } from "../domain/mal-dataset-duplication/entities/DataDiffItem";
import {
    DataDuplicationItem,
    DataDuplicationItemIdentifier,
} from "../domain/mal-dataset-duplication/entities/DataDuplicationItem";
import {
    MALDataDuplicationRepository,
    MALDataDuplicationRepositoryGetOptions,
} from "../domain/mal-dataset-duplication/repositories/MALDataDuplicationRepository";
import { D2Api, Id, PaginatedObjects } from "../types/d2-api";
import { promiseMap } from "../utils/promises";
import { DataStoreStorageClient } from "./clients/storage/DataStoreStorageClient";
import { StorageClient } from "./clients/storage/StorageClient";
import { CsvData } from "./CsvDataSource";
import { CsvWriterDataSource } from "./CsvWriterCsvDataSource";
import { Dhis2SqlViews, SqlViewGetData } from "./Dhis2SqlViews";
import { Instance } from "./entities/Instance";
import { downloadFile } from "./utils/download-file";
import { Namespaces } from "./clients/storage/Namespaces";

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
    orderByColumn: SqlField;
    orderByDirection: "asc" | "desc";
}

interface VariablesDiff {
    dataSets: string;
    orgUnits: string;
    periods: string;
}

type SqlFieldHeaders = "datasetuid" | "dataset" | "orgunituid" | "orgunit";

type completeDataSetRegistrationsType = {
    completeDataSetRegistrations: [
        {
            period?: string;
            dataSet?: string;
            organisationUnit?: string;
            attributeOptionCombo?: string;
            date?: string;
            storedBy?: string;
            completed?: boolean;
        }
    ];
};

type completeCheckresponseType = completeDataSetRegistrationsType[];

type dataElementsType = { id: string, name: string };

type dataSetElementsType = { dataElement: dataElementsType };

type dataValueType = {
    dataElement: string;
    period: string;
    orgUnit: string;
    value: string;
    [key: string]: string;
}

type dataSetsValueType = {
    dataSet: string;
    period: string;
    orgUnit: string;
    completeDate?: string;
    dataValues: dataValueType[],
};

type SqlFieldDiff =
    | "datasetuid"
    | "dataset"
    | "orgunituid"
    | "orgunit"
    | "period"
    | "value"
    | "apvdvalue"
    | "dataelement"
    | "apvddataelement"
    | "comment"
    | "apvdcomment";

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
    | "lastupdatedvalue"
    | "lastdateofsubmission"
    | "lastdateofapproval"
    | "diff";

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
    lastUpdatedValue: "lastupdatedvalue",
    lastDateOfSubmission: "lastdateofsubmission",
    lastDateOfApproval: "lastdateofapproval",
    modificationCount: "diff",
};

export class MALDataDuplicationDefaultRepository implements MALDataDuplicationRepository {
    private storageClient: StorageClient;

    constructor(private api: D2Api) {
        const instance = new Instance({ url: this.api.baseUrl });
        this.storageClient = new DataStoreStorageClient("user", instance);
    }

    async getDiff(options: MALDataDuplicationRepositoryGetOptions): Promise<PaginatedObjects<DataDiffItem>> {
        const { config } = options; // ?
        const { dataSetIds, orgUnitIds, periods } = options; // ?

        const allDataSetIds = _.values(config.dataSets).map(ds => ds.id); // ?
        const sqlViews = new Dhis2SqlViews(this.api);
        const paging_to_download = { page: 1, pageSize: 10000 };
        const { rows } = await sqlViews
            .query<VariablesDiff, SqlFieldDiff>(
                config.dataMalDiffSqlView.id,
                {
                    orgUnits: sqlViewJoinIds(orgUnitIds),
                    periods: sqlViewJoinIds(periods),
                    dataSets: sqlViewJoinIds(_.isEmpty(dataSetIds) ? allDataSetIds : dataSetIds),
                },
                paging_to_download
            )
            .getData();

        const items: Array<DataDiffItem> = rows.map(
            (item): DataDiffItem => ({
                datasetuid: item.datasetuid,
                orgunituid: item.orgunituid,
                period: item.period,
                value: item.value,
                apvdvalue: item.apvdvalue,
                dataelement: item.dataelement,
                apvddataelement: item.apvddataelement,
                comment: item.comment,
                apvdcomment: item.apvdcomment,
            })
        );

        const dataElementOrderArray = await this.getSortOrder();

        if (!_.isEmpty(dataElementOrderArray)) {
            const sortedItems = items.sort((a, b) => {
                if (a.dataelement && b.dataelement) {
                    return dataElementOrderArray.indexOf(a.dataelement) - dataElementOrderArray.indexOf(b.dataelement);
                } else {
                    return 0;
                }
            });
            return paginate(sortedItems, paging_to_download);
        } else {
            return paginate(items, paging_to_download);
        }

    }

    async get(options: MALDataDuplicationRepositoryGetOptions): Promise<PaginatedObjects<DataDuplicationItem>> {
        const { config } = options; // ?
        const { sorting, dataSetIds, orgUnitIds, periods } = options; // ?

        const allDataSetIds = _.values(config.dataSets).map(ds => ds.id); // ?
        const sqlViews = new Dhis2SqlViews(this.api);
        const paging_to_download = { page: 1, pageSize: 10000 };
        const { rows: headerRows } = await sqlViews
            .query<VariableHeaders, SqlFieldHeaders>(
                config.dataMalMetadataSqlView.id,
                {
                    dataSets: sqlViewJoinIds(_.isEmpty(dataSetIds) ? allDataSetIds : dataSetIds),
                },
                paging_to_download
            )
            .getData();

        const { rows } = await sqlViews
            .query<Variables, SqlField>(
                config.dataDuplicationSqlView.id,
                {
                    orgUnitRoot: sqlViewJoinIds(config.currentUser.orgUnits.map(({ id }) => id)),
                    orgUnits: sqlViewJoinIds(orgUnitIds),
                    periods: sqlViewJoinIds(periods),
                    dataSets: sqlViewJoinIds(_.isEmpty(dataSetIds) ? allDataSetIds : dataSetIds),
                    completed: options.completionStatus === undefined ? "-" : options.completionStatus.toString(),
                    approved: options.approvalStatus === undefined ? "-" : options.approvalStatus.toString(),
                    orderByColumn: fieldMapping[sorting.field],
                    orderByDirection: sorting.direction,
                },
                paging_to_download
            )
            .getData();

        return mergeHeadersAndData(options, periods, headerRows, rows);
        // A data value is not associated to a specific data set, but we can still map it
        // through the data element (1 data value -> 1 data element -> N data sets).
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
            const dataValues = dataSets.map(ds => ({
                dataSet: ds.dataSet,
                period: ds.period,
                orgUnit: ds.orgUnit,
                dataElement: "RvS8hSy27Ou",
                categoryOptionCombo: "Xr12mI7VPn3",
                value: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
            }));

            const dateResponse = await this.api.post<any>("/dataValueSets.json", {}, { dataValues }).getData();
            if (dateResponse.status !== "SUCCESS") throw new Error("Error when posting Submission date");

            let completeCheckResponses: completeCheckresponseType = await promiseMap(dataSets, async approval =>
                this.api
                    .get<any>("/completeDataSetRegistrations", {
                        dataSet: approval.dataSet,
                        period: approval.period,
                        orgUnit: approval.orgUnit,
                    })
                    .getData()
            );

            completeCheckResponses = completeCheckResponses.filter(item => Object.keys(item).length !== 0);

            const dataSetsCompleted = completeCheckResponses.flatMap(completeCheckResponse => {
                return completeCheckResponse.completeDataSetRegistrations.map(completeDataSetRegistrations => {
                    return {
                        dataSet: completeDataSetRegistrations.dataSet,
                        period: completeDataSetRegistrations.period,
                        orgUnit: completeDataSetRegistrations.organisationUnit,
                    };
                });
            });

            const dataSetsToComplete = _.differenceWith(dataSets, dataSetsCompleted, (value, othervalue) =>
                _.isEqual(_.omit(value, ["workflow"]), othervalue)
            );

            const completeResponse =
                Object.keys(dataSetsToComplete).length !== 0 ? await this.complete(dataSetsToComplete) : true;

            const response = await promiseMap(dataSets, async approval =>
                this.api
                    .post<any>(
                        "/dataApprovals",
                        { wf: approval.workflow, pe: approval.period, ou: approval.orgUnit },
                        {}
                    )
                    .getData()
            );

            return _.every(response, item => item === "") && completeResponse;
        } catch (error: any) {
            return false;
        }
    }

    async duplicate(dataSets: DataDuplicationItemIdentifier[]): Promise<boolean> {
        try {
            const approvalDataSetId = process.env.REACT_APP_APPROVE_DATASET_ID ?? "fRrt4V8ImqD";

            const uniqueDataSets = _.uniqBy(dataSets, 'dataSet');
            const DSDataElements = await promiseMap(uniqueDataSets, async item =>
                this.api
                    .get<any>(`/dataSets/${item.dataSet}`, { fields: "dataSetElements[dataElement[id,name]]" })
                    .getData()
            );

            const ADSDataElementsRaw = await this.api
                .get<any>(`/dataSets/${approvalDataSetId}`, { fields: "dataSetElements[dataElement[id,name]]" })
                .getData();

            const ADSDataElements = ADSDataElementsRaw.dataSetElements.map(
                (element: { dataElement: { id: any; name: any } }) => {
                    return {
                        id: element.dataElement.id,
                        name: element.dataElement.name,
                    };
                }
            );

            const dataValueSets = await promiseMap(dataSets, async approval =>
                this.api
                    .get<any>("/dataValueSets", {
                        dataSet: approval.dataSet,
                        period: approval.period,
                        orgUnit: approval.orgUnit,
                    })
                    .getData()
            );

            const copyResponse = await promiseMap(DSDataElements, async DSDataElement => {
                const dataElementsMatchedArray: { origId: any; destId: any }[] = DSDataElement.dataSetElements.map(
                    (element: { dataElement: any }) => {
                        const dataElement = element.dataElement;
                        const othername = dataElement.name + "-APVD";
                        const ADSDataElement = ADSDataElements.find(
                            (DataElement: { name: any }) => String(DataElement.name) === othername
                        );
                        return {
                            origId: dataElement?.id,
                            destId: ADSDataElement?.id,
                        };
                    }
                );

                const dataValues = dataValueSets
                    .map(dataValueSet => {
                        const data = dataValueSet.dataValues.map(
                            (dataValue: { dataElement: any; lastUpdated: any; dataSet: any }) => {
                                const data = { ...dataValue };
                                const destId = dataElementsMatchedArray.find(
                                    dataElementsMatchedObj => dataElementsMatchedObj.origId === dataValue.dataElement
                                )?.destId;
                                data.dataElement = destId;
                                data.dataSet = approvalDataSetId;
                                delete data.lastUpdated;

                                return data.dataElement ? data : {};
                            }
                        );
                        return data;
                    })
                    .flat();

                dataValues.push({
                    dataSet: approvalDataSetId,
                    period: dataValues[0].period,
                    orgUnit: dataValues[0].orgUnit,
                    dataElement: "VqcXVXTPaZG",
                    categoryOptionCombo: "Xr12mI7VPn3",
                    value: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
                });

                return this.api
                    .post<any>("/dataValueSets.json", {}, { dataValues: _.reject(dataValues, _.isEmpty) })
                    .getData();
            });

            return _.every(copyResponse, item => item.status === "SUCCESS");
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

    async getColumns(namespace: string): Promise<string[]> {
        const columns = await this.storageClient.getObject<string[]>(namespace);

        return columns ?? [];
    }

    async saveColumns(namespace: string, columns: string[]): Promise<void> {
        return this.storageClient.saveObject<string[]>(namespace, columns);
    }

    async getSortOrder(): Promise<string[]> {
        const sortOrderArray = await this.storageClient.getObject<string[]>(Namespaces.MAL_DIFF_NAMES_SORT_ORDER);

        return sortOrderArray ?? [];
    }

    async generateSortOrder(): Promise<void> {
        try {
            const dataSetData: {
                dataSetElements: { dataElement: { id: string, name: string } }[],
                sections: { id: string }[]
            } = await this.api.get<any>(
                `/dataSets/PWCUb3Se1Ie`,
                { fields: "sections,dataSetElements[dataElement[id,name]]" }
            ).getData();

            if (_.isEmpty(dataSetData.sections) || _.isEmpty(dataSetData.dataSetElements)) {
                return this.storageClient.saveObject<string[]>(Namespaces.MAL_DIFF_NAMES_SORT_ORDER, []);
            }

            const dataSetElements: { id: string, name: string }[] = dataSetData.dataSetElements.map((item) =>
                (item.dataElement)
            );

            const sectionsDEs = await promiseMap(dataSetData.sections, async sections => {
                return this.api.get<any>(
                    `/sections/${sections.id}`,
                    { fields: "dataElements" }
                ).getData()
            });

            const sectionsDEsIds: { id: string }[] = sectionsDEs.flatMap((item) => {
                return item.dataElements.map((dataElementId: { id: string }) => {
                    return dataElementId;
                })
            });

            const sortOrderArray: string[] = sectionsDEsIds.map(obj =>
                Object.assign(obj, dataSetElements.find((obj2) => obj.id === obj2.id))
            ).map(item => (item.name));

            return this.storageClient.saveObject<string[]>(Namespaces.MAL_DIFF_NAMES_SORT_ORDER, sortOrderArray);
        } catch (error: any) {
            console.debug(error);
        }
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

function mergeHeadersAndData(
    options: MALDataDuplicationRepositoryGetOptions,
    selectablePeriods: string[],
    headers: SqlViewGetData<SqlFieldHeaders>["rows"],
    data: SqlViewGetData<SqlField>["rows"]
) {
    const { sorting, paging, orgUnitIds, periods, approvalStatus, completionStatus } = options; // ?
    const activePeriods = periods.length > 0 ? periods : selectablePeriods;
    const rows: Array<DataDuplicationItem> = [];

    const mapping = _(data)
        .keyBy(dv => {
            return [dv.orgunituid, dv.period].join(".");
        })
        .value();

    for (const period of activePeriods) {
        for (const header of headers) {
            const datavalue = mapping[[header.orgunituid, period].join(".")];

            const row: DataDuplicationItem = {
                dataSetUid: header.datasetuid,
                dataSet: header.dataset,
                orgUnitUid: header.orgunituid,
                orgUnit: header.orgunit,
                period: period,
                attribute: datavalue?.attribute,
                approvalWorkflow: datavalue?.approvalworkflow,
                approvalWorkflowUid: datavalue?.approvalworkflowuid,
                completed: Boolean(datavalue?.completed),
                validated: Boolean(datavalue?.validated),
                lastUpdatedValue: datavalue?.lastupdatedvalue,
                lastDateOfSubmission: datavalue?.lastdateofsubmission,
                lastDateOfApproval: datavalue?.lastdateofapproval,
                modificationCount: datavalue?.diff,
            };
            rows.push(row);
        }
    }

    const rowsSorted = _(rows)
        .orderBy([row => row[sorting.field]], [sorting.direction])
        .value();

    const filterOrgUnitIds = orgUnitIds.length > 0 ? orgUnitIds : undefined;
    const rowsFiltered = rowsSorted.filter(row => {
        //aproval is submission, ready -> truefalse
        return (
            (approvalStatus === undefined || approvalStatus === row.validated) &&
            (completionStatus === undefined || completionStatus === row.completed) &&
            (filterOrgUnitIds === undefined || filterOrgUnitIds.indexOf(row.orgUnitUid) > -1)
        );
    });
    return paginate(rowsFiltered, paging);
}
