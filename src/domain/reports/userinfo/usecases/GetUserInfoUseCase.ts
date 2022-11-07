import { PaginatedObjects } from "../../../common/entities/PaginatedObjects";
import { User } from "../../../common/entities/User";
import { UserInfoRepository } from "../repositories/UserInfoRepository";

export class GetUserInfoUseCase {
    constructor(private userInfoRepository: UserInfoRepository) {}

    execute(): Promise<PaginatedObjects<User>> {
        // FUTURE: Return a Future-like instead, to allow better error handling and cancellation.
        return this.userInfoRepository.getUserTwoFactorInfo();
    }
}
