import { ArgumentParser } from "argparse";
import { execSync } from "child_process";
import "dotenv-flow/config";
import fs from "fs";
import { D2Report, D2SqlView } from "../types/d2-api";


function run(cmd: string): void {
    console.debug(`Run: ${cmd}`);
    execSync(cmd, { stdio: [0, 1, 2] });
}

export async function buildMetadata(_baseUrl: string, authString: string): Promise<void> {
    const [username, password] = authString.split(":", 2);
    if (!username || !password) return;

    const sqlDataApproval = fs.readFileSync("src/data/data-approval-status.sql", "utf8");

    const sqlViews: Partial<D2SqlView>[] = [
        {
            id: "Xm7gukLlaqe",
            name: "WMR Data Approval Status",
            cacheStrategy: "RESPECT_SYSTEM_SETTING",
            type: "QUERY",
            sqlQuery: sqlDataApproval,
            publicAccess: "--------",
            userAccesses: [
                {
                    access: "rwrw----",
                    userUid: "YdBcEIZpRHo",
                    displayName: "Ryan Williams",
                    id: "YdBcEIZpRHo",
                },
            ],
        },
    ];

    Object.assign(process.env, { REACT_APP_REPORT_VARIANT: "mal-wmr-approval-status" });
    run("yarn build-report");
    const htmlApproval = fs.readFileSync("dist/index.html", "utf8");

    const reports: Partial<D2Report>[] = [
        {
            id: "N0YiqPcEXn8",
            name: "WMR Data Approval Status",
            type: "HTML",
            cacheStrategy: "RESPECT_SYSTEM_SETTING",
            reportParams: {
                parentOrganisationUnit: false,
                reportingPeriod: false,
                organisationUnit: false,
                grandParentOrganisationUnit: false,
            },
            designContent: htmlApproval,
            publicAccess: "--------",
            userAccesses: [
                {
                    access: "rw------",
                    userUid: "YdBcEIZpRHo",
                    displayName: "Ryan Williams",
                    id: "YdBcEIZpRHo",
                },
            ],
        },
    ];

    const metadata = {
        sqlViews,
        reports,
    };

    const metadataPath = "dist/metadata.json";
    const metadataJson = JSON.stringify(metadata, null, 4);
    fs.writeFileSync(metadataPath, metadataJson);
    console.debug(`Done: ${metadataPath}`);
}

async function main() {
    const parser = new ArgumentParser({
        description: "Post metadata (report, sql views) to DHIS2 instance",
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
        await buildMetadata(args.url, args.user_auth);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

main();
