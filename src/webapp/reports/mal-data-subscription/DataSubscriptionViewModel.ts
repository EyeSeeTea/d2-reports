import { Config } from "../../../domain/common/entities/Config";
import {
    MalDataSubscriptionItem,
    getDataSubscriptionItemId,
} from "../../../domain/reports/mal-data-subscription/entities/MalDataSubscriptionItem";

export interface DataSubscriptionViewModel {
    id: string;
    dataElementName: string;
    sectionName: string;
    subscription: string;
    lastDateOfSubscription: string;
}

export function getDataSubscriptionViews(
    _config: Config,
    items: MalDataSubscriptionItem[]
): DataSubscriptionViewModel[] {
    return items.map(item => {
        return {
            id: getDataSubscriptionItemId(item),
            subscription: item.subscription,
            dataElementName: item.dataElementName,
            sectionName: item.sectionName,
            lastDateOfSubscription: item.lastDateOfSubscription,
        };
    });
}
