import { Config } from "../../../domain/common/entities/Config";
import {
    MalDataSubscriptionItem,
    SubscriptionStatus,
    getDataSubscriptionItemId,
    getSubscriptionValue,
} from "../../../domain/reports/mal-data-subscription/entities/MalDataSubscriptionItem";

export interface DataSubscriptionViewModel {
    id: string;
    dataElementName: string;
    dataElementId: string;
    sectionName: string;
    subscription: boolean;
    lastDateOfSubscription: string;
}

export function getDataSubscriptionViews(
    _config: Config,
    items: MalDataSubscriptionItem[],
    subscription: SubscriptionStatus[]
): DataSubscriptionViewModel[] {
    return items.map(item => {
        return {
            id: getDataSubscriptionItemId(item),
            subscription: getSubscriptionValue(item, subscription),
            dataElementName: item.dataElementName,
            dataElementId: item.dataElementId,
            sectionName: item.sectionName,
            lastDateOfSubscription: item.lastDateOfSubscription,
        };
    });
}
