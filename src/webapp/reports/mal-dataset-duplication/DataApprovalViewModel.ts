import { Config } from "../../../domain/common/entities/Config";
import {
    DataDuplicationItem,
    getDataDuplicationItemId,
} from "../../../domain/mal-dataset-duplication/entities/DataDuplicationItem";

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
    duplicated: boolean;
    lastUpdatedValue: Date;
    lastDateOfSubmission: string | undefined;
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
            attribute: item.attribute,
            approvalWorkflowUid: item.approvalWorkflowUid,
            approvalWorkflow: item.approvalWorkflow,
            completed: item.completed,
            validated: item.validated,
            duplicated: item.duplicated,
            lastUpdatedValue: new Date(item.lastUpdatedValue),
            lastDateOfSubmission: item.lastDateOfSubmission,
        };
    });
}
