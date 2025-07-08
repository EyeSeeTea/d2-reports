import { TableSettingsRepository } from "../repositories/TableSettingsRepository";

export class GetTableSettingsUseCase {
    constructor(private tableSettingsRepository: TableSettingsRepository) {}

    async execute(name: string): Promise<string[]> {
        const { visibleColumns } = await this.tableSettingsRepository.get(name);

        return visibleColumns;
    }
}
