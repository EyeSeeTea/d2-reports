import _ from "lodash";
import { DataElementSubscriptionRepository } from "../repositories/DataElementSubscriptionRepository";
import { SubscriptionFilterOptions } from "../entities/DataElementSubscription";

export class GetSubscriptionFilterOptionsUseCase {
    constructor(private dataElementSubscriptionRepository: DataElementSubscriptionRepository) {}

    async execute(): Promise<Omit<SubscriptionFilterOptions, "reportType">> {
        const dataElementSubscriptionItems = await this.dataElementSubscriptionRepository.getAll();
        const dataElementGroups = dataElementSubscriptionItems.flatMap(item => item.dataElementGroups) ?? [];
        const sections = _(dataElementSubscriptionItems)
            .map(item => item.section)
            .compact()
            .value();

        return { dataElementGroups: dataElementGroups, sections: sections };
    }
}
