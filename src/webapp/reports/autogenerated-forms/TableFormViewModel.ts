import _ from "lodash";
import { DataForm } from "../../../domain/common/entities/DataForm";
import { DataElement } from "../../../domain/common/entities/DataElement";

export interface TableFormViewModel {
    sections: SectionTable[];
}

export interface SectionTable {
    id: string;
    name: string;
    columns: Column[];
    rows: Row[];
}

interface SubSection {
    name: string;
    dataElements: DataElement[];
}

type Column = { name: string };

interface Row {
    name: string;
    items: Array<{ column: Column; dataElement: DataElement | undefined }>;
}

const separator = " - ";

export class TableFormViewModelM {
    static get(dataForm: DataForm): TableFormViewModel {
        const sections = dataForm.sections.map((section): SectionTable => {
            const subsections = _(section.dataElements)
                .groupBy(dataElement => _(dataElement.name).split(separator).initial().join(separator))
                .toPairs()
                .map(
                    ([groupName, dataElementsForGroup]): SubSection => ({
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
        });

        return { sections };
    }
}
