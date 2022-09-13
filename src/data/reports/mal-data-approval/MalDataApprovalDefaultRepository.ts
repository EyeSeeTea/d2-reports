import _ from "lodash";
import { format } from "date-fns";
import { DataDiffItem } from "../../../domain/reports/mal-data-approval/entities/DataDiffItem";
import { D2Api, Id, PaginatedObjects } from "../../../types/d2-api";
import { promiseMap } from "../../../utils/promises";
import { DataStoreStorageClient } from "../../common/clients/storage/DataStoreStorageClient";
import { StorageClient } from "../../common/clients/storage/StorageClient";
import { CsvData } from "../../common/CsvDataSource";
import { CsvWriterDataSource } from "../../common/CsvWriterCsvDataSource";
import { Dhis2SqlViews, SqlViewGetData } from "../../common/Dhis2SqlViews";
import { Instance } from "../../common/entities/Instance";
import { downloadFile } from "../../common/utils/download-file";
import { getSqlViewId } from "../../../domain/common/entities/Config";
import {
    SQL_VIEW_DATA_DUPLICATION_NAME,
    SQL_VIEW_MAL_DIFF_NAME,
    SQL_VIEW_MAL_METADATA_NAME,
} from "../../common/Dhis2ConfigRepository";
import {
    MalDataApprovalItem,
    MalDataApprovalItemIdentifier,
} from "../../../domain/reports/mal-data-approval/entities/MalDataApprovalItem";
import {
    MalDataApprovalOptions,
    MalDataApprovalRepository,
} from "../../../domain/reports/mal-data-approval/repositories/MalDataApprovalRepository";
import { Namespaces } from "../../common/clients/storage/Namespaces";

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

