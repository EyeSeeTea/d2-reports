import { MetadataObject } from "../../../common/entities/MetadataObject";
import { User } from "../../../common/entities/User";
import { UserInfoRepository } from "../repositories/UserInfoRepository";

export class SaveUserInfoCsvUseCase {
    constructor(private userInfoRepository: UserInfoRepository) {}

    async execute(filename: string, users: User[]): Promise<void> {
        this.userInfoRepository.save(filename, users);
    }
}
