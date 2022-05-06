export interface DataSetsRepository {
    validate(id: string): Promise<string[]>;
}
