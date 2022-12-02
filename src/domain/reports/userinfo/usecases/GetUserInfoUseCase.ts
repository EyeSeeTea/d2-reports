import { PaginatedObjects } from "../../../common/entities/PaginatedObjects";
import { User } from "../../../common/entities/User";
import { UserInfoRepository, UserInfoRepositoryGetOptions } from "../repositories/UserInfoRepository";

type GetUserUseCaseOptions = UserInfoRepositoryGetOptions;
export class GetUserInfoUseCase {
    constructor(private userInfoRepository: UserInfoRepository) {}

    execute(options: GetUserUseCaseOptions): Promise<PaginatedObjects<User>> {
        // FUTURE: Return a Future-like instead, to allow better error handling and cancellation.
        return this.userInfoRepository.getUserTwoFactorInfo(options);
    }
}
