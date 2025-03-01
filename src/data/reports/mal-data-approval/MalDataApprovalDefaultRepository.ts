import _ from "lodash";
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
    SQL_VIEW_OLD_DATA_DUPLICATION_NAME,
} from "../../common/Dhis2ConfigRepository";
import {
    MalDataApprovalItem,
    MalDataApprovalItemIdentifier,
    MonitoringValue,
} from "../../../domain/reports/mal-data-approval/entities/MalDataApprovalItem";
import {
    MalDataApprovalOptions,
    MalDataApprovalRepository,
} from "../../../domain/reports/mal-data-approval/repositories/MalDataApprovalRepository";
import { DataDiffItem, DataDiffItemIdentifier } from "../../../domain/reports/mal-data-approval/entities/DataDiffItem";
import { Namespaces } from "../../common/clients/storage/Namespaces";
import { paginate } from "../../../domain/common/entities/PaginatedObjects";

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

type dataElementsType = { id: string; name: string };

type dataSetElementsType = { dataElement: dataElementsType };

type dataValueType = {
    dataElement: string;
    period: string;
    orgUnit: string;
    value: string;
    [key: string]: string;
};

type dataSetsValueType = {
    dataSet: string;
    period: string;
    orgUnit: string;
    completeDate?: string;
    dataValues: dataValueType[];
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
    | "orgunitcode"
    | "period"
    | "attribute"
    | "approvalworkflowuid"
    | "approvalworkflow"
    | "completed"
    | "validated"
    | "approved"
    | "lastupdatedvalue"
    | "lastdateofsubmission"
    | "lastdateofapproval"
    | "diff"
    | "monitoring";

const fieldMapping: Record<keyof MalDataApprovalItem, SqlField> = {
    dataSetUid: "datasetuid",
    dataSet: "dataset",
    orgUnitUid: "orgunit",
    orgUnit: "orgunit",
    orgUnitCode: "orgunitcode",
    period: "period",
    attribute: "attribute",
    approvalWorkflowUid: "approvalworkflowuid",
    approvalWorkflow: "approvalworkflow",
    completed: "completed",
    validated: "validated",
    approved: "approved",
    lastUpdatedValue: "lastupdatedvalue",
    lastDateOfSubmission: "lastdateofsubmission",
    lastDateOfApproval: "lastdateofapproval",
    modificationCount: "diff",
    monitoring: "monitoring",
};

export class MalDataApprovalDefaultRepository implements MalDataApprovalRepository {
    private storageClient: StorageClient;
    private globalStorageClient: StorageClient;

    constructor(private api: D2Api) {
        const instance = new Instance({ url: this.api.baseUrl });
        this.storageClient = new DataStoreStorageClient("user", instance);
        this.globalStorageClient = new DataStoreStorageClient("global", instance);
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
                dataSetUid: item.datasetuid,
                orgUnitUid: item.orgunituid,
                period: item.period,
                value: item.value,
                apvdValue: item.apvdvalue,
                dataElement: item.dataelement,
                apvdDataElement: item.apvddataelement,
                comment: item.comment,
                apvdComment: item.apvdcomment,
            })
        );

        const dataElementOrderArray = await this.getSortOrder();

        if (!_.isEmpty(dataElementOrderArray)) {
            const sortedItems = items.sort((a, b) => {
                if (a.dataElement && b.dataElement) {
                    return dataElementOrderArray.indexOf(a.dataElement) - dataElementOrderArray.indexOf(b.dataElement);
                } else {
                    return 0;
                }
            });
            return paginate(sortedItems, options.paging);
        } else {
            return paginate(items, options.paging);
        }
    }

    async get(options: MalDataApprovalOptions): Promise<PaginatedObjects<MalDataApprovalItem>> {
        const { config } = options; // ?
        const { sorting, dataSetIds, orgUnitIds, periods, useOldPeriods } = options; // ?
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
                getSqlViewId(
                    config,
                    !useOldPeriods ? SQL_VIEW_DATA_DUPLICATION_NAME : SQL_VIEW_OLD_DATA_DUPLICATION_NAME
                ),
                {
                    orgUnitRoot: sqlViewJoinIds(config.currentUser.orgUnits.map(({ id }) => id)),
                    orgUnits: sqlViewJoinIds(orgUnitIds),
                    periods: sqlViewJoinIds(periods),
                    dataSets: sqlViewJoinIds(_.isEmpty(dataSetIds) ? allDataSetIds : dataSetIds),
                    completed: options.completionStatus === undefined ? "-" : options.completionStatus ? "true" : "-",
                    approved: options.approvalStatus === undefined ? "-" : options.approvalStatus.toString(),
                    orderByColumn: fieldMapping[sorting.field],
                    orderByDirection: sorting.direction,
                },
                paging_to_download
            )
            .getData();

        const countryCodes = await this.getCountryCodes();

        const { pager, objects } = mergeHeadersAndData(options, periods, headerRows, rows, countryCodes);
        const objectsInPage = await promiseMap(objects, async item => {
            const approved = (
                await this.api
                    .get<any>("/dataApprovals", { ds: item.dataSetUid, pe: item.period, ou: item.orgUnitUid })
                    .getData()
            ).mayUnapprove;

            return {
                ...item,
                approved,
            };
        });

        return { pager, objects: objectsInPage };

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
            const response = (
                await this.api
                    .post<any>("/completeDataSetRegistrations", {}, { completeDataSetRegistrations })
                    .getData()
            ).response;

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
                value: getISODate(),
            }));

            const dateResponse = await this.api.post<any>("/dataValueSets.json", {}, { dataValues }).getData();
            if (dateResponse.response.status !== "SUCCESS") throw new Error("Error when posting Submission date");

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

            const completeResponse = dataSetsToComplete.length !== 0 ? await this.complete(dataSetsToComplete) : true;

            const response = await promiseMap(dataSets, async approval =>
                this.api
                    .post<any>(
                        "/dataApprovals",
                        { ds: approval.dataSet, pe: approval.period, ou: approval.orgUnit },
                        {}
                    )
                    .getData()
            );

            return _.every(response, item => item === "") && completeResponse;
        } catch (error: any) {
            return false;
        }
    }

    async duplicateDataSets(dataSets: MalDataApprovalItemIdentifier[]): Promise<boolean> {
        try {
            const approvalDataSetId = process.env.REACT_APP_APPROVE_DATASET_ID ?? "fRrt4V8ImqD";

            const dataValueSets: dataSetsValueType[] = await this.getDataValueSets(dataSets);

            const uniqueDataSets = _.uniqBy(dataSets, "dataSet");
            const DSDataElements: { dataSetElements: dataSetElementsType[] }[] = await this.getDSDataElements(
                uniqueDataSets
            );

            const ADSDataElements: dataElementsType[] = await this.getADSDataElements(approvalDataSetId);

            const dataElementsMatchedArray: { origId: any; destId: any }[] = DSDataElements.flatMap(DSDataElement => {
                return DSDataElement.dataSetElements.map(element => {
                    const dataElement = element.dataElement;
                    const othername = dataElement.name + "-APVD";
                    const ADSDataElement = ADSDataElements.find(DataElement => String(DataElement.name) === othername);
                    return {
                        origId: dataElement?.id,
                        destId: ADSDataElement?.id,
                    };
                });
            });

            const dataValues = this.makeDataValuesArray(approvalDataSetId, dataValueSets, dataElementsMatchedArray);

            this.addTimestampsToDataValuesArray(approvalDataSetId, dataSets, dataValues);

            return this.chunkedDataValuePost(dataValues, 3000);
        } catch (error: any) {
            console.debug(error);
            return false;
        }
    }

    async duplicateDataValues(dataValues: DataDiffItemIdentifier[]): Promise<boolean> {
        try {
            const approvalDataSetId = process.env.REACT_APP_APPROVE_DATASET_ID ?? "fRrt4V8ImqD";
            const uniqueDataSets = _.uniqBy(dataValues, "dataSet");
            const uniqueDataElementsNames = _.uniq(_.map(dataValues, "dataElement"));

            const DSDataElements: { dataSetElements: dataSetElementsType[] }[] = await this.getDSDataElements(
                uniqueDataSets
            );

            const dataValueSets: dataSetsValueType[] = await this.getDataValueSets(uniqueDataSets);

            const ADSDataElements: dataElementsType[] = await this.getADSDataElements(approvalDataSetId);

            const dataElementsMatchedArray: { [key: string]: any }[] = DSDataElements.flatMap(DSDataElement => {
                return DSDataElement.dataSetElements.flatMap(element => {
                    const dataElement = element.dataElement;
                    if (uniqueDataElementsNames.includes(dataElement.name)) {
                        const othername = dataElement.name + "-APVD";
                        const ADSDataElement = ADSDataElements.find(DataElement => DataElement.name === othername);
                        return {
                            origId: dataElement?.id,
                            destId: ADSDataElement?.id,
                            name: dataElement.name,
                        };
                    } else {
                        return [];
                    }
                });
            });

            const apvdDataValues = this.makeDataValuesArray(approvalDataSetId, dataValueSets, dataElementsMatchedArray);

            this.addTimestampsToDataValuesArray(approvalDataSetId, dataValues, apvdDataValues);

            return this.chunkedDataValuePost(apvdDataValues, 3000);
        } catch (error: any) {
            console.debug(error);
            return false;
        }
    }

    private async getDataValueSets(actionItems: any[]): Promise<dataSetsValueType[]> {
        return await promiseMap(actionItems, async item =>
            this.api
                .get<any>("/dataValueSets", {
                    dataSet: item.dataSet,
                    period: item.period,
                    orgUnit: item.orgUnit,
                })
                .getData()
        );
    }

    private async getDSDataElements(actionItems: any[]): Promise<{ dataSetElements: dataSetElementsType[] }[]> {
        return await promiseMap(actionItems, async item =>
            this.api
                .get<any>(`/dataSets/${item.dataSet}`, { fields: "dataSetElements[dataElement[id,name]]" })
                .getData()
        );
    }

    private async getADSDataElements(approvalDataSetId: string): Promise<dataElementsType[]> {
        return await this.api
            .get<any>(`/dataSets/${approvalDataSetId}`, { fields: "dataSetElements[dataElement[id,name]]" })
            .getData()
            .then(ADSDataElements =>
                ADSDataElements.dataSetElements.map((element: dataSetElementsType) => {
                    return {
                        id: element.dataElement.id,
                        name: element.dataElement.name,
                    };
                })
            );
    }

    private addTimestampsToDataValuesArray(
        approvalDataSetId: string,
        actionItems: MalDataApprovalItemIdentifier[] | DataDiffItemIdentifier[],
        dataValues: dataValueType[]
    ) {
        actionItems.forEach(actionItem => {
            dataValues.push({
                dataSet: approvalDataSetId,
                period: actionItem.period,
                orgUnit: actionItem.orgUnit,
                dataElement: "VqcXVXTPaZG",
                categoryOptionCombo: "Xr12mI7VPn3",
                attributeOptionCombo: "Xr12mI7VPn3",
                value: getISODate(),
            });
        });
    }

    private makeDataValuesArray(
        approvalDataSetId: string,
        dataValueSets: dataSetsValueType[],
        dataElementsMatchedArray: { [key: string]: any }[]
    ): dataValueType[] {
        return dataValueSets.flatMap(dataValueSet => {
            if (dataValueSet.dataValues) {
                return dataValueSet.dataValues.flatMap(dataValue => {
                    const data = { ...dataValue };
                    const destId = dataElementsMatchedArray.find(
                        dataElementsMatchedObj => dataElementsMatchedObj.origId === dataValue.dataElement
                    )?.destId;

                    if (!_.isEmpty(destId) && !_.isEmpty(data.value)) {
                        data.dataElement = destId;
                        data.dataSet = approvalDataSetId;
                        delete data.lastUpdated;
                        delete data.comment;

                        return data;
                    } else {
                        return [];
                    }
                });
            } else {
                return [];
            }
        });
    }

    private async chunkedDataValuePost(apvdDataValues: dataValueType[], chunkSize: number) {
        if (apvdDataValues.length > chunkSize) {
            const copyResponse = [];
            for (let i = 0; i < apvdDataValues.length; i += chunkSize) {
                const chunk = apvdDataValues.slice(i, i + chunkSize);
                const response = await this.api
                    .post<any>("/dataValueSets.json", {}, { dataValues: _.reject(chunk, _.isEmpty) })
                    .getData();

                copyResponse.push(response);
            }
            return _.every(copyResponse, item => item.status === "SUCCESS");
        } else {
            const copyResponse = await this.api
                .post<any>("/dataValueSets.json", {}, { dataValues: _.reject(apvdDataValues, _.isEmpty) })
                .getData();

            return copyResponse.response
                ? copyResponse.response.status === "SUCCESS"
                : copyResponse.status === "SUCCESS";
        }
    }

    async duplicateDataValuesAndRevoke(dataValues: DataDiffItemIdentifier[]): Promise<boolean> {
        try {
            const duplicateResponse = await this.duplicateDataValues(dataValues);

            const revokeData: MalDataApprovalItemIdentifier = {
                dataSet: dataValues[0]?.dataSet ?? "",
                period: dataValues[0]?.period ?? "",
                orgUnit: dataValues[0]?.orgUnit ?? "",
                orgUnitCode: "",

                workflow: "",
            };

            const revokeResponse = await this.api
                .delete<any>("/dataApprovals", {
                    ds: revokeData.dataSet,
                    pe: revokeData.period,
                    ou: revokeData.orgUnit,
                })
                .getData();

            return duplicateResponse && revokeResponse === "";
        } catch (error: any) {
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
                    .delete<any>("/dataApprovals", { ds: approval.dataSet, pe: approval.period, ou: approval.orgUnit })
                    .getData()
            );

            return _.every(response, item => item === "");
        } catch (error: any) {
            return false;
        }
    }

    async duplicateUnapprove(dataSets: MalDataApprovalItemIdentifier[]): Promise<boolean> {
        try {
            const response: any[] = [];
            dataSets.forEach(async dataSet => {
                const isApproved = await this.api
                    .get<any>("/dataApprovals", { wf: dataSet.workflow, pe: dataSet.period, ou: dataSet.orgUnit })
                    .getData();

                if (isApproved.state === "APPROVED_HERE") {
                    response.push(
                        await this.api
                            .delete<any>("/dataApprovals", {
                                wf: dataSet.workflow,
                                pe: dataSet.period,
                                ou: dataSet.orgUnit,
                            })
                            .getData()
                    );
                }
            });

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

    async getCountryCodes() {
        const { organisationUnits } = await this.api
            .get<{ organisationUnits: { id: string; code: string }[] }>(
                "/organisationUnits.json?fields=id,code&filter=level:eq:3&paging=false"
            )
            .getData();

        return organisationUnits;
    }

    async getMonitoring(namespace: string): Promise<MonitoringValue> {
        const monitoring = (await this.globalStorageClient.getObject<MonitoringValue>(namespace)) ?? {};

        return monitoring;
    }

    async saveMonitoring(namespace: string, monitoring: MonitoringValue): Promise<void> {
        return await this.globalStorageClient.saveObject<MonitoringValue>(namespace, monitoring);
    }

    async getSortOrder(): Promise<string[]> {
        const sortOrderArray = await this.storageClient.getObject<string[]>(Namespaces.MAL_DIFF_NAMES_SORT_ORDER);

        return sortOrderArray ?? [];
    }

    async generateSortOrder(): Promise<void> {
        try {
            const dataSetData: {
                dataSetElements: dataSetElementsType[];
                sections: { id: string }[];
            } = await this.api
                .get<any>(`/dataSets/${MAL_WMR_FORM}`, { fields: "sections,dataSetElements[dataElement[id,name]]" })
                .getData();

            if (_.isEmpty(dataSetData.sections) || _.isEmpty(dataSetData.dataSetElements)) {
                return this.storageClient.saveObject<string[]>(Namespaces.MAL_DIFF_NAMES_SORT_ORDER, []);
            }

            const dataSetElements: dataElementsType[] = dataSetData.dataSetElements.map(item => item.dataElement);

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

function getISODate() {
    const date = new Date().toISOString();
    return date.slice(0, date.lastIndexOf(":"));
}

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
    data: SqlViewGetData<SqlField>["rows"],
    countryCodes: { id: string; code: string }[]
) {
    const { sorting, paging, orgUnitIds, periods, approvalStatus, completionStatus } = options; // ?
    const activePeriods = periods.length > 0 ? periods : selectablePeriods;
    const rows: Array<MalDataApprovalItem> = [];

    const mapping = _(data)
        .keyBy(dv => {
            return [dv.orgunituid, dv.period].join(".");
        })
        .value();

    const filterOrgUnitIds = orgUnitIds.length > 0 ? orgUnitIds : undefined;

    for (const period of activePeriods) {
        for (const header of headers) {
            if (filterOrgUnitIds !== undefined && filterOrgUnitIds.indexOf(header.orgunituid) === -1) {
                continue;
            }
            const datavalue = mapping[[header.orgunituid, period].join(".")];

            const row: MalDataApprovalItem = {
                dataSetUid: header.datasetuid,
                dataSet: header.dataset,
                orgUnitUid: header.orgunituid,
                orgUnit: header.orgunit,
                orgUnitCode: countryCodes.find(countryCode => header.orgunituid === countryCode.id)?.code ?? "",
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

    const rowsFiltered = rowsSorted.filter(row => {
        return (
            //completed
            (approvalStatus === undefined && completionStatus === true && row.completed) ||
            //not completed
            (approvalStatus === undefined && completionStatus === false && !row.completed) ||
            //submitted
            (approvalStatus === true && row.validated && row.completed) ||
            //ready for sumbitted
            (approvalStatus === false && !row.validated && row.completed) ||
            //no filter
            (approvalStatus === undefined && completionStatus === undefined)
        );
    });
    return paginate(rowsFiltered, paging);
}

export const MAL_WMR_FORM = "CWuqJ3dtQC4";
