import React from "react";

export const CustomFormErrorsList: React.FC = React.memo(() => {
    //await compositionRoot.dataComments.get({})
    return (
<div>
  { <p>{ "ERROR: UID xxx does not exist in dataset xxxx" }</p> }{ <p>{ "ERROR: DataElement xxx is not associated to dataset xxxx" }</p> }
</div>
    );
});
