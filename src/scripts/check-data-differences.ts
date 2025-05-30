import { D2Api } from "../types/d2-api";
import { ArgumentParser } from "argparse";
import "dotenv-flow/config";
import { MAL_WMR_FORM_CODE } from "../data/reports/mal-data-approval/MalDataApprovalDefaultRepository";
import { DataValuesD2Repository } from "../data/common/DataValuesD2Repository";
import { DataSetD2Repository } from "../data/common/DataSetD2Repository";
import { getMetadataByIdentifiableToken } from "../data/common/utils/getMetadataByIdentifiableToken";
import { CodedRef } from "../domain/common/entities/Ref";
import { WmrDiffReport } from "../domain/reports/WmrDiffReport";

const ANGOLA_ORG_UNIT_NAME = "Republic of Angola";
const YEAR = "2024";

type DataDifferencesOptions = {
    baseUrl: string;
    authString: string;
    orgUnit?: string;
    year?: string;
};

export async function checkMalDataValuesDiff(options: DataDifferencesOptions): Promise<void> {
    const { baseUrl, authString, orgUnit: ouOption, year: yearOption } = options;
    const [username, password] = authString.split(":", 2);
    if (!username || !password) return;

    const api = new D2Api({ baseUrl, auth: { username, password } });
    const dataValueRepository = new DataValuesD2Repository(api);
    const dataSetRepository = new DataSetD2Repository(api);

    const { dataSet, orgUnit } = await getMalWMRMetadata(api, ouOption);
    const period = yearOption ?? YEAR;
    const dataElementsWithValues = await new WmrDiffReport(dataValueRepository, dataSetRepository).getDiff(
        dataSet.id,
        orgUnit.id,
        period
    );

    const result = dataElementsWithValues.map(dataElementWithValues => ({
        dataElement: dataElementWithValues.dataElement,
        orgUnit: dataElementWithValues.orgUnitUid,
        period: dataElementWithValues.period,
    }));

    if (result.length === 0) console.debug("No differences found");
    else
        console.debug(
            `${result.length} differences found in ${dataSet.name} for period ${period} in ${orgUnit.name} organisation unit: \n`,
            result
                .map(
                    (item, index) =>
                        `${index + 1}. Data element: ${item.dataElement}, Org Unit: ${item.orgUnit}, Period: ${
                            item.period
                        }`
                )
                .join("\n")
        );
}

async function getMalWMRMetadata(api: D2Api, ouOption?: string): Promise<{ dataSet: CodedRef; orgUnit: CodedRef }> {
    const dataSet = await getMetadataByIdentifiableToken({
        api: api,
        metadataType: "dataSets",
        token: MAL_WMR_FORM_CODE,
    });
    const orgUnit = await getMetadataByIdentifiableToken({
        api: api,
        metadataType: "organisationUnits",
        token: ouOption ?? ANGOLA_ORG_UNIT_NAME,
    });

    return { dataSet: dataSet, orgUnit: orgUnit };
}

async function main() {
    const parser = new ArgumentParser({
        description: `Check difference between MAL WMR apvd and unapvd data sets`,
    });

    parser.add_argument("-u", "--user-auth", {
        help: "DHIS2 authentication",
        metavar: "USERNAME:PASSWORD",
        default: process.env.REACT_APP_DHIS2_AUTH,
    });

    parser.add_argument("--url", {
        help: "DHIS2 base URL",
        metavar: "URL",
        default: process.env.REACT_APP_DHIS2_BASE_URL,
    });

    parser.add_argument("-ou", "--org-unit", {
        help: "Organisation unit identifier",
        metavar: "ORG_UNIT",
        default: ANGOLA_ORG_UNIT_NAME,
    });

    parser.add_argument("-y", "--year", {
        help: "Year to check differences for",
        metavar: "YEAR",
        default: YEAR,
    });

    try {
        const args = parser.parse_args();
        await checkMalDataValuesDiff({
            baseUrl: args.url,
            authString: args.user_auth,
            orgUnit: args.org_unit,
            year: args.year,
        });
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

main();
