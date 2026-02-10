import React from "react";
import styled from "styled-components";
import { IconButton } from "material-ui";
import { FilterList } from "@material-ui/icons";

export interface DataSetsFiltersProps {
    values: Filter;
    options: FilterOptions;
    onChange: React.Dispatch<React.SetStateAction<Filter>>;
}

export interface Filter {
    filenameQuery: string;
}

interface FilterOptions {
    filenameQuery: string;
}

export const Filters: React.FC<DataSetsFiltersProps> = React.memo(() => {
    return (
        <Container>
            <IconButton>
                <FilterList />
            </IconButton>
        </Container>
    );
});

const Container = styled.div`
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
`;
