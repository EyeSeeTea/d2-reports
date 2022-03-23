import { D2Api } from "../types/d2-api";
import { HiddenDashboardsRepository } from "../domain/hidden-visualization/repositories/HiddenDashboardsRepository";
import { HiddenDashboardResult } from "../domain/common/entities/HiddenDashboardResult";
import { CsvWriterDataSource } from "./CsvWriterCsvDataSource";
import { CsvData } from "./CsvDataSource";
import { downloadFile } from "./utils/download-file";

const sqlViewUid = "n5QWHt30SCu"

export async function promiseMap<T, S>(inputValues: T[], mapper: (value: T) => Promise<S>): Promise<S[]> {
    const output: S[] = [];
    for (const value of inputValues) {
        const res = await mapper(value);
        output.push(res);
    }
    return output;
}

export class HiddenDashboardsDefaultRepository implements HiddenDashboardsRepository {

    constructor(private api: D2Api) {
    }
    async getHiddenDashboards(): Promise<HiddenDashboardResult[]> {
        
        const result: any = await this.api.metadata.d2Api.get("/sqlViews/" + sqlViewUid + "/data?paging=false").getData();
        const data = result.listGrid.rows.map((row: string[]) => ({
            id: row[0],
            code: row[1],
            name: row[2],
            sharing: row[3],
            details: this.api.apiPath +"/dashboards/"+ row[0],
        }));
        const dashboards: HiddenDashboardResult[] = data.map(
            (item: HiddenDashboardResult) : HiddenDashboardResult => ({
                id: item.id,
                name: item.name,
                code: item.code?? "-",
                sharing: item.sharing,
                details: item.details,
            })
        );
        

        return dashboards;
    }

    async exportToCsv(): Promise<void> {
        const metadataObjects = await (await this.getHiddenDashboards());
        const headers = csvFields.map(field => ({ id: field, text: field }));
        if (metadataObjects === undefined) {
            return;
        } else {
            const rows = metadataObjects.map(
                (ValidationResults: HiddenDashboardResult):  MetadataRow=> ({
                    id: ValidationResults.id,
                    name: ValidationResults.name,
                    code: ValidationResults.code?? "-",
                    sharing: ValidationResults.sharing,
                })
            );

            const csvDataSource = new CsvWriterDataSource();
            const csvData: CsvData<CsvField> = { headers, rows };
            const csvContents = csvDataSource.toString(csvData);

            await downloadFile(csvContents, "export.csv", "text/csv");
        }
    }
    
}
const csvFields = [
    "id",
    "code",
    "name",
    "sharing",
] as const;

type CsvField = typeof csvFields[number];

type MetadataRow = Record<CsvField, string>;