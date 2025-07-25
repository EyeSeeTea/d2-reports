-- This view retrieves all tracked entity attributes that are of type FILE_RESOURCE or IMAGE and is Required due Dhis2 restrictions, this view only returns a list of uids no protected data.
--CREATE OR REPLACE VIEW public.valid_tracker_fileresources AS
-- SELECT te.uid AS trackeruid, teav.value AS fileresourceuid FROM trackedentityattributevalue teav JOIN trackedentity te ON te.trackedentityid = teav.trackedentityid WHERE teav.trackedentityattributeid IN ( SELECT trackedentityattributeid FROM trackedentityattribute WHERE valuetype IN ('FILE_RESOURCE', 'IMAGE') )
SELECT *
FROM valid_tracker_fileresources  teav