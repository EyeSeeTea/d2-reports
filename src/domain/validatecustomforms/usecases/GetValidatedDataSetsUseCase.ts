import { DataSetsRepository } from "../repositories/DataSetsRepository";

export class GetValidatedDataSetsUseCase {
    constructor(private dataSetsRepository: DataSetsRepository) {}

    execute(id: string): Promise<string[]> {
        // FUTURE: Return a Future-like instead, to allow better error handling and cancellation.
        return this.dataSetsRepository.validate(id);
    }
}
