import { ArgumentParser } from "argparse";
import fs from "fs";
import { D2Api } from "../types/d2-api";

export async function postMetadata(baseUrl: string, authString: string): Promise<void> {
    const [username, password] = authString.split(":", 2);
    if (!username || !password) return;

    const api = new D2Api({ baseUrl, auth: { username, password } });
    const metadataJson = fs.readFileSync("dist/metadata.json", "utf8");
    const metadata = JSON.parse(metadataJson);
    const res = await api.metadata.post(metadata).getData();
    console.debug(res);
}

async function main() {
    const parser = new ArgumentParser({
        description: "Post metadata (report, sql views) to DHIS2 instance",
    });

    parser.add_argument("-u", "--user-auth", {
        required: true,
        help: "DHIS2 authentication",
        metavar: "USERNAME:PASSWORD",
    });
    parser.add_argument("url", { help: "DHIS2 base URL", metavar: "URL" });

    try {
        const args = parser.parse_args();
        postMetadata(args.url, args.user_auth);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

main();
