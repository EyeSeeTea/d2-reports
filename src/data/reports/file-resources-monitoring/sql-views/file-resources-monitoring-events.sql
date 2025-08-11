SELECT
  e.uid AS eventUId,
  evt.key AS dataElementUId,
  jsonb_extract_path_text(evt.value::jsonb, 'value') as fileResourceUId
FROM event e,
  jsonb_each(e.eventdatavalues) AS evt(key, value)
WHERE e.programstageid IN (
    SELECT psde.programstageid
    FROM programstagedataelement psde
    JOIN dataelement de ON psde.dataelementid = de.dataelementid
    WHERE de.valuetype IN ('FILE_RESOURCE', 'IMAGE')
)
AND evt.key IN (
    SELECT de.uid
    FROM dataelement de
    WHERE de.valuetype IN ('FILE_RESOURCE', 'IMAGE')
);