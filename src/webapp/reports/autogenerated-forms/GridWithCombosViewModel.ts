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
    parentColumns: ParentColumn[];
}

interface SubSectionGrid {
    name: string;
    dataElements: DataElement[];
}

interface Column {
    name: string;
    deName?: string;
    cocName?: string;
}

interface Row {
    name: string;
    items: Array<{ column: Column; dataElement: DataElement | undefined }>;
}

type ParentColumn = {
    name: string;
    colSpan: number;
};

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
                    fullName: dataElement.name,
                    cocName: coc,
                }));
            })
            .groupBy(dataElement => dataElement.cocName)
            .toPairs()
            .map(([groupName, dataElementsForGroup]): SubSectionGrid => {
                return {
                    name: groupName,
                    dataElements: dataElementsForGroup.map(dataElement => ({
                        ...dataElement,
                        name: dataElement.fullName,
                    })),
                };
            })
            .value();

        const columns: Column[] = _(subsections)
            .flatMap(subsection => subsection.dataElements)
            .uniqBy(de => de.name)
            .map(de => {
                return {
                    name: de.name,
                    deName: _(de.name).split(separator).first() || "",
                    cocName: _(de.name).split(separator).last() || "",
                };
            })
            .value();

        const parentColumns = _(columns)
            .map(c => (c.deName && c.cocName ? c.deName : undefined))
            .compact()
            .groupBy()
            .map((values, name) => ({ name, colSpan: values.length }))
            .value();

        const rows = _.orderBy(
            subsections.map(subsection => {
                const items = columns.map(column => {
                    const dataElement = subsection.dataElements.find(de => de.name === column.name);
                    return { column, dataElement };
                });

                return { name: subsection.name, items: items };
            }),
            [section.sortRowsBy ? section.sortRowsBy : ""]
        );

        const useIndexes =
            _(rows).every(row => Boolean(row.name.match(/\(\d+\)$/))) &&
            _(rows)
                .groupBy(row => row.name.replace(/\s*\(\d+\)$/, ""))
                .size() === 1;

            console.log('Rows', rows)

        return {
            id: section.id,
            name: section.name,
            columns: columns,
            rows: rows,
            toggle: section.toggle,
            texts: section.texts,
            useIndexes: useIndexes,
            parentColumns: parentColumns.length === columns.length ? [] : parentColumns,
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
