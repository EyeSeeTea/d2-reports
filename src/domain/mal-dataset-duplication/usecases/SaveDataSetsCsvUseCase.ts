import { UseCase } from "../../../compositionRoot";
import { DataDuplicationItem } from "../entities/DataDuplicationItem";
import { MALDataDuplicationRepository } from "../repositories/MALDataDuplicationRepository";

export class SaveDataSetsUseCase implements UseCase {
    constructor(private dataSetRepository: MALDataDuplicationRepository) { }

    async execute(filename: string, dataSets: DataDuplicationItem[]): Promise<void> {
        this.dataSetRepository.save(filename, dataSets);
    }
}
