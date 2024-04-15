import { UseCase } from "../../../../compositionRoot";
import { PaginatedObjects } from "../../../common/entities/PaginatedObjects";
import { SummaryItem } from "../entities/SummaryItem";
import { SummaryOptions, SummaryItemRepository } from "../repositories/SummaryItemRepository";

type SummaryOptions = SummaryOptions;

export class GetSummaryUseCase implements UseCase {
    constructor(private summaryRepository: SummaryItemRepository) {}

    execute(options: SummaryOptions): Promise<PaginatedObjects<SummaryItem>> {
        // FUTURE: Return a Future-like instead, to allow better error handling and cancellation.
        return this.summaryRepository.get(options);
    }
}
