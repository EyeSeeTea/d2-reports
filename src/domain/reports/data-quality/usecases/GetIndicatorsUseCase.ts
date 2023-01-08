import { UseCase } from "../../../../compositionRoot";
import { PaginatedObjects } from "../../../common/entities/PaginatedObjects";
import { DataQualityItem } from "../entities/DataQualityItem";
import { DataQualityRepository, DataQualityOptions } from "../repositories/DataQualityRepository";

type DataElementsOptions = DataQualityOptions;

export class GetIndicatorsUseCase implements UseCase {
    constructor(private dataQualityRepository: DataQualityRepository) {}

    execute(options: DataElementsOptions, namespace: string): Promise<PaginatedObjects<DataQualityItem>> {
        // FUTURE: Return a Future-like instead, to allow better error handling and cancellation.
        return this.dataQualityRepository.getIndicators(options, namespace);
    }
}
