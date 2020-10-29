import _ from "lodash";
import { DataValue } from "../domain/entities/DataValue";
import { DataValueRepository, GetOptions } from "../domain/repositories/DataValueRepository";
import { D2Api, PaginatedObjects, Id } from "../types/d2-api";
import { Dhis2SqlViews } from "./Dhis2SqlViews";

type Variables = Record<"dataSetIds" | "orgUnitIds" | "periods", string>;
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

const allPeriods = _.range(2010, new Date().getFullYear()).map(n => n.toString());

export class Dhis2DataValueRepository implements DataValueRepository {
    constructor(private api: D2Api) {}

    async get(options: GetOptions): Promise<PaginatedObjects<DataValue>> {
        const { api } = this;
        const { config, dataSetIds, orgUnitIds, periods } = options;
        const allDataSetIds = _.values(config.dataSets).map(ds => ds.id);

        const sqlViews = new Dhis2SqlViews(api);
        const { pager, rows } = await sqlViews
            .query<Variables, Field>(
                "gCvQF1yeC9f", // TODO: from config
                {
                    orgUnitIds: sqlViewJoinIds(orgUnitIds),
                    periods: sqlViewJoinIds(_.isEmpty(periods) ? allPeriods : periods),
                    dataSetIds: sqlViewJoinIds(_.isEmpty(dataSetIds) ? allDataSetIds : dataSetIds),
                },
                options.paging
            )
            .getData();

        // A data value is not associated to a specific data set, but we can still map it
        // through the data element (1 data value -> 1 data element -> N data sets).

        const dataValues: Array<DataValue> = rows.map(
            (dv): DataValue => ({
                period: dv.period.split("-")[0],
                orgUnit: { name: dv.orgunit },
                dataSets: [{ name: dv.datasetname }], // TODO
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
