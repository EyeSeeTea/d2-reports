import React from "react";
import i18n from "../../../../locales";
import MultipleDropdown from "../../../components/dropdown/MultipleDropdown";
import { Id, NamedRef } from "../../../../domain/common/entities/Base";
import { useAppContext } from "../../../contexts/app-context";
import { getRootIds } from "../../../../domain/common/entities/OrgUnit";
import { OrgUnitsFilterButton } from "../../../components/org-units-filter/OrgUnitsFilterButton";

export interface DataValuesFiltersProps {
    values: DataValuesFilter;
    options: FilterOptions;
    onChange(newFilters: DataValuesFilter): void;
}

export interface DataValuesFilter {
    orgUnitPaths: Id[];
    periods: string[];
    dataSetIds: Id[];
}

interface FilterOptions {
    periods: string[];
    dataSets: NamedRef[];
}

export const Filters: React.FC<DataValuesFiltersProps> = React.memo(props => {
    const { config, api } = useAppContext();
    const { values: filter, options: filterOptions, onChange } = props;
    const periodItems = useMemoOptionsFromStrings(filterOptions.periods);
    const dataSetItems = useMemoOptionsFromNamedRef(filterOptions.dataSets);
    const rootIds = React.useMemo(() => getRootIds(config.currentUser.orgUnits), [config]);

    return (
        <div>
            <OrgUnitsFilterButton
                api={api}
                rootIds={rootIds}
                selected={filter.orgUnitPaths}
                setSelected={paths => onChange({ ...filter, orgUnitPaths: paths })}
            />

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
