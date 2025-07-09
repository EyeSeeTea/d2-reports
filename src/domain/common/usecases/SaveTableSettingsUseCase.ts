import { TableSettings } from "../entities/TableSettings";
import { TableSettingsRepository } from "../repositories/TableSettingsRepository";

export class SaveTableSettingsUseCase {
    constructor(private tableSettingsRepository: TableSettingsRepository) {}

    execute<T>(tableSettings: TableSettings<T>): Promise<void> {
        return this.tableSettingsRepository.save(tableSettings);
    }
}
