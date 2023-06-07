import _ from "lodash";
import { Section, Texts } from "../../../domain/common/entities/DataForm";
import { DataElement } from "../../../domain/common/entities/DataElement";

export interface Grid {
    id: string;
    name: string;
    columns: Column[];
    rows: Row[];
    toggle: Section["toggle"];
    useIndexes: boolean;
    texts: Texts;
}

interface SubSectionGrid {
    name: string;
    dataElements: DataElement[];
}

interface Column {
    name: string;
}

interface Row {
    name: string;
    items: Array<{ column: Column; dataElement: DataElement | undefined }>;
}

const separator = " - ";

export class GridWithCombosViewModel {
    static get(section: Section): Grid {
        const dataElements = getDataElementsWithIndexProccessing(section);

        const subsections = _(dataElements)
            .flatMap(dataElement => {
                const cocNames = dataElement.categoryCombos.categoryOptionCombos.map(coc => coc.name);

                return cocNames.flatMap(coc => ({
                    ...dataElement,
                    cocId: dataElement.categoryCombos.categoryOptionCombos.find(c => c.name === coc)?.id || "cocId",
                    name: `${coc} - ${_(dataElement.name).split(separator).last()}`,
                }));
            })
            .groupBy(dataElement => getSubsectionName(dataElement))
            .toPairs()
            .map(
                ([groupName, dataElementsForGroup]): SubSectionGrid => ({
                    name: groupName,
                    dataElements: dataElementsForGroup.map(dataElement => ({
                        ...dataElement,
                        name: _(dataElement.name).split(separator).last() || "-",
                    })),
                })
            )
            .value();

        const columns: Column[] = _(subsections)
            .flatMap(subsection => subsection.dataElements)
            .uniqBy(de => de.name)
            .map(de => ({ name: de.name }))
            .value();

        const rows = _.orderBy(
            subsections.map(subsection => {
                const items = columns.map(column => {
                    const dataElement = subsection.dataElements.find(de => de.name === column.name);
                    return { column, dataElement };
                });

                return { name: subsection.name, items: items };
            }),
            [section.id === "ldsKVeQ7XBe" ? "" : "name"]
        );

        const useIndexes =
            _(rows).every(row => Boolean(row.name.match(/\(\d+\)$/))) &&
            _(rows)
                .groupBy(row => row.name.replace(/\s*\(\d+\)$/, ""))
                .size() === 1;

        return {
            id: section.id,
            name: section.name,
            columns: columns,
            rows: rows,
            toggle: section.toggle,
            texts: section.texts,
            useIndexes: useIndexes,
        };
    }
}

function getDataElementsWithIndexProccessing(section: Section) {
    return section.dataElements.map((dataElement): typeof dataElement => {
        // "MAL - Compound name (1)" -> "MAL (1) - Compound name"
        const index = dataElement.name.match(/\((\d+)\)$/)?.[1];

        if (!index) {
            return dataElement;
        } else {
            const parts = dataElement.name.split(separator);
            const initial = _.initial(parts).join(separator);
            const last = _.last(parts);
            if (!last) return dataElement;
            const lastWithoutIndex = last.replace(/\s*\(\d+\)$/, "");
            const newName = `${initial} (${index}) - ${lastWithoutIndex}`;
            return { ...dataElement, name: newName };
        }
    });
}

function getSubsectionName(dataElement: DataElement): string {
    // Remove index from enumerated data elements (example: `Chemical name (1)` -> `Chemical name`)
    // so they are grouped with no need to edit each name in the metadata.
    return _(dataElement.name).split(separator).initial().join(separator);
}
