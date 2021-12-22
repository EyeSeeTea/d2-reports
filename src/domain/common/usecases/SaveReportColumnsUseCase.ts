import { ConfigRepository } from "../repositories/ConfigRepository";

export class SaveReportColumnsUseCase {
    constructor(private configRepository: ConfigRepository) {}

    execute(report: string, columns: string[]): Promise<void> {
        return this.configRepository.saveReportColumns(report, columns);
    }
}
