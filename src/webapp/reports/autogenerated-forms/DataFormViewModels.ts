import _ from "lodash";
import { DataForm } from "../../../domain/common/entities/DataForm";
import { DataElement } from "../../../domain/common/entities/DataElement";

export interface SectionTable {
    id: string;
    name: string;
    columns: Column[];
    rows: Row[];
}

type Column = { name: string };

interface Row {
    name: string;
    items: Array<{ column: Column; dataElement: DataElement | undefined }>;
}

export class SectionTableViewModel {
    static getSectionsFromDataForm(dataForm: DataForm): SectionTable[] {
        return dataForm.sections.map((section): SectionTable => {
            const columns: Column[] = _(section.subsections)
                .flatMap(subsection => subsection.dataElements)
                .uniqBy(de => de.name)
                .map(de => ({ name: de.name }))
                .value();

            const rows = section.subsections.map(subsection => {
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
    }
}
