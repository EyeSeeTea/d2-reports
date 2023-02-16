import _ from "lodash";
import { Section } from "../../../domain/common/entities/DataForm";
import { DataElement } from "../../../domain/common/entities/DataElement";

export interface GridFormViewModel {
    sections: SectionGrid[];
}

export interface SectionGrid {
    id: string;
    name: string;
    columns: Column[];
    rows: Row[];
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

export class TableFormViewModelM {
    static get(section: Section): SectionGrid {
        const subsections = _(section.dataElements)
            .groupBy(dataElement => _(dataElement.name).split(separator).initial().join(separator))
            .toPairs()
            .map(
                ([groupName, dataElementsForGroup]): SubSectionGrid => ({
                    name: groupName,
                    dataElements: dataElementsForGroup.map(de => ({
                        ...de,
                        name: _(de.name).split(separator).last() || "-",
                    })),
                })
            )
            .value();

        const columns: Column[] = _(subsections)
            .flatMap(subsection => subsection.dataElements)
            .uniqBy(de => de.name)
            .map(de => ({ name: de.name }))
            .value();

        const rows = subsections.map(subsection => {
            const items = columns.map(column => {
                const dataElement = subsection.dataElements.find(de => de.name === column.name);
                return { column, dataElement };
            });

            return { name: subsection.name, items: items };
        });

        return {
            id: section.id,
            name: section.name,
            columns: columns,
            rows: rows,
        };
    }
}
