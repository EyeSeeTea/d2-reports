import { UseCase } from "../../../../compositionRoot";
import { IndicatorConfig, ProgramIndicatorConfig } from "../entities/DataQualityItem";
import { DataQualityRepository } from "../repositories/DataQualityRepository";

export class SaveDataQualityUseCase implements UseCase {
    constructor(private dataQualityRepository: DataQualityRepository) {}

    execute(namespace: string, dataQuality: IndicatorConfig | ProgramIndicatorConfig): Promise<void> {
        return this.dataQualityRepository.saveDataQuality(namespace, dataQuality);
    }
}
