import { Config } from "../../../domain/common/entities/Config";
import {
    MalDataSubscriptionItem,
    getDataDuplicationItemId,
} from "../../../domain/reports/mal-data-subscription/entities/MalDataSubscriptionItem";
import { toDate } from "date-fns-tz";

export interface DataSubscriptionViewModel {
    id: string;
    dataSetUid: string;
    dataSet: string;
    orgUnitUid: string;
    orgUnit: string;
    completed: boolean;
    validated: boolean;
    lastUpdatedValue: Date | undefined;
    lastDateOfSubmission: Date | undefined;
    lastDateOfApproval: Date | undefined;
    modificationCount: string | undefined;
}

export function getDataSubscriptionViews(
    _config: Config,
    items: MalDataSubscriptionItem[]
): DataSubscriptionViewModel[] {
    return items.map(item => {
        return {
            id: getDataDuplicationItemId(item),
            dataSetUid: item.dataSetUid,
            dataSet: item.dataSet,
            orgUnitUid: item.orgUnitUid,
            orgUnit: item.orgUnit,
            completed: item.completed,
            validated: item.validated,
            lastUpdatedValue: item.lastUpdatedValue ? toDate(item.lastUpdatedValue, { timeZone: "UTC" }) : undefined,
            lastDateOfSubmission: item.lastDateOfSubmission
                ? toDate(item.lastDateOfSubmission, { timeZone: "UTC" })
                : undefined,
            lastDateOfApproval: item.lastDateOfApproval
                ? toDate(item.lastDateOfApproval, { timeZone: "UTC" })
                : undefined,
            modificationCount: item.modificationCount,
        };
    });
}
