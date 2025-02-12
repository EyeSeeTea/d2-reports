import { CountryCode } from "../entities/CountryCode";

export interface CountryCodeRepository {
    getCountryCodes(): Promise<CountryCode[]>;
}
