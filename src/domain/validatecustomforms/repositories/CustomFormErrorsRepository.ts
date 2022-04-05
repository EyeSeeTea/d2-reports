export interface CustomFormErrorsRepository {
    get(id: string): Promise<string[]>;
}
