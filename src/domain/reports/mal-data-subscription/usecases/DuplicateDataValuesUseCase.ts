import { UseCase } from "../../../../compositionRoot";
import { DataDiffItemIdentifier } from "../entities/DataDiffItem";
import { MalDataSubscriptionRepository } from "../repositories/MalDataSubscriptionRepository";

export class DuplicateDataValuesUseCase implements UseCase {
    constructor(private subscriptionRepository: MalDataSubscriptionRepository) {}

    async execute(items: DataDiffItemIdentifier[], revoke?: boolean): Promise<boolean> {
        if (revoke) {
            return this.subscriptionRepository.duplicateDataValuesAndRevoke(items);
        } else {
            return this.subscriptionRepository.duplicateDataValues(items);
        }
    }
}
