import { MonitoringValue } from "../entities/MalDataSubscriptionItem";

export interface MonitoringRepository {
    get(): Promise<MonitoringValue>;
    save(monitoring: MonitoringValue): Promise<void>;
}
