export interface CsvRepository<Field extends string> {
    toString(data: CsvData<Field>): string;
}

export interface CsvData<Field extends string> {
    headers: Array<{ id: Field; text: string }>;
    rows: Array<Record<Field, string | undefined>>;
}

export type Row = string[];
