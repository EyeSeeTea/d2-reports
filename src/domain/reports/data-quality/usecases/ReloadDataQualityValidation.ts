import { UseCase } from "../../../../compositionRoot";
import { DataQualityRepository } from "../repositories/DataQualityRepository";

export class ReloadDataQualityValidation implements UseCase {
    constructor(private dataQualityRepository: DataQualityRepository) {}

    execute(namespace: string, fromZero: boolean): Promise<void> {
        return this.dataQualityRepository.reloadValidation(namespace, fromZero);
    }
}
