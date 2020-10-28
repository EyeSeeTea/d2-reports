import { DataValueRepository } from "../repositories/DataValueRepository";
import { DataValue } from "../entities/DataValue";

export class GetDataValuesUseCase {
    constructor(private dataValueRepository: DataValueRepository) {}

    execute(): Promise<DataValue[]> {
        // TODO: Return Future instead, to allow better error handling and cancellation.
        return this.dataValueRepository.get();
    }
}
