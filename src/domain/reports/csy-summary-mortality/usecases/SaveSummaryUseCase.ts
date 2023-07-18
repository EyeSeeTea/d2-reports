import { SummaryItem } from "../entities/SummaryItem";
import { CSYSummaryRepository } from "../repositories/CSYSummaryRepository";

export class SaveSummaryMortalityUseCase {
    constructor(private summaryRepository: CSYSummaryRepository) {}

    async execute(filename: string, items: SummaryItem[]): Promise<void> {
        this.summaryRepository.save(filename, items);
    }
}
