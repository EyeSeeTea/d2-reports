import { UseCase } from "../../../../compositionRoot";
import { IndicatorItem, ProgramIndicatorItem } from "../entities/DataQualityItem";
import { DataQualityRepository } from "../repositories/DataQualityRepository";

export class SaveDataQualityUseCase implements UseCase {
    constructor(private approvalRepository: DataQualityRepository) {}

    execute(namespace: string, dataQuality: IndicatorItem[] | ProgramIndicatorItem[]): Promise<void> {
        return this.approvalRepository.saveDataQuality(namespace, dataQuality);
    }
}
