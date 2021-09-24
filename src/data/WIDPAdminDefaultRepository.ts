import _ from "lodash";
import { D2Api, PaginatedObjects, Id } from "../types/d2-api";
import { Dhis2SqlViews } from "./Dhis2SqlViews";
import { CsvWriterDataSource } from "./CsvWriterCsvDataSource";
import { downloadFile } from "./utils/download-file";
import { CsvData } from "../data/CsvDataSource";
import { MetadataObject } from "../domain/entities/MetadataObject";
import { WIDPAdminRepository } from "../domain/repositories/WIDPAdminRepository";

export class WIDPAdminDefaultRepository implements WIDPAdminRepository {
    constructor(private api: D2Api) { }

    async getPublicMetadata(): Promise<Array<MetadataObject>> {
        const sqlView = "RIw9kc7N4g4";
        debugger;

        const result: any = await this.api.metadata.d2Api.get("/sqlViews/" + sqlView + "/data?paging=false").getData()
        const data = result.listGrid.rows.map(
            (row: any[]) => ({
                Id: row[1]
            })
        );

        const comma_seprated = data.map((item: { [x: string]: any; }) => item["Id"])
        const metadataResult: any = await this.api.metadata.d2Api.get("/metadata.json?fields=id,name,created,createdBy[name],lastUpdated,publicAccess,user[name,displayName],lastUpdatedBy[name,displayName],userGroupAccesses&filter=id:in:[" + comma_seprated + "]").getData()

        const metadataValues = (Object.keys(metadataResult) as Array<keyof typeof metadataResult>).reduce((accumulator, current) => {
            if (current != "system") {
                const item: any = metadataResult[current].map(
                    (row: { [x: string]: any; }) => ({
                        Id: row["id"],
                        name: row["name"],
                        publicAccess: row["publicAccess"],
                        userGroupAccess: row["userGroupAccesses"] ?? "-",
                        userAccess: row["userAccesses"] ?? "-",
                        createdBy: row["createdBy"] ?? "-",
                        lastUpdatedBy: row["lastUpdatedBy"] ?? "-",
                        created: row["created"] ?? "-",
                        lastUpdated: row["lastUpdated"] ?? "-",
                        metadataType: current
                    })
                );
                accumulator.push(item);
            }
            return accumulator;
        }, [] as (typeof metadataResult[keyof typeof metadataResult])[]);

        return metadataValues.flat(1)
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
