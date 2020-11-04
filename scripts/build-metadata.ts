import fs from "fs";

export async function buildMetadata(): Promise<void> {
    const metadataPath = "dist/metadata.json";

    const sqlQueryTemplate = fs.readFileSync("src/data/data-values-with-comments.sql", "utf8");
    const sqlQuery = sqlQueryTemplate.replace("__orderBy", "${orderByColumn} ${orderByDirection}");
    const sqlView = {
        id: "gCvQF1yeC9f",
        name: "NHWA Data Comments",
        cacheStrategy: "RESPECT_SYSTEM_SETTING",
        type: "QUERY",
        sqlQuery,
    };

    const designContent = fs.readFileSync("dist/index.html", "utf8");
    const report = {
        id: "G2pzXQgTMgw",
        name: "NHWA Comments",
        type: "HTML",
        cacheStrategy: "RESPECT_SYSTEM_SETTING",
        reportParams: {
            parentOrganisationUnit: false,
            reportingPeriod: false,
            organisationUnit: false,
            grandParentOrganisationUnit: false,
        },
        designContent,
    };

    const metadata = { reports: [report], sqlViews: [sqlView] };

    const metadataJson = JSON.stringify(metadata, null, 4);
    fs.writeFileSync(metadataPath, metadataJson);
    console.debug(`Done: ${metadataPath}`);
}

buildMetadata().catch(err => {
    console.error(err);
    process.exit(1);
});