const fieldMapping: Record<keyof MalDataApprovalItem, SqlField> = {
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

export class MalDataApprovalDefaultRepository implements MalDataApprovalRepository {
    private storageClient: StorageClient;

    constructor(private api: D2Api) {
        const instance = new Instance({ url: this.api.baseUrl });
        this.storageClient = new DataStoreStorageClient("user", instance);
    }

    async getDiff(options: MalDataApprovalOptions): Promise<PaginatedObjects<DataDiffItem>> {
        const { config } = options; // ?
        const { dataSetIds, orgUnitIds, periods } = options; // ?

        const allDataSetIds = _.values(config.dataSets).map(ds => ds.id); // ?
        const sqlViews = new Dhis2SqlViews(this.api);
        const paging_to_download = { page: 1, pageSize: 10000 };

        const { rows } = await sqlViews
            .query<VariablesDiff, SqlFieldDiff>(
                getSqlViewId(config, SQL_VIEW_MAL_DIFF_NAME),
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

    async get(options: MalDataApprovalOptions): Promise<PaginatedObjects<MalDataApprovalItem>> {
        const { config } = options; // ?
        const { sorting, dataSetIds, orgUnitIds, periods } = options; // ?

        const allDataSetIds = _.values(config.dataSets).map(ds => ds.id); // ?
        const sqlViews = new Dhis2SqlViews(this.api);
        const paging_to_download = { page: 1, pageSize: 10000 };
        const { rows: headerRows } = await sqlViews
            .query<VariableHeaders, SqlFieldHeaders>(
                getSqlViewId(config, SQL_VIEW_MAL_METADATA_NAME),
                {
                    dataSets: sqlViewJoinIds(_.isEmpty(dataSetIds) ? allDataSetIds : dataSetIds),
                },
                paging_to_download
            )
            .getData();

        const { rows } = await sqlViews
            .query<Variables, SqlField>(
                getSqlViewId(config, SQL_VIEW_DATA_DUPLICATION_NAME),
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

    async save(filename: string, dataSets: MalDataApprovalItem[]): Promise<void> {
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

    async complete(dataSets: MalDataApprovalItemIdentifier[]): Promise<boolean> {
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

    async approve(dataSets: MalDataApprovalItemIdentifier[]): Promise<boolean> {
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

    async duplicate(dataSets: MalDataApprovalItemIdentifier[]): Promise<boolean> {
        try {
            const approvalDataSetId = process.env.REACT_APP_APPROVE_DATASET_ID ?? "fRrt4V8ImqD";
            const dataSetsCopy: MalDataApprovalItemIdentifier[] = [...dataSets];

            const dataValueSetsRaw: dataSetsValueType[] = await promiseMap(dataSets, async item =>
                this.api.get<any>("/dataValueSets", {
                    dataSet: item.dataSet,
                    period: item.period,
                    orgUnit: item.orgUnit,
                }).getData()
            );

            const dataValueSets: dataSetsValueType[] = [];
            dataValueSetsRaw.forEach(dataValueSet => {
                if (!_.isEmpty(dataValueSet.dataValues)) {
                    dataValueSet.dataValues.splice(
                        dataValueSet.dataValues.findIndex(dataValue => dataValue.dataElement === "RvS8hSy27Ou"), 1
                    );
                }

                if (!_.isEmpty(dataValueSet.dataValues)) {
                    dataValueSets.push(dataValueSet);
                } else {
                    dataSetsCopy.splice(dataSetsCopy.findIndex(dataSet =>
                        dataSet.period === dataValueSet.period &&
                        dataSet.orgUnit === dataValueSet.orgUnit
                    ), 1);
                }
            });

            if (_.isEmpty(dataValueSets)) throw new Error("All dataValueSet empty");

            const uniqueDataSets = _.uniqBy(dataSetsCopy, 'dataSet');
            const DSDataElements: { dataSetElements: dataSetElementsType[] }[] = await promiseMap(uniqueDataSets, async item =>
                this.api
                    .get<any>(`/dataSets/${item.dataSet}`, { fields: "dataSetElements[dataElement[id,name]]" })
                    .getData()
            );

            const ADSDataElementsRaw: { dataSetElements: dataSetElementsType[] } = await this.api
                .get<any>(`/dataSets/${approvalDataSetId}`, { fields: "dataSetElements[dataElement[id,name]]" })
                .getData();

            const ADSDataElements: dataElementsType[] = ADSDataElementsRaw.dataSetElements.map(
                (element) => {
                    return {
                        id: element.dataElement.id,
                        name: element.dataElement.name,
                    };
                }
            );

            const dataElementsMatchedArray: { origId: any; destId: any }[] = DSDataElements.flatMap(DSDataElement => {
                return DSDataElement.dataSetElements.map(
                    (element) => {
                        const dataElement = element.dataElement;
                        const othername = dataElement.name + "-APVD";
                        const ADSDataElement = ADSDataElements.find(
                            (DataElement) => String(DataElement.name) === othername
                        );
                        return {
                            origId: dataElement?.id,
                            destId: ADSDataElement?.id,
                        };
                    }
                );
            })

            const dataValues = dataValueSets.map(dataValueSet => {
                if (dataValueSet.dataValues) {
                    const data = dataValueSet.dataValues.map(
                        (dataValue) => {
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
                } else {
                    return {};
                }
            }).flat();

            dataSetsCopy.forEach(dataSet => {
                dataValues.push({
                    dataSet: approvalDataSetId,
                    period: dataSet.period,
                    orgUnit: dataSet.orgUnit,
                    dataElement: "VqcXVXTPaZG",
                    categoryOptionCombo: "Xr12mI7VPn3",
                    attributeOptionCombo: "Xr12mI7VPn3",
                    value: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
                });
            });

            const copyResponse = await this.api
                .post<any>("/dataValueSets.json", {}, { dataValues: _.reject(dataValues, _.isEmpty) })
                .getData();

            return copyResponse.status === "SUCCESS";
        } catch (error: any) {
            console.debug(error);
            return false;
        }
    }

    async incomplete(dataSets: MalDataApprovalItemIdentifier[]): Promise<boolean> {
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

    async unapprove(dataSets: MalDataApprovalItemIdentifier[]): Promise<boolean> {
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
                dataSetElements: dataSetElementsType[],
                sections: { id: string }[]
            } = await this.api.get<any>(
                `/dataSets/PWCUb3Se1Ie`,
                { fields: "sections,dataSetElements[dataElement[id,name]]" }
            ).getData();

            if (_.isEmpty(dataSetData.sections) || _.isEmpty(dataSetData.dataSetElements)) {
                return this.storageClient.saveObject<string[]>(Namespaces.MAL_DIFF_NAMES_SORT_ORDER, []);
            }

            const dataSetElements: dataElementsType[] = dataSetData.dataSetElements.map((item) =>
                (item.dataElement)
            );

            const sectionsDEs = await promiseMap(dataSetData.sections, async sections => {
                return this.api.get<any>(`/sections/${sections.id}`, { fields: "dataElements" }).getData();
            });

            const sectionsDEsIds: { id: string }[] = sectionsDEs.flatMap(item => {
                return item.dataElements.map((dataElementId: { id: string }) => {
                    return dataElementId;
                });
            });

            const sortOrderArray: string[] = sectionsDEsIds
                .map(obj =>
                    Object.assign(
                        obj,
                        dataSetElements.find(obj2 => obj.id === obj2.id)
                    )
                )
                .map(item => item.name);

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
    options: MalDataApprovalOptions,
    selectablePeriods: string[],
    headers: SqlViewGetData<SqlFieldHeaders>["rows"],
    data: SqlViewGetData<SqlField>["rows"]
) {
    const { sorting, paging, orgUnitIds, periods, approvalStatus, completionStatus } = options; // ?
    const activePeriods = periods.length > 0 ? periods : selectablePeriods;
    const rows: Array<MalDataApprovalItem> = [];

    const mapping = _(data)
        .keyBy(dv => {
            return [dv.orgunituid, dv.period].join(".");
        })
        .value();

    for (const period of activePeriods) {
        for (const header of headers) {
            const datavalue = mapping[[header.orgunituid, period].join(".")];

            const row: MalDataApprovalItem = {
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