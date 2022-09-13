import { UseCase } from "../../../../compositionRoot";
import { PaginatedObjects } from "../../../common/entities/PaginatedObjects";
import { MalDataApprovalItem } from "../entities/MalDataApprovalItem";
import { MalDataApprovalRepository, MalDataApprovalOptions } from "../repositories/MalDataApprovalRepository";

type DataSetsOptions = MalDataApprovalOptions;

export class GetMalDataSetsUseCase implements UseCase {
    constructor(private dataSetRepository: MalDataApprovalRepository) {}

    execute(options: DataSetsOptions): Promise<PaginatedObjects<MalDataApprovalItem>> {
        // FUTURE: Return a Future-like instead, to allow better error handling and cancellation.
        return this.dataSetRepository.get(options);
    }
}
