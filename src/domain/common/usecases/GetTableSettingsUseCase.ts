import { TableSettingsRepository } from "../repositories/TableSettingsRepository";

export class GetTableSettingsUseCase {
    constructor(private tableSettingsRepository: TableSettingsRepository) {}

    async execute<T>(name: string): Promise<Array<keyof T>> {
        const { visibleColumns } = await this.tableSettingsRepository.get(name);

        return visibleColumns;
    }
}
