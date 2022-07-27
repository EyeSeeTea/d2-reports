import _ from "lodash";
import { DataCommentsItem } from "../domain/nhwa-comments/entities/DataCommentsItem";
import {
    NHWADataCommentsRepository,
    NHWADataCommentsRepositoryGetOptions,
} from "../domain/nhwa-comments/repositories/NHWADataCommentsRepository";
import { D2Api, PaginatedObjects, Id } from "../types/d2-api";
import { Dhis2SqlViews } from "./Dhis2SqlViews";
import { CsvWriterDataSource } from "./CsvWriterCsvDataSource";
import { downloadFile } from "./utils/download-file";
import { CsvData } from "./CsvDataSource";
import { DataValueRepository } from "../domain/validate-yesnopartial/repositories/DataValueRepository";
import { DataValue } from "../domain/entities/DataValue";
import { D2ApiRequestParamsValue } from "@eyeseetea/d2-api/api/common";
import { NamedRef } from "../domain/entities/Ref";

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
    | "lastupdated";

const fieldMapping: Record<keyof DataValue, SqlField> = {
    period: "period",
    orgUnit: "orgunit",
    dataSet: "datasetname",
    dataElement: "dataelementname",
    categoryOptionCombo: "cocname",
    value: "value",
    comment: "comment",
};

interface DataSet {
    id: Id;
    dataSetElements: Array<{ dataElement: NamedRef }>;
}

const base = {
    dataSets: { namePrefix: "NHWA", nameExcluded: /old$/ },
    dataSetElements: { dataElement: { categoryCombo: { id: { idPrefix: "sNmNyudrFxw" } } } },
};

function sqlViewJoinIds(ids: Id[]): string {
    return ids.join("-") || "-";
}

type DataValueRow = Record<string, string>;
const toName = { $fn: { name: "rename", to: "name" } } as const;

function getFilteredDataSets<DataSet extends NamedRef>(dataSets: DataSet[]): DataSet[] {
    const { namePrefix, nameExcluded } = base.dataSets;
    return dataSets.filter(({ name }) => name.startsWith(namePrefix) && !name.match(nameExcluded));
}
export class DataValueDefaultRepository implements DataValueRepository {
    constructor(private api: D2Api) {}

    async get(): Promise<PaginatedObjects<DataValue>> {
        const { dataSets } = await this.getMetadata();
        const filteredDataSets = getFilteredDataSets(dataSets);

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

        /*         const sqlViews = new Dhis2SqlViews(this.api);
        const { pager, rows } = await sqlViews
            .query<Variables, SqlField>(
                config.dataCommentsSqlView.id,
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
            .getData(); */

        // A data value is not associated to a specific data set, but we can still map it
        // through the data element (1 data value -> 1 data element -> N data sets).

        const dataValues: Array<DataCommentsItem> = rows.map(
            (dv): DataCommentsItem => ({
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
            })
        );

        return { pager, objects: dataValues };
    }

    async push(dataValues: DataValue[], remove: boolean): Promise<boolean | undefined> {
        if (remove) {
            const rows = dataValues.map(
                (dataValue): DataValueRow => ({
                    pe: dataValue.period,
                    ou: dataValue.orgUnit.name,
                    ds: dataValue.dataSet.name,
                    det: dataValue.dataElement.name,
                    co: dataValue.categoryOptionCombo.name,
                })
            );
            try {
                const response = await this.api.post<any>("/dataValues", {}, { rows }).getData();
                return response.status === "SUCCESS";
            } catch (error: any) {
                return error;
            }
        } else {
            const rows = dataValues.map(
                (dataValue): DataValueRow => ({
                    pe: dataValue.period,
                    ou: dataValue.orgUnit.name,
                    ds: dataValue.dataSet.name,
                    det: dataValue.dataElement.name,
                    co: dataValue.categoryOptionCombo.name,
                    value: dataValue.value,
                })
            );
            try {
                const response = await this.api.post<any>("/dataValues", {}, { rows }).getData();
                return response.status === "SUCCESS";
            } catch (error: any) {
                return error;
            }
        }
    }

    getMetadata() {
        const metadata$ = this.api.metadata.get({
            dataSets: {
                fields: {
                    id: true,
                    displayName: toName,
                    dataSetElements: {
                        dataElement: { id: true, name: true, categoryCombo: { id: true } },
                    },
                },
                filter: { name: { $ilike: base.dataSets.namePrefix } },
            },
        });

        return metadata$.getData();
    }
}
