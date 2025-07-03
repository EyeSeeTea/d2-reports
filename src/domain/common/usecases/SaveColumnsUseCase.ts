import { ColumnRepository } from "../repositories/ColumnRepository";

export class SaveMalDataSubscriptionColumnsUseCase {
    constructor(private columnRepository: ColumnRepository) {}

    execute(namespace: string, columns: string[]): Promise<void> {
        return this.columnRepository.saveColumns(namespace, columns);
    }
}
