import React from "react";
import { Id } from "../../../domain/common/entities/Base";
import i18n from "../../../locales";
import { useAppContext } from "../../contexts/app-context";

export interface CommentIconProps {
    dataElementId: Id;
    categoryOptionComboId: Id;
}

export const CommentIcon: React.FC<CommentIconProps> = React.memo(props => {
    const { dataElementId, categoryOptionComboId } = props;
    const { api } = useAppContext();
    const tagId = `${dataElementId}-${categoryOptionComboId}-comment`;
    const title = i18n.t("View comment and audit history");

    return (
        <div style={styles.wrapper}>
            <img
                className="commentlink"
                id={tagId}
                src={`${api.baseUrl}/images/comment.png`}
                alt={title}
                title={title}
                style={styles.image}
            ></img>
        </div>
    );
});

const styles = {
    wrapper: { marginLeft: 10 },
    image: { cursor: "pointer" },
};
