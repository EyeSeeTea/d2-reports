import { Config } from "../../../domain/common/entities/Config";
import {
    DataDuplicationItem,
    getDataDuplicationItemId,
} from "../../../domain/reports/mal-dataset-duplication/entities/DataDuplicationItem";
import { toDate } from "date-fns-tz";

export interface DataApprovalViewModel {
    id: string;
    dataSetUid: string;
    dataSet: string;
    orgUnitUid: string;
    orgUnit: string;
    period: string;
    attribute: string;
    approvalWorkflowUid: string;
    approvalWorkflow: string;
    completed: boolean;
    validated: boolean;
    lastUpdatedValue: Date | undefined;
    lastDateOfSubmission: Date | undefined;
    lastDateOfApproval: Date | undefined;
    modificationCount: string | undefined;
}

export function getDataApprovalViews(_config: Config, items: DataDuplicationItem[]): DataApprovalViewModel[] {
    return items.map(item => {
        return {
            id: getDataDuplicationItemId(item),
            dataSetUid: item.dataSetUid,
            dataSet: item.dataSet,
            orgUnitUid: item.orgUnitUid,
            orgUnit: item.orgUnit,
            period: item.period,
            attribute: item.attribute ?? "-",
            approvalWorkflowUid: item.approvalWorkflowUid ?? "-",
            approvalWorkflow: item.approvalWorkflow ?? "-",
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
