                                                                                                                                                                                                                                                                                                                                                   import { Config } from "../../../domain/common/entities/Config";import { User } from "../../../domain/common/entities/User";

export interface UserInfoViewModel {
    id: string;
    name: string;
    username: string;
    externalAuth: string;
    disabled: string;
    email: string;
    twoFA: string;
}

export function getUserInfolViews(items: User[]): UserInfoViewModel[] {
    return items.map(item => {
        return {
            name: item.name,
            username: item.username,
            externalAuth: String(item.externalAuth),
            disabled: String(item.disabled),
            email: item.email,
            twoFA: String(item.twoFA(),
            id: item.id,
        };
    });
}
