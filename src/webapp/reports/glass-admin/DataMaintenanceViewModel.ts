import { Module, Status } from "../../../domain/reports/glass-admin/entities/GLASSDataMaintenanceItem";
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
