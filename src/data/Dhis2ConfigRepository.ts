import { ConfigRepository } from "../domain/repositories/ConfigRepository";
import { Config } from "../domain/entities/Config";
import { D2Api } from "../types/d2-api";
import { keyById } from "../domain/entities/Base";
import { User } from "../domain/entities/User";

export class Dhis2ConfigRepository implements ConfigRepository {
    constructor(private api: D2Api) {}

    async get(): Promise<Config> {
        const toName = { $fn: { name: "rename", to: "name" } } as const;
        const res$ = this.api.metadata.get({
            dataSets: {
                fields: { id: true, displayName: toName },
                filter: { name: { ilike: "NHWA Module" } },
            },
        });
        const { dataSets } = await res$.getData();

        const d2User = await this.api.currentUser
            .get({
                fields: {
                    id: true,
                    displayName: true,
                    organisationUnits: {
                        id: true,
                        displayName: toName,
                        path: true,
                        level: true,
                    },
                    userCredentials: {
                        username: true,
                        userRoles: { id: true, name: true },
                    },
                },
            })
            .getData();

        const currentUser: User = {
            id: d2User.id,
            name: d2User.displayName,
            orgUnits: d2User.organisationUnits,
            ...d2User.userCredentials,
        };

        return {
            dataSets: keyById(dataSets),
            currentUser,
        };
    }
}
