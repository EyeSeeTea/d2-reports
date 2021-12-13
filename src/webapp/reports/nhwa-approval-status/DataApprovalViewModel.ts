import { Config } from "../../../domain/common/entities/Config";
import {
    DataApprovalItem,
    getDataApprovalItemId,
} from "../../../domain/nhwa-approval-status/entities/DataApprovalItem";

export interface DataApprovalViewModel {
    id: string;
    dataSet: string;
    orgUnit: string;
    period: string;
    attribute: string;
    approvalWorkflow: string;
    completed: boolean;
    validated: boolean;
    lastUpdatedValue: Date;
}

export function getDataApprovalViews(_config: Config, items: DataApprovalItem[]): DataApprovalViewModel[] {
    return items.map(item => {
        return {
            id: getDataApprovalItemId(item),
            dataSet: item.dataSet,
            orgUnit: item.orgUnit,
            period: item.period,
            attribute: item.attribute,
            approvalWorkflow: item.approvalWorkflow,
            completed: item.completed,
            validated: item.validated,
            lastUpdatedValue: new Date(item.lastUpdatedValue),
        };
    });
}
