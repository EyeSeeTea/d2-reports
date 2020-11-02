import _ from "lodash";
import { DataValue } from "../domain/entities/DataValue";
import { DataValueRepository, GetOptions } from "../domain/repositories/DataValueRepository";
import { D2Api, PaginatedObjects, Id } from "../types/d2-api";
import { Dhis2SqlViews } from "./Dhis2SqlViews";

interface Variables {
    dataSetIds: string;
    orgUnitIds: string;
    periods: string;
    orderByColumn: Field;
    orderByDirection: "asc" | "desc";
    commentPairs: string;
}

type Field =
    | "datasetname"
    | "dataelementid"
    | "dataelementname"
    | "cocname"
    | "period"
    | "value"
    | "comment"
    | "storedby"
    | "orgunit"
    | "lastupdated";

const fieldMapping: Record<keyof DataValue, Field> = {
    period: "period",
    orgUnit: "orgunit",
    dataSet: "datasetname",
    dataElement: "dataelementname",
    categoryOptionCombo: "cocname",
    value: "value",
    comment: "comment",
    lastUpdated: "lastupdated",
    storedBy: "storedby",
};

const allPeriods = _.range(2010, new Date().getFullYear() + 1).map(n => n.toString());

export class Dhis2DataValueRepository implements DataValueRepository {
    constructor(private api: D2Api) {}

    async get(options: GetOptions): Promise<PaginatedObjects<DataValue>> {
        const { api } = this;
        const { config, dataSetIds, orgUnitIds, periods, paging, sorting } = options;
        const allDataSetIds = _.values(config.dataSets).map(ds => ds.id);
        const dataSetIds2 = _.isEmpty(dataSetIds) ? allDataSetIds : dataSetIds;
        const commentPairs =
            _(config.pairedDataElementsByDataSet)
                .at(dataSetIds2)
                .flatten()
                .map(pair => `${pair.dataValueVal}_${pair.dataValueComment}`)
                .join("-") || "-";

        const sqlViews = new Dhis2SqlViews(api);
        const { pager, rows } = await sqlViews
            .query<Variables, Field>(
                config.getDataValuesSqlView.id,
                {
                    orgUnitIds: sqlViewJoinIds(orgUnitIds),
                    periods: sqlViewJoinIds(_.isEmpty(periods) ? allPeriods : periods),
                    dataSetIds: sqlViewJoinIds(dataSetIds2),
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
                period: dv.period.split("-")[0],
                orgUnit: { name: dv.orgunit },
                dataSet: { name: dv.datasetname },
                dataElement: { id: dv.dataelementid, name: dv.dataelementname },
                categoryOptionCombo: { name: dv.cocname },
                value: dv.value,
                comment: dv.comment,
                lastUpdated: new Date(dv.lastupdated),
                storedBy: dv.storedby,
            })
        );

        return { pager, objects: dataValues };
    }
}

/* From the docs: "The variables must contain alphanumeric, dash, underscore and
   whitespace characters only."

   Use "-" as id separator.
*/
function sqlViewJoinIds(ids: Id[]): string {
    return ids.join("-");
}

const columns = [
    "dataelement",
    "period",
    "orgunit",
    "categoryoptioncombo",
    "attributeoptioncombo",
    "value",
    "storedby",
    "lastupdated",
    "comment",
    "followup",
    "deleted",
] as const;

type Column = typeof columns[number];

type Row = Record<Column, string>;
