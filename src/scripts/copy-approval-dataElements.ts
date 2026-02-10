import { ArgumentParser } from "argparse";
import { WmrFormD2Repository } from "../data/wmr-form/WmrFormD2Repository";
import { WmrQuestionD2Repository } from "../data/wmr-form/WmrQuestionD2Repository";
import { GetMissingQuestionsUseCase } from "../domain/wmr-form/usecases/GetMissingQuestionsUseCase";
import { D2Api } from "../types/d2-api";

/*
npx tsx src/scripts/copy-approval-dataElements.ts --url "http://localhost:8080" \
-u "username:password" \
--dataSetOrigin=dataset-id-origin \
--dataSetTarget=dataset-id-target \
--persist=false \
--export=true
*/

async function main() {
    const parser = new ArgumentParser({
        description: "Copy approval dataElements from one dataSet to another",
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

    parser.add_argument("--dataSetOrigin", {
        help: "dataSet origin",
        required: true,
    });

    parser.add_argument("--dataSetTarget", {
        help: "dataSet target",
        required: true,
    });

    parser.add_argument("--persist", {
        help: "persist changes",
        default: false,
        metavar: "true|false",
        type: parseBoolean,
    });

    parser.add_argument("--export", {
        help: "export metadata json file to disk",
        default: true,
        metavar: "true|false",
        type: parseBoolean,
    });

    try {
        const args = parser.parse_args();
        const [username, password] = args.user_auth.split(":", 2);
        if (!username || !password) return;

        const api = new D2Api({ baseUrl: args.url, auth: { username, password } });

        const wmrFormRepository = new WmrFormD2Repository(api);
        const wmrQuestionRepository = new WmrQuestionD2Repository(api);
        const usecase = new GetMissingQuestionsUseCase(wmrFormRepository, wmrQuestionRepository);
        await usecase.execute({
            persist: args.persist,
            export: args.export,
            originFormId: args.dataSetOrigin,
            targetFormId: args.dataSetTarget,
            suffix: "-APVD",
        });

        console.debug("Finished");
        if (!args.persist) {
            console.debug("Pass --persist to save changes in DHIS");
        }
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

main();

function parseBoolean(value: string): boolean {
    if (value === "true") return true;
    if (value === "false") return false;
    throw new Error(`Invalid value for --persist: ${value}`);
}
