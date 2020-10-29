import { DataValueRepository } from "../repositories/DataValueRepository";
import { DataValue } from "../entities/DataValue";
import { Id } from "../entities/Base";
import { Config } from "../entities/Config";
import { PaginatedObjects, Paging } from "../entities/PaginatedObjects";

interface GetDataValuesUseCaseOptions {
    config: Config;
    paging: Paging;
    periods: string[];
    dataSetIds: Id[];
    orgUnitIds: Id[];
}

export class GetDataValuesUseCase {
    constructor(private dataValueRepository: DataValueRepository) {}

    execute(options: GetDataValuesUseCaseOptions): Promise<PaginatedObjects<DataValue>> {
        // TODO: Return Future instead, to allow better error handling and cancellation.
        return this.dataValueRepository.get(options);
    }
}
