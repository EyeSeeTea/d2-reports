import { PaginatedObjects } from "../../common/entities/PaginatedObjects";
import { DataValueItem } from "../entities/DataValueItem";
import {
    NHWAYesNoPartialDataValuesRepository,
    NHWAYesNoPartialDataValuesRepositoryGetOptions,
} from "../repositories/NHWAYesNoPartialDataValuesRepository";

type GetYesNoPartialUseCaseOptions = NHWAYesNoPartialDataValuesRepositoryGetOptions;

export class GetYesNoPartialDataValuesUseCase {
    constructor(private dataValueRepository: NHWAYesNoPartialDataValuesRepository) {}

    execute(options: GetYesNoPartialUseCaseOptions): Promise<PaginatedObjects<DataValueItem>> {
        // FUTURE: Return a Future-like instead, to allow better error handling and cancellation.
        return this.dataValueRepository.get(options);
    }
}
