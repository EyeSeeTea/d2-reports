import {
    ATCItem,
    Module,
    Status,
    getATCItemId,
} from "../../../domain/reports/glass-admin/entities/GLASSDataMaintenanceItem";
import { Id } from "../../../types/d2-api";

export interface DataMaintenanceViewModel {
    id: Id;
    fileName: string;
    module: Module;
    orgUnit: string;
    orgUnitName: string;
    period: string;
    status: Status;
}

export interface ATCViewModel {
    id: string;
    currentVersion: boolean;
    uploadedDate: string;
    version: string;
    year: string;
}

export function getATCViewModel(items: ATCItem[]): ATCViewModel[] {
    return items.map(item => {
        return {
            id: getATCItemId(item),
            currentVersion: item.currentVersion,
            uploadedDate: item.uploadedDate,
            version: item.version,
            year: item.year,
        };
    });
}
