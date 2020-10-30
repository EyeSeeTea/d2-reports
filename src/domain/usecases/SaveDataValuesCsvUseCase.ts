import { DataValue } from "../entities/DataValue";
import { FileRepository } from "../repositories/FileRepository";
import { CsvRepository, CsvData } from "../repositories/CsvRepository";

export class SaveDataValuesCsvUseCase {
    constructor(
        private csvRepository: CsvRepository<Field>,
        private fileRepository: FileRepository
    ) {}

    async execute(filename: string, dataValues: DataValue[]): Promise<void> {
        const headers = fields.map(field => ({ id: field, text: field }));
        const rows = dataValues.map(dv => ({
            dataelement: dv.dataElement.id,
            period: dv.period,
            orgunit: dv.orgUnit.name, // TODO
            categoryoptioncombo: dv.categoryOptionCombo.name,
            attributeoptioncombo: "TODO",
            value: dv.value,
            storedby: dv.storedBy,
            lastupdated: dv.lastUpdated.toISOString(),
            comment: dv.comment,
            followup: "false", // TODO
            deleted: "false", // TODO
        }));
        const csvData: CsvData<Field> = { headers, rows };
        const csvContents = this.csvRepository.toString(csvData);

        await this.fileRepository.save(csvContents, filename, "text/csv");
    }
}

/*
mjDgqDPsT4J
20200506
H8RixfF8ugH
irkK9eyChrC
Xr12mI7VPn3
true
idelcano
2020-05-06T08:23:45.737+0000
false
false 
*/

const fields = [
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

type Field = typeof fields[number];

type Row = Record<Field, string>;
