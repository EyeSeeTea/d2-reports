import { Dropdown, DropdownProps, MultipleDropdownProps } from "@eyeseetea/d2-ui-components";
import React, { useMemo } from "react";
import styled from "styled-components";
import i18n from "../../../../locales";
import MultipleDropdown from "../../../components/dropdown/MultipleDropdown";
import { NamedRef } from "../../../../domain/common/entities/Base";

export interface DataElementsFiltersProps {
    values: DataElementsFilter;
    options: FilterOptions;
    onChange: React.Dispatch<React.SetStateAction<DataElementsFilter>>;
}

export interface DataElementsFilter {
    elementType: string;
    dataElementIds: string[];
    sections: string[];
}

interface FilterOptions {
    sections: NamedRef[];
    subscription: string[];
}

export const Filters: React.FC<DataElementsFiltersProps> = React.memo(props => {
    const { values: filter, options: filterOptions, onChange } = props;

    const sectionItems = useMemoOptionsFromNamedRef(filterOptions.sections);
    const elementTypeItems = React.useMemo(() => {
        return [
            { value: "dataElements", text: i18n.t("Data Elements") },
            { value: "dashboards", text: i18n.t("Dashboards") },
            { value: "visualizations", text: i18n.t("Visualizations") },
        ];
    }, []);

    const subscriptionTypeItems = useMemoOptionsFromStrings(filterOptions.subscription);

    const setSections = React.useCallback<DropdownHandler>(
        sections => onChange(prev => ({ ...prev, sections })),
        [onChange]
    );

    const setElementType = React.useCallback<SingleDropdownHandler>(
        elementType => onChange(prev => ({ ...prev, elementType: elementType ?? "dataElements" })),
        [onChange]
    );

    const setSubscriptionStatus = React.useCallback<DropdownHandler>(
        subscriptionStatus => onChange(prev => ({ ...prev, subscriptionStatus })),
        [onChange]
    );

    return (
        <Container>
            <SingleDropdownStyled
                items={elementTypeItems}
                value={filter.elementType}
                onChange={setElementType}
                label={i18n.t("Element Type")}
                hideEmpty
            />

            <DropdownStyled
                items={subscriptionTypeItems}
                values={filter.sections}
                onChange={setSubscriptionStatus}
                label={i18n.t("Subscription Status")}
            />

            <DropdownStyled
                items={sectionItems}
                values={filter.sections}
                onChange={setSections}
                label={i18n.t("Section")}
            />
        </Container>
    );
});

const Container = styled.div`
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
`;

const DropdownStyled = styled(MultipleDropdown)`
    margin-left: -10px;
`;

const SingleDropdownStyled = styled(Dropdown)`
    margin-left: -10px;
    width: 180px;
`;

function useMemoOptionsFromNamedRef(options: NamedRef[]) {
    return useMemo(() => {
        return options.map(option => ({ value: option.id, text: option.name }));
    }, [options]);
}

function useMemoOptionsFromStrings(options: string[]) {
    return useMemo(() => {
        return options.map(option => ({ value: option, text: option }));
    }, [options]);
}

type DropdownHandler = MultipleDropdownProps["onChange"];
type SingleDropdownHandler = DropdownProps["onChange"];
