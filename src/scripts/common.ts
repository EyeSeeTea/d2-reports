import { execSync } from "child_process";

export function build(variant: string): void {
    Object.assign(process.env, { REACT_APP_REPORT_VARIANT: variant });
    const cmd = `yarn --silent build`;
    console.debug(`Run: ${cmd}`);
    execSync(cmd, { stdio: [0, 1, 2] });
}
