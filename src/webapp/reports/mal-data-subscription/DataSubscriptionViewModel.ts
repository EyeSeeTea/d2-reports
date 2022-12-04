import { Config } from "../../../domain/common/entities/Config";
import {
    MalDataSubscriptionItem,
    getDataSubscriptionItemId,
} from "../../../domain/reports/mal-data-subscription/entities/MalDataSubscriptionItem";

export interface DataSubscriptionViewModel {
    id: string;
    dataSetUid: string;
    dataSet: string;
    orgUnitUid: string;
    orgUnit: string;
    period: string;
}

export function getDataSubscriptionViews(
    _config: Config,
    items: MalDataSubscriptionItem[]
): DataSubscriptionViewModel[] {
    return items.map(item => {
        return {
            id: getDataSubscriptionItemId(item),
            dataSetUid: item.dataSetUid,
            dataSet: item.dataSet,
            orgUnitUid: item.orgUnitUid,
            orgUnit: item.orgUnit,
            period: item.period,
        };
    });
}
