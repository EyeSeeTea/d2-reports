import { ColumnRepository } from "../repositories/ColumnRepository";

export class GetColumnsUseCase {
    constructor(private columnRepository: ColumnRepository) {}

    execute(namespace: string): Promise<string[]> {
        return this.columnRepository.getColumns(namespace);
    }
}
