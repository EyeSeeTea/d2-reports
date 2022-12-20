import { MultipleDropdownProps } from "@eyeseetea/d2-ui-components";
import React, { useMemo } from "react";
import styled from "styled-components";
import { NamedRef } from "../../../../domain/common/entities/Base";
import i18n from "../../../../locales";
import MultipleDropdown from "../../../components/dropdown/MultipleDropdown";

export interface DataSetsFiltersProps {
    values: DataSetsFilter;
    options: FilterOptions;
    onChange: React.Dispatch<React.SetStateAction<DataSetsFilter>>;
}

export interface DataSetsFilter {
    dataSetId: string[]
    dataElementNames: string[];
    sectionNames: string[];
    lastDateOfSubscription: string[];
}

interface FilterOptions {
    sectionNames: NamedRef[];
    elementType: string[];
    subscription: string[];
}

export const Filters: React.FC<DataSetsFiltersProps> = React.memo(props => {
    const { values: filter, options: filterOptions, onChange } = props;

    const sectionItems = useMemoOptionsFromNamedRef(filterOptions.sectionNames);
    const elementTypeItems = useMemoOptionsFromStrings(filterOptions.elementType);
    const subscriptionTypeItems = useMemoOptionsFromStrings(filterOptions.subscription);

    const setSectionNames = React.useCallback<DropdownHandler>(
        sectionNames => onChange(prev => ({ ...prev, sectionNames })),
        [onChange]
    );

    const setElementType = React.useCallback<DropdownHandler>(
        elementTypes => onChange(prev => ({ ...prev, elementTypes })),
        [onChange]
    );

    const setSubscriptionStatus = React.useCallback<DropdownHandler>(
        subscriptionStatus => onChange(prev => ({ ...prev, elementTypes: subscriptionStatus })),
        [onChange]
    );

    return (
        <Container>
            <DropdownStyled
                items={elementTypeItems}
                values={filter.dataElementNames}
                onChange={setElementType}
                label={i18n.t("Element Type")}
            />

            <DropdownStyled
                items={subscriptionTypeItems}
                values={filter.sectionNames}
                onChange={setSubscriptionStatus}
                label={i18n.t("Subscription Status")}
            />

            <DropdownStyled
                items={sectionItems}
                values={filter.sectionNames}
                onChange={setSectionNames}
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

function useMemoOptionsFromStrings(options: string[]) {
    return useMemo(() => {
        return options.map(option => ({ value: option, text: option }));
    }, [options]);
}

function useMemoOptionsFromNamedRef(options: NamedRef[]) {
    return useMemo(() => {
        return options.map(option => ({ value: option.id, text: option.name }));
    }, [options]);
}

type DropdownHandler = MultipleDropdownProps["onChange"];
