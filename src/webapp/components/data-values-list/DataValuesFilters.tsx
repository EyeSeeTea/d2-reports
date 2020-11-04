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
    dataElementGroupIds: Id[];
}

interface FilterOptions {
    periods: string[];
    dataSets: NamedRef[];
    dataElementGroups: NamedRef[];
}

export const DataValuesFilters: React.FC<DataValuesFiltersProps> = React.memo(props => {
    const { values: filter, options: filterOptions, onChange } = props;
    const periodItems = useMemoOptionsFromStrings(filterOptions.periods);
    const dataSetItems = useMemoOptionsFromNamedRef(filterOptions.dataSets);
    const dataElementGroupItems = useMemoOptionsFromNamedRef(filterOptions.dataElementGroups);

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
                items={dataElementGroupItems}
                values={filter.dataElementGroupIds}
                onChange={dataElementGroupIds => onChange({ ...filter, dataElementGroupIds })}
                label={i18n.t("Data element groups")}
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
    // TODO: DEBUG
    /*
    periods: ["2019"],
    dataSetIds: ["pZ3XRBi9gYE"],
    dataElementGroupIds: [],
    */
    periods: [],
    dataSetIds: [],
    dataElementGroupIds: [],
};
