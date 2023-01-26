import { UseCase } from "../../../../compositionRoot";
import { DataQualityItem } from "../entities/DataQualityItem";
import { DataQualityRepository } from "../repositories/DataQualityRepository";

export class SaveDataQualityUseCase implements UseCase {
    constructor(private approvalRepository: DataQualityRepository) {}

    execute(namespace: string, dataQuality: DataQualityItem[]): Promise<void> {
        return this.approvalRepository.saveDataQuality(namespace, dataQuality);
    }
}
