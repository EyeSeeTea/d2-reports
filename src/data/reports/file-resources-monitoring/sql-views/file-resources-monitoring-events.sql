SELECT uid as eventuid, eventdatavalues FROM event WHERE programstageid 
 IN (SELECT programstageid FROM programstagedataelement WHERE dataelementid  
 IN (SELECT dataelementid FROM dataelement WHERE valuetype='FILE_RESOURCE' or valuetype='IMAGE'))
