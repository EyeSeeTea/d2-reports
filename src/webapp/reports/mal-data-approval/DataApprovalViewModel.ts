import _ from "lodash";
import { Config } from "../../../domain/common/entities/Config";
import {
    MalDataApprovalItem,
    MalDataSet,
    getDataDuplicationItemId,
} from "../../../domain/reports/mal-data-approval/entities/MalDataApprovalItem";
import { toDate } from "date-fns-tz";
import {
    getDataDuplicationItemMonitoringValue,
    MonitoringValue,
} from "../../../domain/reports/mal-data-approval/entities/MonitoringValue";

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
    monitoring: boolean | undefined;
    approved: boolean | undefined;
}

export function getDataApprovalViews(
    config: Config,
    items: MalDataApprovalItem[],
    monitoring: MonitoringValue
): DataApprovalViewModel[] {
    return items.map(item => {
        const dataSetName = (_.values(config.dataSets).find(dataSet => item.dataSetUid === dataSet.id)?.name ??
            "") as MalDataSet;

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
            monitoring: getDataDuplicationItemMonitoringValue(item, dataSetName, monitoring),
            approved: item.approved,
        };
    });
}
