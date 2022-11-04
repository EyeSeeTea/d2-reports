import { PaginatedObjects } from "../../../../types/d2-api";
import { Sorting } from "../../../common/entities/PaginatedObjects";
import { User } from "../../../common/entities/User";

export interface UserInfoRepository {
    getUserTwoFactorInfo(options: UserInfoOptions): Promise<PaginatedObjects<User>>;
    save(filename: string, users: User[]): Promise<void>;
}

export interface UserInfoOptions {
    sorting: Sorting<User>;
}

export interface UserInfoRepositoryGetOptions {
    sorting: Sorting<User>;
}
