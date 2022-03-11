import { D2Api } from "../types/d2-api";
import { HiddenVisualizationRepository } from "../domain/hidden-visualization/repositories/HiddenVisualizationRepository";
import { HiddenVisualizationResult } from "../domain/common/entities/HiddenVisualizationResult";
import { CsvWriterDataSource } from "./CsvWriterCsvDataSource";
import { CsvData } from "./CsvDataSource";
import { downloadFile } from "./utils/download-file";


export async function promiseMap<T, S>(inputValues: T[], mapper: (value: T) => Promise<S>): Promise<S[]> {
    const output: S[] = [];
    for (const value of inputValues) {
        const res = await mapper(value);
        output.push(res);
    }
    return output;
}

export class HiddenVisualizationDefaultRepository implements HiddenVisualizationRepository {

    constructor(private api: D2Api) {
    }
    async getHiddenVisualizations(sqlViewId: string, type: string): Promise<HiddenVisualizationResult[]> {

        const result: any = await this.api.metadata.d2Api.get("/sqlViews/" + sqlViewId + "/data?paging=false").getData();
        const data = result.listGrid.rows.map((row: any[]) => ({
            uid: row[0],
            code: row[1],
            name: row[2],
            sharing: row[3],
            details: "<h2><a href=\"" + this.api.apiPath +"/"+type+"/"+ row[0]+"\">link</a></h2>",
        }));
        const visualizations: HiddenVisualizationResult[] = data.map(
            (item: any) : HiddenVisualizationResult => ({
                id: item.uid,
                name: item.name,
                code: item.code?? "-",
                sharing: item.sharing,
                details: item.details,
            })
        );
        

        return visualizations;
    }

    async exportToCsv(sqlViewId: string, type: string): Promise<void> {
        const metadataObjects = await (await this.getHiddenVisualizations(sqlViewId, type));
        const headers = csvFields.map(field => ({ id: field, text: field }));
        if (metadataObjects === undefined) {
            return;
        } else {
            const rows = metadataObjects.map(
                (ValidationResults: HiddenVisualizationResult):  MetadataRow=> ({
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