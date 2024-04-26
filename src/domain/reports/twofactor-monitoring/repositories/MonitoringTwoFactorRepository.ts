import { PaginatedObjects } from "../../../common/entities/PaginatedObjects";
import { MonitoringTwoFactorOptions } from "../entities/MonitoringTwoFactorOptions";
import { MonitoringTwoFactorUser } from "../entities/MonitoringTwoFactorUser";

export interface MonitoringTwoFactorRepository {
    get(namespace: string, options: MonitoringTwoFactorOptions): Promise<MonitoringTwoFactorUser[]>;
    save(fileName: string, items: MonitoringTwoFactorUser[]): Promise<void>;
    getColumns(namespace: string): Promise<string[]>;
    saveColumns(namespace: string, columns: string[]): Promise<void>;
}
