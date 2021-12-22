import { ConfigRepository } from "../repositories/ConfigRepository";

export class GetReportColumnsUseCase {
    constructor(private configRepository: ConfigRepository) {}

    execute(report: string): Promise<string[]> {
        return this.configRepository.getReportColumns(report);
    }
}
