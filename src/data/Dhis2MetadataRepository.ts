import _ from "lodash";
import { D2Api, PaginatedObjects, Id } from "../types/d2-api";
import { Dhis2SqlViews } from "./Dhis2SqlViews";
import { CsvWriterDataSource } from "./CsvWriterCsvDataSource";
import { downloadFile } from "./utils/download-file";
import { CsvData } from "../data/CsvDataSource";
import { MetadataObject } from "../domain/entities/MetadataObject";
import { MetadataRepository, MetadataRepositoryGetOptions } from "../domain/repositories/MetadataRepository";

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
    | "dimensionItemType"
    | "id"
    | "publicAccess"
    | "createdBy"
    | "lastUpdatedBy"
    | "name"
    | "value"
    | "userGroupAccess"
    | "userAccess"
    | "lastUpdated"
    | "created"
    | "lastupdated";

const fieldMapping: Record<keyof MetadataObject, SqlField> = {
    metadataType: "dimensionItemType",
    Id: "id",
    publicAccess: "publicAccess",
    createdBy: "createdBy",
    lastUpdatedBy: "lastUpdatedBy",
    name: "name",
    userGroupAccess: "userGroupAccess",
    userAccess: "userAccess",
    lastUpdated: "lastUpdated",
    created: "created",
};

export class Dhis2MetadataRepository implements MetadataRepository {
    constructor(private api: D2Api) { }

    async get(options: MetadataRepositoryGetOptions): Promise<PaginatedObjects<MetadataObject>> {
        const { config, sqlView, code, inPublicAccess, notInPublicAccess, fields } = options;
        const { paging, sorting } = options;

        if (config.sqlView) {
            const sqlViewResult: any = await this.api.metadata.d2Api.get("/sqlViews/" + sqlView + "/data?paging=false").getData()
            /*             const rows = sqlViewResult["listGrid"]["rows"]
            
                        const metadataObjects: Array<MetadataObject> = rows.map(
                            (row: any): MetadataObject => ({
                                metadataType: row[0].toISOString(),
                                Id: row[1].toISOString(),
                                name: row[2].toISOString(),
                                publicAccess: row[3].toISOString(),
                            })
                        );
                        const pager = {
                            page: 0,
                            pageCount: rows.lenght() / 50,
                            total: rows.lenght(),
                            pageSize: 50,
                        } */



            const sqlViews = new Dhis2SqlViews(this.api);
            const { pager, rows } = await sqlViews
                .query<Variables, SqlField>(
                    sqlView, undefined,
                    paging
                )
                .getData();

            // A data value is not associated to a specific data set, but we can still map it
            // through the data element (1 data value -> 1 data element -> N data sets).

            const dataValues: Array<MetadataObject> = rows.map(
                (metadataObject): MetadataObject => ({
                    Id: metadataObject.id,
                    name: metadataObject.name,
                    metadataType: metadataObject.dimensionItemType,
                    publicAccess: metadataObject.publicAccess
                })
            );

            return { pager, objects: dataValues };

            /* 
            
                        //return { pager, objects: metadataObjects };
            
                        const allMetadataIds = _.values(metadataObjects).map(metadataObject => metadataObject.Id);
            
                        //todo it is a metadata api query
                        const { metadataVersions } = await this.api.metadata
                            .get({
                                metadataVersions: {
                                    filter: { id: { in: allMetadataIds } },
                                    fields: { id: true, path: true, name: true, level: true },
                                },
                            })
                            .getData();
            
                        const fullMetadataObjects: Array<MetadataObject> = rows.map(
                            (row: any): MetadataObject => ({
                                metadataType: row[0].toISOString(),
                                Id: row[1].toISOString(),
                                name: row[2].toISOString(),
                                publicAccess: row[3].toISOString(),
                            })
                        );
            
                        // A data value is not associated to a specific data set, but we can still map it
                        // through the data element (1 data value -> 1 data element -> N data sets).
            
            
                        return { pager, objects: fullMetadataObjects }; */
        } else {

            const { metadataVersions } = await this.api.metadata
                .get({
                    metadataVersions: {
                        filter: { code: { like: code } },
                        fields: { id: true, path: true, name: true, level: true },
                    },
                })
                .getData();

            const { config, sqlView, code, inPublicAccess, notInPublicAccess, fields } = options;
            const { paging, sorting } = options;

            // A data value is not associated to a specific data set, but we can still map it
            // through the data element (1 data value -> 1 data element -> N data sets).


            return { pager, objects: dataValues };
        }
    }

    async save(filename: string, metadataObjects: MetadataObject[]): Promise<void> {
        const headers = csvFields.map(field => ({ id: field, text: field }));
        const rows = metadataObjects.map(
            (metadataObject): MetadataRow => ({
                metadataType: metadataObject.metadataType,
                id: metadataObject.Id,
                name: metadataObject.name,
                publicAccess: metadataObject.publicAccess,
                userGroupAccess: metadataObject.userGroupAccess || "-",
                userAccess: metadataObject.userAccess || "-",
                createdBy: metadataObject.createdBy || "-",
                lastUpdatedBy: metadataObject.lastUpdatedBy || "-",
                created: metadataObject.created || "-",
                lastUpdated: metadataObject.lastUpdated || "-",
            })
        );

        const csvDataSource = new CsvWriterDataSource();
        const csvData: CsvData<CsvField> = { headers, rows };
        const csvContents = csvDataSource.toString(csvData);

        await downloadFile(csvContents, filename, "text/csv");
    }
}

const csvFields = [
    "metadataType",
    "id",
    "name",
    "publicAccess",
    "userGroupAccess",
    "userAccess",
    "createdBy",
    "lastUpdatedBy",
    "created",
    "lastUpdated",
] as const;

type CsvField = typeof csvFields[number];

type MetadataRow = Record<CsvField, string>;

/* From the docs: "The variables must contain alphanumeric, dash, underscore and
   whitespace characters only.". Use "-" as id separator and also "-" as empty value.
*/
function sqlViewJoinIds(ids: Id[]): string {
    return ids.join("-") || "-";
}
