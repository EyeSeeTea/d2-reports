import { UseCase } from "../../../../compositionRoot";
import { PaginatedObjects } from "../../../common/entities/PaginatedObjects";
import { SummaryItem } from "../entities/SummaryItem";
import { CSYSummaryOptions, CSYSummaryRepository } from "../repositories/CSYSummaryRepository";

type SummaryOptions = CSYSummaryOptions;

export class GetSummaryUseCase implements UseCase {
    constructor(private summaryRepository: CSYSummaryRepository) {}

    execute(options: SummaryOptions): Promise<PaginatedObjects<SummaryItem>> {
        // FUTURE: Return a Future-like instead, to allow better error handling and cancellation.
        return this.summaryRepository.get(options);
    }
}
