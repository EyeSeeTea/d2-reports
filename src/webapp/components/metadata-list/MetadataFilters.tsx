import React from "react";
import i18n from "../../../locales";
import MultipleDropdown from "../../components/dropdown/MultipleDropdown";

export interface MetadataObjectsFiltersProps {
    values: MetadataObjectsFilter;
    options: FilterOptions;
    onChange(newFilters: MetadataObjectsFilter): void;
}

export interface MetadataObjectsFilter {
    metadataTypes: string[];
    createdBy: string[];
    lastUpdatedBy: string[];
    publicAccess: string[];
}

interface FilterOptions {
    metadataTypes: string[];
    createdBy: string[];
    lastUpdatedBy: string[];
    publicAccess: string[];
}

export const MetadataObjectsFilters: React.FC<MetadataObjectsFiltersProps> = React.memo(props => {
    const { values: filter, options: filterOptions, onChange } = props;
    const metadataTypeItems = useMemoOptionsFromStrings(filterOptions.metadataTypes);
    const publicAccessItems = useMemoOptionsFromStrings(filterOptions.publicAccess);
    const createdByItems = useMemoOptionsFromStrings(filterOptions.createdBy);
    const lastUpdatedByItems = useMemoOptionsFromStrings(filterOptions.lastUpdatedBy);

    return (
        <div>
            <MultipleDropdown
                items={metadataTypeItems}
                values={filter.metadataTypes}
                onChange={metadataTypes => onChange({ ...filter, metadataTypes })}
                label={i18n.t("Metadata Type")}
            />

            <MultipleDropdown
                items={publicAccessItems}
                values={filter.publicAccess}
                onChange={publicAccess => onChange({ ...filter, publicAccess })}
                label={i18n.t("Public Access")}
            />

            <MultipleDropdown
                items={createdByItems}
                values={filter.createdBy}
                onChange={createdBy => onChange({ ...filter, createdBy })}
                label={i18n.t("Created By")}
            />

            <MultipleDropdown
                items={lastUpdatedByItems}
                values={filter.lastUpdatedBy}
                onChange={lastUpdatedBy => onChange({ ...filter, lastUpdatedBy })}
                label={i18n.t("Last Updated By")}
            />
        </div>
    );
});

function useMemoOptionsFromStrings(options: string[]) {
    return React.useMemo(() => {
        return options.map(option => ({ value: option, text: option }));
    }, [options]);
}
