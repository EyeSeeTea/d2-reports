import React, { useMemo } from "react";
import styled from "styled-components";
import MultipleDropdown from "../../../components/dropdown/MultipleDropdown";
import { MultipleDropdownProps } from "@eyeseetea/d2-ui-components";
import i18n from "../../../../locales";
import _ from "lodash";

export interface DataSetsFiltersProps {
    values: Filter;
    options: Filter;
    onChange: React.Dispatch<React.SetStateAction<Filter>>;
}

export interface Filter {
    templateGroups: string[];
    userRoles: string[];
}

export const Filters: React.FC<DataSetsFiltersProps> = React.memo(props => {
    const { values: filter, options: filterOptions, onChange } = props;

    const templateGroupItems = useMemoOptionsFromStrings(filterOptions.templateGroups);
    const userRoleItems = useMemoOptionsFromStrings(filterOptions.userRoles);

    const setTemplateGroups = React.useCallback<DropdownHandler>(
        templateGroups => onChange(prev => ({ ...prev, templateGroups })),
        [onChange]
    );

    const setUserRoles = React.useCallback<DropdownHandler>(
        userRoles => onChange(prev => ({ ...prev, userRoles })),
        [onChange]
    );

    return (
        <Container>
            <DropdownStyled
                items={templateGroupItems}
                values={filter.templateGroups}
                onChange={setTemplateGroups}
                label={i18n.t("Template group")}
            />

            <DropdownStyled
                items={userRoleItems}
                values={filter.userRoles}
                onChange={setUserRoles}
                label={i18n.t("User roles")}
            />
        </Container>
    );
});

function useMemoOptionsFromStrings(options: string[]) {
    return useMemo(() => {
        return _(options)
            .map(option => ({ value: option, text: option }))
            .value();
    }, [options]);
}

const Container = styled.div`
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
`;

const DropdownStyled = styled(MultipleDropdown)`
    margin-left: -10px;
`;

type DropdownHandler = MultipleDropdownProps["onChange"];
