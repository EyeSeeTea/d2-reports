import { DataValueRepository } from "../repositories/DataValueRepository";
import { DataValue } from "../entities/DataValue";
import { Id } from "../entities/Base";
import { Config } from "../entities/Config";

interface GetDataValuesUseCaseOptions {
    config: Config;
    periods: string[];
    dataSets: Id[];
    orgUnitIds: Id[];
}

export class GetDataValuesUseCase {
    constructor(private dataValueRepository: DataValueRepository) {}

    execute(options: GetDataValuesUseCaseOptions): Promise<DataValue[]> {
        // TODO: Return Future instead, to allow better error handling and cancellation.
        return this.dataValueRepository.get(options);
    }
}
