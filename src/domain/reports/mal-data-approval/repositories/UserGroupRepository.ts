export interface UserGroupRepository {
    getUserGroupByCode(code: string): Promise<UserGroup>;
}

type UserGroup = string;
