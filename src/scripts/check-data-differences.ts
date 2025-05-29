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

export async function checkMalDataValuesDiff(baseUrl: string, authString: string): Promise<void> {
    const [username, password] = authString.split(":", 2);
    if (!username || !password) return;

    const api = new D2Api({ baseUrl, auth: { username, password } });
    const dataValueRepository = new DataValuesD2Repository(api);
    const dataSetRepository = new DataSetD2Repository(api);

    const { dataSet, orgUnit } = await getMalWMRMetadata(api);
    const dataElementsWithValues = await new WmrDiffReport(dataValueRepository, dataSetRepository).getDiff(
        dataSet.id,
        orgUnit.id,
        YEAR
    );

    const result = dataElementsWithValues.map(dataElementWithValues => ({
        dataElement: dataElementWithValues.dataElement,
        orgUnit: dataElementWithValues.orgUnitUid,
        period: dataElementWithValues.period,
    }));

    if (result.length === 0) console.debug("No differences found");
    else
        console.debug(
            `${result.length} differences found in ${dataSet.name} for period ${YEAR} in ${orgUnit.name} organisation unit: \n`,
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

async function getMalWMRMetadata(api: D2Api): Promise<{ dataSet: CodedRef; orgUnit: CodedRef }> {
    const dataSet = await getMetadataByIdentifiableToken({
        api: api,
        metadataType: "dataSets",
        token: MAL_WMR_FORM_CODE,
    });
    const orgUnit = await getMetadataByIdentifiableToken({
        api: api,
        metadataType: "organisationUnits",
        token: ANGOLA_ORG_UNIT_NAME,
    });

    return { dataSet: dataSet, orgUnit: orgUnit };
}

async function main() {
    const parser = new ArgumentParser({
        description: `Check difference between MAL WMR apvd and unapvd data sets in ${ANGOLA_ORG_UNIT_NAME} for the year ${YEAR}`,
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

    try {
        const args = parser.parse_args();
        await checkMalDataValuesDiff(args.url, args.user_auth);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

main();
