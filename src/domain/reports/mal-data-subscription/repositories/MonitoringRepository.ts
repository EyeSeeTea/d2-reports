import { Monitoring } from "../entities/Monitoring";

export interface MonitoringRepository {
    get(): Promise<Monitoring>;
    save(monitoring: Monitoring): Promise<void>;
}
