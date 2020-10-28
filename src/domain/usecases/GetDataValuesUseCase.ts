import { DataValueRepository } from "../repositories/DataValueRepository";
import { DataValue } from "../entities/DataValue";
import { Id } from "../entities/Base";
import { Config } from "../entities/Config";

interface Options {
    periods: string[];
    dataSets: Id[];
    config: Config;
}

export class GetDataValuesUseCase {
    constructor(private dataValueRepository: DataValueRepository) {}

    execute(options: Options): Promise<DataValue[]> {
        // TODO: Return Future instead, to allow better error handling and cancellation.
        return this.dataValueRepository.get(options);
    }
}
