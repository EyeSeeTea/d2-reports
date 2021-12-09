import { DataSet } from "../entities/DataSet";
import { DataSetRepository } from "../repositories/DataSetRepository";

export class SaveDataSetsUseCase {
    constructor(private dataSetRepository: DataSetRepository) {}

    async execute(filename: string, dataSets: DataSet[]): Promise<void> {
        this.dataSetRepository.save(filename, dataSets);
    }
}
