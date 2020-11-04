import { DataValue } from "../entities/DataValue";
import { FileRepository } from "../repositories/FileRepository";
import { CsvRepository, CsvData } from "../repositories/CsvRepository";

const fields = [
    "dataSet",
    "period",
    "orgUnit",
    "dataElement",
    "categoryOptionCombo",
    "value",
    "comment",
    "lastUpdated",
    "storedBy",
] as const;

type Field = typeof fields[number];

type DataValueRow = Record<Field, string>;

export class SaveDataValuesCsvUseCase {
    constructor(
        private csvRepository: CsvRepository<Field>,
        private fileRepository: FileRepository
    ) {}

    async execute(filename: string, dataValues: DataValue[]): Promise<void> {
        const headers = fields.map(field => ({ id: field, text: field }));
        // TODO: Add also standard DHIS2 Data export fields
        const rows = dataValues.map(
            (dataValue): DataValueRow => ({
                period: dataValue.period,
                orgUnit: dataValue.orgUnit.name,
                dataSet: dataValue.dataSet.name,
                dataElement: dataValue.dataElement.name,
                categoryOptionCombo: dataValue.categoryOptionCombo.name,
                value: dataValue.value,
                comment: dataValue.comment || "",
                lastUpdated: dataValue.lastUpdated.toISOString(),
                storedBy: dataValue.storedBy,
            })
        );
        const csvData: CsvData<Field> = { headers, rows };
        const csvContents = this.csvRepository.toString(csvData);

        await this.fileRepository.save(csvContents, filename, "text/csv");
    }
}
