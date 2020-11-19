import React from "react";
import i18n from "../../../locales";
import MultipleDropdown from "../../components/dropdown/MultipleDropdown";
import { Id, NamedRef } from "../../../domain/entities/Base";

interface DataValuesFiltersProps {
    values: DataValuesFilter;
    options: FilterOptions;
    onChange(newFilters: DataValuesFilter): void;
}

export interface DataValuesFilter {
    periods: string[];
    dataSetIds: Id[];
    sectionIds: Id[];
}

interface FilterOptions {
    periods: string[];
    dataSets: NamedRef[];
    sections: NamedRef[];
}

export const DataValuesFilters: React.FC<DataValuesFiltersProps> = React.memo(props => {
    const { values: filter, options: filterOptions, onChange } = props;
    const periodItems = useMemoOptionsFromStrings(filterOptions.periods);
    const dataSetItems = useMemoOptionsFromNamedRef(filterOptions.dataSets);
    const sectionItems = useMemoOptionsFromNamedRef(filterOptions.sections);

    return (
        <div>
            <MultipleDropdown
                items={periodItems}
                values={filter.periods}
                onChange={periods => onChange({ ...filter, periods })}
                label={i18n.t("Periods")}
            />
            <MultipleDropdown
                items={dataSetItems}
                values={filter.dataSetIds}
                onChange={dataSetIds => onChange({ ...filter, dataSetIds })}
                label={i18n.t("Data sets")}
            />
            <MultipleDropdown
                items={sectionItems}
                values={filter.sectionIds}
                onChange={sectionIds => onChange({ ...filter, sectionIds })}
                label={i18n.t("Sections")}
            />
        </div>
    );
});

function useMemoOptionsFromStrings(options: string[]) {
    return React.useMemo(() => {
        return options.map(option => ({ value: option, text: option }));
    }, [options]);
}

function useMemoOptionsFromNamedRef(options: NamedRef[]) {
    return React.useMemo(() => {
        return options.map(option => ({ value: option.id, text: option.name }));
    }, [options]);
}

export const emptyDataValuesFilter: DataValuesFilter = {
    periods: [],
    dataSetIds: [],
    sectionIds: [],
};
