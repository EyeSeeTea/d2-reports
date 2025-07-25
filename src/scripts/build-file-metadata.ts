import { execSync } from "child_process";
import "dotenv-flow/config";
import fs from "fs";
import { D2Report, D2SqlView } from "../types/d2-api";

function run(cmd: string): void {
    console.debug(`Run: ${cmd}`);
    execSync(cmd, { stdio: [0, 1, 2] });
}

export async function buildMetadata(): Promise<void> {
    const sqlDataValues = fs.readFileSync(
        "src/data/reports/file-resources-monitoring/sql-views/file-resources-monitoring-datavalues.sql",
        "utf8"
    );
    const sqlEvents = fs.readFileSync(
        "src/data/reports/file-resources-monitoring/sql-views/file-resources-monitoring-events.sql",
        "utf8"
    );
    const sqlTracker = fs.readFileSync(
        "src/data/reports/file-resources-monitoring/sql-views/file-resources-monitoring-tracker.sql",
        "utf8"
    );
    const tracker_sql_description ="\n This view retrieves all tracked entity attributes that are of type FILE_RESOURCE or IMAGE and is Required due Dhis2 restrictions, this view only returns a list of uids no protected data.\n CREATE OR REPLACE VIEW public.valid_tracker_fileresources AS\n SELECT te.uid AS trackeruid, teav.value AS fileresourceuid FROM trackedentityattributevalue teav JOIN trackedentity te ON te.trackedentityid = teav.trackedentityid WHERE teav.trackedentityattributeid IN ( SELECT trackedentityattributeid FROM trackedentityattribute WHERE valuetype IN ('FILE_RESOURCE', 'IMAGE') )";

    const sqlViews: Partial<D2SqlView>[] = [
        {
            id: "gMg3im4cTYd",
            name: "file-resources-monitoring-datavalues",
            cacheStrategy: "RESPECT_SYSTEM_SETTING",
            type: "QUERY",
            sqlQuery: sqlDataValues,
            publicAccess: "--------",
        },
        {
            id: "Rl8JnitnM6X",
            name: "file-resources-monitoring-events",
            cacheStrategy: "RESPECT_SYSTEM_SETTING",
            type: "QUERY",
            sqlQuery: sqlEvents,
            publicAccess: "--------",
        },
        {
            id: "ah62hzAEyJF",
            name: "file-resources-monitoring-tracker",
            description: tracker_sql_description,
            cacheStrategy: "RESPECT_SYSTEM_SETTING",
            type: "QUERY",
            sqlQuery: sqlTracker,
            publicAccess: "--------",
        },
    ];

    Object.assign(process.env, { REACT_APP_REPORT_VARIANT: "file-resources-monitoring" });
    run("yarn build-report");
    const htmlFileResourceMonitoring = fs.readFileSync("dist/index.html", "utf8");

    const reports: Partial<D2Report>[] = [
        {
            id: "X97b3a7g896",
            name: "File Resource Monitoring",
            type: "HTML",
            cacheStrategy: "RESPECT_SYSTEM_SETTING",
            reportParams: {
                parentOrganisationUnit: false,
                reportingPeriod: false,
                organisationUnit: false,
                grandParentOrganisationUnit: false,
            },
            designContent: htmlFileResourceMonitoring,
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
