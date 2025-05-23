import { D2Api, Id } from "../types/d2-api";
import { ArgumentParser } from "argparse";
import "dotenv-flow/config";
import {
    MAL_WMR_FORM_CODE,
    MalDataApprovalDefaultRepository,
} from "../data/reports/mal-data-approval/MalDataApprovalDefaultRepository";
import { UpdateMalApprovalStatusUseCase } from "../domain/reports/mal-data-approval/usecases/UpdateMalApprovalStatusUseCase";
import { DataValuesD2Repository } from "../data/common/DataValuesD2Repository";
import { DataSetD2Repository } from "../data/common/DataSetD2Repository";
import { getMetadataByIdentifiableToken } from "../data/common/utils/getMetadataByIdentifiableToken";
import _ from "lodash";
import { MalDataApprovalItemIdentifier } from "../domain/reports/mal-data-approval/entities/MalDataApprovalItem";
import { CodedRef } from "../domain/common/entities/Ref";

const START_YEAR = 2000;
const END_YEAR = new Date().getFullYear();

export async function approveMalDataValues(baseUrl: string, authString: string): Promise<void> {
    const [username, password] = authString.split(":", 2);
    if (!username || !password) return;

    const api = new D2Api({ baseUrl, auth: { username, password } });
    const approvalRepository = new MalDataApprovalDefaultRepository(api);
    const dataValueRepository = new DataValuesD2Repository(api);
    const dataSetRepository = new DataSetD2Repository(api);

    const { dataSet, orgUnit } = await getMalWMRMetadata(api);
    const updateMalApprovalStatusUseCase = new UpdateMalApprovalStatusUseCase(
        approvalRepository,
        dataValueRepository,
        dataSetRepository
    );

    const malDataApprovalItems = await buildMalApprovalItems(dataValueRepository, dataSet.id, orgUnit.id);

    if (malDataApprovalItems.length === 0) {
        console.debug(`No data values to approve in ${dataSet.name} dataset.`);
        return;
    }
    await updateMalApprovalStatusUseCase.execute(malDataApprovalItems, "duplicate");

    console.debug(`Successfully approved ${malDataApprovalItems.length} data values in ${dataSet.name} dataset.`);
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
        token: "WHO-HQ",
    });

    return { dataSet: dataSet, orgUnit: orgUnit };
}

async function buildMalApprovalItems(
    dataValueRepository: DataValuesD2Repository,
    dataSetId: Id,
    orgUnitId: Id
): Promise<MalDataApprovalItemIdentifier[]> {
    const periods = _.range(START_YEAR, END_YEAR).map(year => year.toString());
    const dataValuesToApprove = await dataValueRepository.get({
        dataSetIds: [dataSetId],
        orgUnitIds: [orgUnitId],
        periods: periods,
        children: true,
    });

    return dataValuesToApprove.map(dataValue => ({
        dataSet: dataSetId,
        orgUnit: dataValue.orgUnit,
        period: dataValue.period,
        orgUnitCode: undefined,
        workflow: undefined,
    }));
}

async function main() {
    const parser = new ArgumentParser({
        description: `Approve all data values in MAL WMR Form from ${START_YEAR} to ${END_YEAR}`,
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
        await approveMalDataValues(args.url, args.user_auth);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

main();
