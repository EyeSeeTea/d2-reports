import { UseCase } from "../../../compositionRoot";
import { PaginatedObjects } from "../../common/entities/PaginatedObjects";
import { DataApprovalItem } from "../../nhwa-approval-status/entities/DataApprovalItem";
import {
    WMRDataApprovalRepository,
    WMRDataApprovalRepositoryGetOptions,
} from "../repositories/WMRDataApprovalRepository";

export class GetWMRDataApprovalUseCase implements UseCase {
    constructor(private dataSetRepository: WMRDataApprovalRepository) {}

    execute(options: WMRDataApprovalRepositoryGetOptions): Promise<PaginatedObjects<DataApprovalItem>> {
        // FUTURE: Return a Future-like instead, to allow better error handling and cancellation.
        return this.dataSetRepository.get(options);
    }
}
