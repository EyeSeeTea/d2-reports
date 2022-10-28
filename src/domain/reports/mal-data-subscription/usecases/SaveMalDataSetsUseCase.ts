import { UseCase } from "../../../../compositionRoot";
import { MalDataSubscriptionItem } from "../entities/MalDataSubscriptionItem";
import { MalDataSubscriptionRepository } from "../repositories/MalDataSubscriptionRepository";

export class SaveMalDataSetsUseCase implements UseCase {
    constructor(private dataSetRepository: MalDataSubscriptionRepository) {}

    async execute(filename: string, dataSets: MalDataSubscriptionItem[]): Promise<void> {
        this.dataSetRepository.save(filename, dataSets);
    }
}
