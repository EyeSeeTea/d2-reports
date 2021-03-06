import { ArgumentParser } from "argparse";
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

export async function buildMetadata(baseUrl: string, authString: string): Promise<void> {
    const [username, password] = authString.split(":", 2);
    const api = new D2Api({ baseUrl, auth: { username, password } });
    const metadata$ = api.metadata.get({
        dataSets: {
            fields: {
                id: true,
                name: true,
                formType: true,
                dataEntryForm: { htmlCode: true },
                sections: {
                    id: true,
                    name: true,
                    dataElements: {
                        id: true,
                        categoryCombo: { categoryOptionCombos: { id: true } },
                    },
                },
            },
            filter: {
                name: { $ilike: "NHWA" },
            },
        },
    });
    const { dataSets } = await metadata$.getData();

    const mapping = getMapping(dataSets);

    const constant: Partial<D2Constant> = {
        id: "Du5EM4vlYmp",
        code: "NHWA_COMMENTS",
        name: "NHWA Comments",
        description: JSON.stringify(mapping, null, 2),
        value: 0,
    };

    const sqlQueryTemplate = fs.readFileSync("src/data/data-values-with-comments.sql", "utf8");
    // eslint-disable-next-line no-template-curly-in-string
    const sqlQuery = sqlQueryTemplate.replace("__orderBy", "${orderByColumn} ${orderByDirection}");
    const sqlView: Partial<D2SqlView> = {
        id: "gCvQF1yeC9f",
        name: "NHWA Data Comments",
        cacheStrategy: "RESPECT_SYSTEM_SETTING",
        type: "QUERY",
        sqlQuery,
    };

    const designContent = fs.readFileSync("dist/index.html", "utf8");
    const report: Partial<D2Report> = {
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

    const metadata = {
        reports: [report],
        sqlViews: [sqlView],
        constants: [constant],
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
        required: true,
        help: "DHIS2 authentication",
        metavar: "USERNAME:PASSWORD",
    });
    parser.add_argument("url", { help: "DHIS2 base URL", metavar: "URL" });

    try {
        const args = parser.parse_args();
        await buildMetadata(args.url, args.user_auth);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

main();
