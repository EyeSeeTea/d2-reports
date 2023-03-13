import React from "react";

export const Html: React.FC<{ content: string | undefined }> = props => {
    if (!props.content) return null;

    return <div style={{ margin: 20 }} dangerouslySetInnerHTML={{ __html: props.content }} />;
};
