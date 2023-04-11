import fs from "fs";
import { D2Report } from "../types/d2-api";
import { execSync } from "child_process";

function run(cmd: string): void {
    console.debug(`Run: ${cmd}`);
    execSync(cmd, { stdio: [0, 1, 2] });
}

export async function buildMetadata(): Promise<void> {
    Object.assign(process.env, { REACT_APP_REPORT_VARIANT: "glass-submission" });
    run("yarn build-report");
    const htmlGlassDataSubmission = fs.readFileSync("dist/index.html", "utf8");

    const reports: Partial<D2Report>[] = [
        {
            id: "zdADlsGq9y0",
            name: "GLASS Data Submission Report",
            type: "HTML",
            cacheStrategy: "RESPECT_SYSTEM_SETTING",
            reportParams: {
                parentOrganisationUnit: false,
                reportingPeriod: false,
                organisationUnit: false,
                grandParentOrganisationUnit: false,
            },
            designContent: htmlGlassDataSubmission,
        },
    ];

    const metadata = {
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
