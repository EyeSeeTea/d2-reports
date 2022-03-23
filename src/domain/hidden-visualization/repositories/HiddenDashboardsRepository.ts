import { HiddenDashboardResult } from "../../common/entities/HiddenDashboardResult";

export interface HiddenDashboardsRepository {
    getHiddenDashboards(): Promise<HiddenDashboardResult[]>;
    exportToCsv(): Promise<void>;
}