import { PaginatedObjects } from "../../../../types/d2-api";
import { User } from "../../../common/entities/User";

export interface UserInfoRepository {
    getUserTwoFactorInfo(): Promise<PaginatedObjects<User>>;
    save(filename: string, users: User[]): Promise<void>;
}
