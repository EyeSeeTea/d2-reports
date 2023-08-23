select de.uid as dataelementuid, de.name as dataelementname, se.name as sectionname,  se.uid as sectionuid,
(select max(lastupdated) from datavalue where dataelementid=de.dataelementid) as lastdateofsubscription 
from section se inner join sectiondataelements using (sectionid)
inner join dataelement de using(dataelementid) 
where datasetid in (select datasetid from dataset where uid  ~ ('^' || replace('${dataSets}', '-', '|') || '$'))
