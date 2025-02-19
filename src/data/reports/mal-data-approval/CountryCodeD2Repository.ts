import { D2Api } from "@eyeseetea/d2-api/2.34";
import { CountryCodeRepository } from "../../../domain/reports/mal-data-approval/repositories/CountryCodeRepository";
import { CountryCode } from "../../../domain/reports/mal-data-approval/entities/CountryCode";

export class CountryCodeD2Repository implements CountryCodeRepository {
    constructor(private api: D2Api) {}

    async getCountryCodes(): Promise<CountryCode[]> {
        const { objects: countryCodes } = await this.api.models.organisationUnits
            .get({ fields: { id: true, code: true }, filter: { level: { eq: "3" } } })
            .getData();

        return countryCodes;
    }
}
