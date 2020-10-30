import { DataValueRepository } from "../repositories/DataValueRepository";
import { DataValue } from "../entities/DataValue";
import { Id, Ref } from "../entities/Base";
import { Config } from "../entities/Config";
import { PaginatedObjects, Paging, Sorting } from "../entities/PaginatedObjects";

interface GetDataValuesUseCaseOptions {
    config: Config;
    paging: Paging;
    sorting: Sorting<DataValue>;
    periods: string[];
    dataSetIds: Id[];
    orgUnitIds: Id[];
}

export class GetDataValuesUseCase {
    constructor(private dataValueRepository: DataValueRepository) {}

    execute<Obj extends Ref>(
        options: GetDataValuesUseCaseOptions
    ): Promise<PaginatedObjects<DataValue>> {
        // TODO: Return Future instead, to allow better error handling and cancellation.
        return this.dataValueRepository.get(options);
    }
}
