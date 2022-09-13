import { UseCase } from "../../../../compositionRoot";
import { PaginatedObjects } from "../../../common/entities/PaginatedObjects";
import { DataDiffItem } from "../entities/DataDiffItem";
import { MalDataApprovalRepository, MalDataApprovalOptions } from "../repositories/MalDataApprovalRepository";

type GetDataDiffUseCaseOptions = MalDataApprovalOptions;

export class GetMalDataDiffUseCase implements UseCase {
    constructor(private dataSetRepository: MalDataApprovalRepository) {}

    execute(options: GetDataDiffUseCaseOptions): Promise<PaginatedObjects<DataDiffItem>> {
        // FUTURE: Return a Future-like instead, to allow better error handling and cancellation.
        return this.dataSetRepository.getDiff(options);
    }
}
