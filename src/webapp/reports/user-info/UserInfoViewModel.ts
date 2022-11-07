import { Config } from "../../../domain/common/entities/Config";
import { User } from "../../../domain/common/entities/User";

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
            id: item.id,
            name: item.name,
            username: item.username,
            externalAuth: item.externalAuth ? String(item.externalAuth) : "-",
            disabled: item.disabled ? String(item.disabled) : "-",
            email: item.email ? String(item.email) : "-",
            twoFA: item.twoFA ? String(item.twoFA) : "-",
        };
    });
}
