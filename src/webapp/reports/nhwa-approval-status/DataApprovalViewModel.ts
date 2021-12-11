import { Config } from "../../../domain/common/entities/Config";
import { DataApprovalItem, getDataApprovalItemId } from "../../../domain/nhwa-approval-status/entities/DataApprovalItem";

export interface DataApprovalViewModel {
    id: string;
    dataSet: string;
    orgUnit: string;
    period: string;
    attribute: string;
    completed: boolean;
    validated: boolean;
    lastUpdatedValue: Date;
}

export function getDataApprovalViews(config: Config, dataSets: DataApprovalItem[]): DataApprovalViewModel[] {
    return dataSets.map(dataSet => {
        return {
            id: getDataApprovalItemId(dataSet),
            dataSet: dataSet.dataSet,
            orgUnit: dataSet.orgUnit,
            period: dataSet.period,
            attribute: dataSet.attribute,
            completed: dataSet.completed,
            validated: dataSet.validated,
            lastUpdatedValue: new Date(dataSet.lastUpdatedValue)
        };
    });
}
