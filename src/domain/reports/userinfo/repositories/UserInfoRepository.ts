import { Id, PaginatedObjects } from "../../../../types/d2-api";
import { Config } from "../../../common/entities/Config";
import { Paging, Sorting } from "../../../common/entities/PaginatedObjects";
import { User } from "../../../common/entities/User";

export interface UserInfoRepository {
    getUserTwoFactorInfo(options: UserInfoRepositoryGetOptions): Promise<PaginatedObjects<User>>;
    save(filename: string, users: User[]): Promise<void>;
}

export interface UserInfoRepositoryGetOptions {
    config: Config;
    paging: Paging;
    sorting?: Sorting<User>;
}
