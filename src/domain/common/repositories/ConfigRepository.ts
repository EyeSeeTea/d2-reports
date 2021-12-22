import { Config } from "../entities/Config";

export interface ConfigRepository {
    get(): Promise<Config>;
    getReportColumns(report: string): Promise<string[]>;
    saveReportColumns(report: string, columns: string[]): Promise<void>;
}
