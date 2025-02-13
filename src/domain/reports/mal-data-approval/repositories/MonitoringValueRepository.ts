import { MonitoringValue } from "../entities/MonitoringValue";

export interface MonitoringValueRepository {
    get(namespace: string): Promise<MonitoringValue | undefined>;
    save(namespace: string, monitoring: MonitoringValue): Promise<void>;
}
