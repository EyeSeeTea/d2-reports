import _ from "lodash";
import { D2Api, Id, PaginatedObjects } from "../../../types/d2-api";
import { promiseMap } from "../../../utils/promises";
import { DataStoreStorageClient } from "../../common/clients/storage/DataStoreStorageClient";
import { StorageClient } from "../../common/clients/storage/StorageClient";
import { CsvData } from "../../common/CsvDataSource";
import { CsvWriterDataSource } from "../../common/CsvWriterCsvDataSource";
import { Dhis2SqlViews } from "../../common/Dhis2SqlViews";
import { Instance } from "../../common/entities/Instance";
import { downloadFile } from "../../common/utils/download-file";
import { getSqlViewId } from "../../../domain/common/entities/Config";
import { SQL_VIEW_MAL_DATAELEMENTS_NAME } from "../../common/Dhis2ConfigRepository";
import { MalDataSubscriptionItem } from "../../../domain/reports/mal-data-subscription/entities/MalDataSubscriptionItem";
import {
    MalDataSubscriptionOptions,
    MalDataSubscriptionRepository,
} from "../../../domain/reports/mal-data-subscription/repositories/MalDataSubscriptionRepository";
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

interface Variables {
    dataSets: string;
    dataElementName: string;
    sectionName: string;
    lastDateOfSubscription: string;
    orderByColumn: SqlField;
    orderByDirection: "asc" | "desc";
}

type dataElementsType = { id: string; name: string };

type dataSetElementsType = { dataElement: dataElementsType };

type SqlField = "dataelementname" | "sectionname" | "lastdateofsubscription" | "subscription";

const fieldMapping: Record<keyof MalDataSubscriptionItem, SqlField> = {
    dataElementName: "dataelementname",
    subscription: "subscription",
    sectionName: "sectionname",
    lastDateOfSubscription: "lastdateofsubscription",
};

export class MalDataSubscriptionDefaultRepository implements MalDataSubscriptionRepository {
    private storageClient: StorageClient;
    private globalStorageClient: StorageClient;

    constructor(private api: D2Api) {
        const instance = new Instance({ url: this.api.baseUrl });
        this.storageClient = new DataStoreStorageClient("user", instance);
        this.globalStorageClient = new DataStoreStorageClient("global", instance);
    }

    async get(options: MalDataSubscriptionOptions): Promise<PaginatedObjects<MalDataSubscriptionItem>> {
        const { config, dataElementNames, sectionNames, lastDateOfSubscription } = options; // ?
        const { sorting, paging } = options; // ?

        const sqlViews = new Dhis2SqlViews(this.api);
        const allDataSetIds = _.values(config.dataSets).map(ds => ds.id); // ?

        const { pager, rows } = await sqlViews
            .query<Variables, SqlField>(
                getSqlViewId(config, SQL_VIEW_MAL_DATAELEMENTS_NAME),
                {
                    dataSets: sqlViewJoinIds(allDataSetIds),
                    dataElementName: sqlViewJoinIds(dataElementNames),
                    sectionName: sqlViewJoinIds(sectionNames),
                    lastDateOfSubscription: sqlViewJoinIds(lastDateOfSubscription),
                    orderByColumn: fieldMapping[sorting.field],
                    orderByDirection: sorting.direction,
                },
                paging
            )
            .getData();

        const items: Array<MalDataSubscriptionItem> = rows.map(
            (item): MalDataSubscriptionItem => ({
                dataElementName: item.dataelementname,
                subscription: "",
                sectionName: item.sectionname,
                lastDateOfSubscription: item.lastdateofsubscription,
            })
        );

        return { pager, objects: items };
    }

    async save(filename: string, dataSets: MalDataSubscriptionItem[]): Promise<void> {
        const headers = csvFields.map(field => ({ id: field, text: field }));
        const rows = dataSets.map(
            (dataSet): DataSetRow => ({
                dataElementName: dataSet.dataElementName,
                subscription: dataSet.subscription,
                sectionName: dataSet.sectionName,
            })
        );

        const csvDataSource = new CsvWriterDataSource();
        const csvData: CsvData<CsvField> = { headers, rows };
        const csvContents = csvDataSource.toString(csvData);

        await downloadFile(csvContents, filename, "text/csv");
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
                dataSetElements: dataSetElementsType[];
                sections: { id: string }[];
            } = await this.api
                .get<any>(`/dataSets/PWCUb3Se1Ie`, { fields: "sections,dataSetElements[dataElement[id,name]]" })
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

const csvFields = ["dataElementName", "sectionName", "subscription"] as const;

type CsvField = typeof csvFields[number];

type DataSetRow = Record<CsvField, string>;

/* From the docs: "The variables must contain alphanumeric, dash, underscore and
   whitespace characters only.". Use "-" as id separator and also "-" as empty value.
*/
function sqlViewJoinIds(ids: Id[]): string {
    return ids.join("-") || "-";
}
