import { ArgumentParser } from "argparse";
import { execSync } from "child_process";
import "dotenv-flow/config";
import fs from "fs";
import _ from "lodash";
import { parse } from "node-html-parser";
import { D2Api, D2Constant, D2Report, D2SqlView, Id, Ref } from "../types/d2-api";

/* dataSetId.dataElementId.cocId */
type EntryId = string;

interface Mapping {
    order: Record<EntryId, number>;
    sections: Record<EntryId, string>;
    sectionNames: Record<string, string>;
}

interface DataSet {
    id: Id;
    name: string;
    formType: string;
    dataEntryForm: { htmlCode: string };
    sections: Array<{ id: Id; name: string; dataElements: DataElement[] }>;
}

interface DataElement {
    id: Id;
    categoryCombo: { categoryOptionCombos: Ref[] };
}
interface Entry {
    dataSetId: Id;
    dataElementId: Id;
    cocId: Id;
    index: number;
    section: { id: string; name: string };
}

function indexEntries<T>(entries: Entry[], fn: (entry: Entry) => T): Record<string, T> {
    return _(entries)
        .map(entry => {
            const key = [entry.dataSetId, entry.dataElementId, entry.cocId].join(".");
            return [key, fn(entry)] as [string, T];
        })
        .fromPairs()
        .value();
}

function getCustomFormEntries(dataSet: DataSet): Entry[] {
    const document = parse(dataSet.dataEntryForm.htmlCode);

    const tabs = document
        .querySelectorAll("#mod2_tabs ul li a")
        .map(aTag => ({ selector: aTag.getAttribute("href"), title: aTag.text }));

    const allEntries: Omit<Entry, "index">[] = _.flatMap(tabs, tab => {
        const inputs = document.querySelectorAll(`${tab.selector} input[name='entryfield']`);

        const entries = inputs.map(input => {
            // <input id="${dataElementId}-${cocId}-val" name="entryfield" ... />
            const [dataElementId, cocId, suffix] = (input.id || "").split("-", 3);
            if (suffix === "val" && dataElementId && cocId) {
                return {
                    dataSetId: dataSet.id,
                    section: { id: cleanString(tab.title), name: tab.title },
                    dataElementId,
                    cocId,
                };
            } else {
                return null;
            }
        });

        return _.compact(entries);
    });

    return enumerate(allEntries);
}

function getSectionEntries(dataSet: DataSet): Entry[] {
    const entries = _.flatMap(dataSet.sections, section => {
        return _.flatMap(section.dataElements, dataElement => {
            // Category option combos are unsorted. For now, this is only used in forms
            // containing YES/NO data elements, so it's not a problem.
            return dataElement.categoryCombo.categoryOptionCombos.map(coc => {
                return {
                    dataSetId: dataSet.id,
                    dataElementId: dataElement.id,
                    cocId: coc.id,
                    section: { id: cleanString(section.name), name: section.name },
                };
            });
        });
    });

    return enumerate(entries);
}

function getMapping(dataSets: DataSet[]): Mapping {
    const entries: Entry[] = _(dataSets)
        .flatMap(dataSet => {
            switch (dataSet.formType) {
                case "CUSTOM":
                    return getCustomFormEntries(dataSet);
                case "SECTION":
                    return getSectionEntries(dataSet);
                default:
                    console.error(`Form type not supported: ${dataSet.formType}`);
                    return [];
            }
        })
        .value();

    const order = indexEntries(entries, entry => entry.index);
    const indexedSections = indexEntries(entries, entry => entry.section);
    const sections = _.mapValues(indexedSections, section => section.id);
    const sectionNames = _(indexedSections)
        .values()
        .map(section => [section.id, section.name] as [string, string])
        .fromPairs()
        .value();

    return { order, sections, sectionNames };
}

function run(cmd: string): void {
    console.debug(`Run: ${cmd}`);
    execSync(cmd, { stdio: [0, 1, 2] });
}

export async function buildMetadata(): Promise<void> {

    Object.assign(process.env, { REACT_APP_REPORT_VARIANT: "visualizations" });
    run("yarn build-report");
    const htmlQuality = fs.readFileSync("dist/index.html", "utf8");

    const reports: Partial<D2Report>[] = [
        {
            id: "zrI0NTs9PMd",
            name: "Hidden visualizations",
            type: "HTML",
            cacheStrategy: "RESPECT_SYSTEM_SETTING",
            reportParams: {
                parentOrganisationUnit: false,
                reportingPeriod: false,
                organisationUnit: false,
                grandParentOrganisationUnit: false,
            },
            designContent: htmlQuality,
            publicAccess: "--------",
            userGroupAccesses: [
                {
                    access: "r-------",
                    userGroupUid: "UfhhwZK73Lg",
                    displayName: "WIDP IT team",
                    id: "UfhhwZK73Lg",
                },
            ],
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

function cleanString(s: string): string {
    return s.replace(/[^\w]*/g, "");
}

function enumerate<T>(objs: Array<T>): Array<T & { index: number }> {
    return objs.map((obj, index) => ({ ...obj, index }));
}

async function main() {
    const parser = new ArgumentParser({
        description: "Post metadata (report, sql views) to DHIS2 instance",
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

    try {
        const args = parser.parse_args();
        await buildMetadata();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

main();
