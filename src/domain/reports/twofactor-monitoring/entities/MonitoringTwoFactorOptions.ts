import { Config } from "../../../common/entities/Config";
import { Paging, Sorting } from "../../../common/entities/PaginatedObjects";
import { MonitoringTwoFactorUser } from "./MonitoringTwoFactorUser";

export interface MonitoringTwoFactorOptions {
    config: Config;
    paging: Paging;
    sorting: Sorting<MonitoringTwoFactorUser>;
    disabled: boolean;
    usernameQuery: string;
    uidQuery: string;
}
