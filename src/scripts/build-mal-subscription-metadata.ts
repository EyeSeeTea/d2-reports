import { execSync } from "child_process";
import "dotenv-flow/config";
import fs from "fs";
import { D2Report, D2SqlView } from "../types/d2-api";

function run(cmd: string): void {
    console.debug(`Run: ${cmd}`);
    execSync(cmd, { stdio: [0, 1, 2] });
}

export async function buildMetadata(): Promise<void> {
    const sqlMALDataSubscription = fs.readFileSync(
        "src/data/reports/mal-data-subscription/sql-views/mal-approval-dataelements.sql",
        "utf8"
    );

    const sqlViews: Partial<D2SqlView>[] = [
        {
            id: "lHEoGun844q",
            name: "MAL - Approval Dataelements",
            cacheStrategy: "RESPECT_SYSTEM_SETTING",
            type: "QUERY",
            sqlQuery: sqlMALDataSubscription,
            publicAccess: "--------",
        },
    ];

    Object.assign(process.env, { REACT_APP_REPORT_VARIANT: "mal-subscription-status" });
    run("yarn build-report");
    const htmlMalDataSubscription = fs.readFileSync("dist/index.html", "utf8");

    const reports: Partial<D2Report>[] = [
        {
            id: "bcB6fNYRQFQ",
            name: "Malaria Data Subscription Report",
            type: "HTML",
            cacheStrategy: "RESPECT_SYSTEM_SETTING",
            reportParams: {
                parentOrganisationUnit: false,
                reportingPeriod: false,
                organisationUnit: false,
                grandParentOrganisationUnit: false,
            },
            designContent: htmlMalDataSubscription,
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
    try {
        await buildMetadata();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

main();
