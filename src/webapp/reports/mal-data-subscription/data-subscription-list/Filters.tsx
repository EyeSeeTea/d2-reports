import { MultipleDropdownProps } from "@eyeseetea/d2-ui-components";
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
    elementTypes: string[];
    dataElementIds: string[];
    sections: string[];
}

interface FilterOptions {
    sections: NamedRef[];
    elementType: string[];
    subscription: string[];
}

export const Filters: React.FC<DataElementsFiltersProps> = React.memo(props => {
    const { values: filter, options: filterOptions, onChange } = props;

    const sectionItems = useMemoOptionsFromNamedRef(filterOptions.sections);
    const elementTypeItems = useMemoOptionsFromStrings(filterOptions.elementType);
    const subscriptionTypeItems = useMemoOptionsFromStrings(filterOptions.subscription);

    const setSections = React.useCallback<DropdownHandler>(
        sections => onChange(prev => ({ ...prev, sections })),
        [onChange]
    );

    const setElementType = React.useCallback<DropdownHandler>(
        elementTypes => onChange(prev => ({ ...prev, elementTypes })),
        [onChange]
    );

    const setSubscriptionStatus = React.useCallback<DropdownHandler>(
        subscriptionStatus => onChange(prev => ({ ...prev, subscriptionStatus })),
        [onChange]
    );

    return (
        <Container>
            <DropdownStyled
                items={elementTypeItems}
                values={filter.sections}
                onChange={setElementType}
                label={i18n.t("Element Type")}
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
