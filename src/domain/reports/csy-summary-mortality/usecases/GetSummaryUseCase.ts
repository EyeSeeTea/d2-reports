import { UseCase } from "../../../../compositionRoot";
import { PaginatedObjects } from "../../../common/entities/PaginatedObjects";
import { SummaryItem } from "../entities/SummaryItem";
import { SummaryItemOptions, SummaryItemRepository } from "../repositories/SummaryItemRepository";

type SummaryOptions = SummaryItemOptions;

export class GetSummaryMortalityUseCase implements UseCase {
    constructor(private summaryRepository: SummaryItemRepository) {}

    execute(options: SummaryOptions): Promise<PaginatedObjects<SummaryItem>> {
        // FUTURE: Return a Future-like instead, to allow better error handling and cancellation.
        return this.summaryRepository.get(options);
    }
}
