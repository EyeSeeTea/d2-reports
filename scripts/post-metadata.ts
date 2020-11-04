import fs from "fs";
import { D2Api } from "d2-api/2.32";
import { ArgumentParser } from "argparse";

export async function postMetadata(baseUrl: string, authString: string): Promise<void> {
    const [username, password] = authString.split(":", 2);
    console.debug({ baseUrl, auth: { username, password } });
    const api = new D2Api({ baseUrl, auth: { username, password } });
    const metadataJson = fs.readFileSync("dist/metadata.json", "utf8");
    const metadata = JSON.parse(metadataJson);
    const res = await api.metadata.post(metadata).getData();
    console.log(res);
}

async function main() {
    const parser = new ArgumentParser({
        description: "Argparse example",
    });

    parser.add_argument("-u", "--user-auth", {
        required: true,
        help: "Use authentication",
        metavar: "USERNAME:PASSWORD",
    });
    parser.add_argument("url", { help: "DHIS2 base URL", metavar: "URL" });

    const args = parser.parse_args();

    try {
        postMetadata(args.url, args.user_auth);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

main();
