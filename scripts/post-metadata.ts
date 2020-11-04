import fs from "fs";
import { D2Api } from "d2-api/2.32";

export async function postMetadata(baseUrl: string, authString: string): Promise<void> {
    const [username, password] = authString.split(":", 2);
    console.debug({ baseUrl, auth: { username, password } });
    const api = new D2Api({ baseUrl, auth: { username, password } });
    const metadataJson = fs.readFileSync("dist/metadata.json", "utf8");
    const metadata = JSON.parse(metadataJson);
    const res = await api.metadata.post(metadata).getData();
    console.log(res);
}

const [dhis2Url, auth] = process.argv.slice(2);

if (!dhis2Url || !auth) {
    console.error("Usage: post-metadata https://@server.org user:password");
    process.exit(2);
}

postMetadata(dhis2Url, auth).catch(err => {
    console.error(err);
    process.exit(1);
});
