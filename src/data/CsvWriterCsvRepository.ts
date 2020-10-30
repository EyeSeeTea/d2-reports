import { createObjectCsvStringifier } from "csv-writer";
import { CsvData, CsvRepository } from "../domain/repositories/CsvRepository";

export class CsvWriterCsvRepository<Field extends string> implements CsvRepository<Field> {
    toString(data: CsvData<Field>): string {
        const csvStringifier = createObjectCsvStringifier({
            header: data.headers.map(headers => ({
                id: headers.id,
                title: headers.text,
            })),
        });
        const header = csvStringifier.getHeaderString();
        const rows = csvStringifier.stringifyRecords(data.rows);

        return header + rows;
    }
}
