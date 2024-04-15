import { SummaryItem } from "../entities/SummaryItem";
import { SummaryItemRepository } from "../repositories/SummaryItemRepository";

export class SaveSummaryUseCase {
    constructor(private summaryRepository: SummaryItemRepository) {}

    async execute(filename: string, items: SummaryItem[]): Promise<void> {
        this.summaryRepository.save(filename, items);
    }
}
