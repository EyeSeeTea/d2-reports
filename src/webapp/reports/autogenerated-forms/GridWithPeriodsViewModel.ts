import _ from "lodash";
import { Section, SectionWithPeriods, Texts } from "../../../domain/common/entities/DataForm";
import { DataElement } from "../../../domain/common/entities/DataElement";

interface GridWithPeriodsI {
    id: string;
    name: string;
    rows: Row[];
    periods: string[];
    toggle: Section["toggle"];
    texts: Texts;
}

interface DataElementRow {
    type: "dataElement";
    dataElement: DataElement;
}

type Row = { type: "group"; name: string; rows: DataElementRow[] } | DataElementRow;

const separator = " - ";

export class GridWithPeriodsViewModel {
    static get(section: SectionWithPeriods): GridWithPeriodsI {
        const rows = _(section.dataElements)
            .groupBy(dataElement => _(dataElement.name).split(separator).initial().join(separator))
            .toPairs()
            .map(([groupName, dataElementsForGroup]): Row => {
                if (dataElementsForGroup.length === 1) {
                    return {
                        type: "dataElement",
                        dataElement: dataElementsForGroup[0],
                    };
                } else {
                    return {
                        type: "group",
                        name: groupName,
                        rows: dataElementsForGroup.map(de => ({
                            type: "dataElement",
                            dataElement: {
                                ...de,
                                name: _(de.name).split(separator).last() || "-",
                            },
                        })),
                    };
                }
            })
            .value();

        return {
            id: section.id,
            name: section.name,
            rows: rows,
            periods: section.periods,
            toggle: section.toggle,
            texts: section.texts,
        };
    }
}
