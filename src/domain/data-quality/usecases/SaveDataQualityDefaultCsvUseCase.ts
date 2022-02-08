import { DataQualityRepository } from "../repositories/DataQualityRepository";

export class SaveDataQualityDefaultCsvUseCase {
    constructor(private metadataRepository: DataQualityRepository) {}

    async execute(): Promise<void> {
        this.metadataRepository.exportToCsv();
    }
}
