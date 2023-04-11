import { execSync } from "child_process";
import "dotenv-flow/config";

function run(cmd: string): void {
    console.debug(`Run: ${cmd}`);
    execSync(cmd, { stdio: [0, 1, 2] });
}

export async function build(): Promise<void> {
    const report = process.env.REACT_APP_REPORT_VARIANT;
    console.debug(`Report type: ${report}`);
    if (process.env.REACT_APP_REPORT_VARIANT === "mal-approval-status") {
        console.debug("Building DHIS2 MAL Approval Report");
        run("yarn mal-build");
    }
    if (process.env.REACT_APP_REPORT_VARIANT === "glass-submission") {
        console.debug("Building DHIS2 GLASS Submission Report");
        run("yarn glass-build");
    } else {
        console.debug("Building DHIS2 Reports");
        run("yarn build-default");
    }
}

async function main() {
    try {
        await build();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

main();
