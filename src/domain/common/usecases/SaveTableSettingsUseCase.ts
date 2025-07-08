import { TableSettings } from "../entities/TableSettings";
import { TableSettingsRepository } from "../repositories/TableSettingsRepository";

export class SaveTableSettingsUseCase {
    constructor(private tableSettingsRepository: TableSettingsRepository) {}

    execute(tableSettings: TableSettings): Promise<void> {
        return this.tableSettingsRepository.save(tableSettings);
    }
}
