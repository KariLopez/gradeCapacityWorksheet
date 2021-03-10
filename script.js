let schoolid;
let yearid;
let currentSchoolCapacity; 
let lastSchoolCapacity;
let statusReason;
let pastYear;
let currentYear;
let schoolName;


$(document).ready(function (){

    GetSchools(schools);
    GetAcademicYears(years);

     //testing
     GetSelectedCapacity(schoolCapacity);
     lastSchoolCapacity="5cd9c85d-d756-eb11-a812-000d3a3479c5";
     DisplayProposedCapacities(gradeCapacities);

    //listen for room difference changes 
    var td = document.getElementById('roomDiff');
    td.addEventListener('input', function(){
        UpdateRoom(td);
    });
});
function GetSchools(schools){
    let schoolData;
    if(schools==null||undefined){
        fetch('/api/data/v9.2/nha_schools?$select=nha_schoolid,nha_name&$filter=(statecode eq 0)&$orderby=nha_name asc').then(response=>response.json()).then(data=>{
            //update school dropdown
            schoolData= data;
       }); 
    }
    else{
        schoolData=schools;
    }
    FillSchoolChoices(schoolData)
}
function GetAcademicYears(years){
    let yearData = years;
    if(yearData==null|| undefined){
        fetch('/api/data/v9.2/nha_academicyears?$select=nha_academicyearid,nha_name,nha_value,statuscode&$filter=(statecode eq 0)&$orderby=nha_name asc').then(response=>response.json()).then(data=>{

         });
    }
    FillYearChoices(yearData);
   

}
function GetSelectedCapacity(schoolCapacity){
    if(schoolCapacity==null||undefined){
        fetch('/api/data/v9.2/nha_schoolenrollmentcapacities?$select=nha_schoolenrollmentcapacityid,nha_name,statuscode,nha_roomtotal,nha_percentageexpected,nha_instructionroomsavailable,nha_expectedcapacitytotal,nha_enrollmentmaximum,nha_enrollmentgoalstotal&$filter=(_nha_school_value eq '+schoolid+' and _nha_academicyear_value eq '+yearid +')&$orderby=nha_name asc').then(response=>response.json()).then(data=>{
            //update schoolcapacityvalues
            UpdateSchoolCapacityValues(data);
            GetNotes();
        })
    }
    else{

        UpdateSchoolCapacityValues(schoolCapacity);
        GetNotes();
       
    }
   
    
}
function GetNotes(){
    //uses currentSchoolCapacity
    fetch('/api/data/v9.2/nha_schoolenrollmentnoteses?$select=nha_schoolenrollmentnotesid,nha_name,createdon,nha_notefield,nha_enrollmentcapacitystatus&$filter=(_nha_schoolenrollmentcapacity_value eq '+currentSchoolCapacity+')&$orderby=createdon desc').then(response=>response.json()).then(data=>{
    //update notes section
    ShowNotes(data);
    })
 
}
function FillSchoolChoices(data){
    data.forEach(function(school){
        $('#school').append('<option value="'+school.nha_name+'" id="'+school.nha_schoolid+'">'+school.nha_name+'</opiton>');
    })
    UpdatedSelectedSchool(); 
}
function FillYearChoices(data){
    debugger;
    data.forEach(function(year){
        //check against current
        if(year.statuscode===126990001){
            $('#academicYear').append('<option value="'+year.nha_value+'" id="'+year.nha_academicyearid+'" default>'+ year.nha_name+'</option>');
            
            //SetYearId(year.nha_academicyearid);
            //SetCurrentYear(year.nha_value);
        }
        else{
            $('#academicYear').append('<option value="'+year.nha_value+'" id="'+year.nha_academicyearid+'">'+ year.nha_name+'</option>');
        }
       
    });
    UpdatedSelectedYear();
    //UpdateYearColumns();
}
function UpdateSchoolCapacityValues(data){
    //update fields
   // if(data[0].value.count==1){}

    let sec = data;

    statusReason= sec.statuscode;
    currentSchoolCapacity= sec.nha_schoolenrollmentcapacityid; 
    UpdateStatus();

        $('#nha_enrollmentmaximum').val(sec.nha_enrollmentmaximum);
        $('#nha_instructionroomsavailable').val(sec.nha_instructionroomsavailable);
    
        //read only info
        $('#nha_roomtotal').append( sec.nha_roomtotal);
        $('#nha_enrollmentgoalstotal').append(sec.nha_enrollmentgoalstotal);
        $('#nha_expectedcapacitytotal').append(sec.nha_expectedcapacitytotal);
        $('#nha_percentageexpected').append( sec.nha_percentageexpected); 
    
        GetLastYearCapacity();
    //}
   
}
function ShowNotes(data){
    data[0].value.forEach(function(note){
        $('#notes').append('<div id='+note.nha_schoolenrollmentnotesid+'><p>'+note.nha_name+'</p><p>'+note.createdon+'</p><p>'+note.nha_enrollmentcapacitystatus+'</p><p>'+note.nha_notefield+'</p></div>');
    });
}
function UpdatedSelectedSchool(){
    debugger;
    let selectedSchool = $('#school option:selected');
    SetSchoolId(selectedSchool.id);
    SetSchoolName(selectedSchool.val()); 
    
     //await to have both and then get grade capacities
    GetSelectedCapacity()
    GetLastYearCapacity();
    UpdateSchoolInfo();
}
function UpdatedSelectedYear(){
    debugger;
    let selectedYear = $('#academicYear option:selected');

    SetYearId(selectedYear.id);
    SetCurrentYear(selectedYear.val());

    //get prior year school enrollment capacity
    //await to have both and then get grade capacities
    GetSelectedCapacity();
    GetLastYearCapacity();
    UpdateYearColumns();
  
}
function GetSchoolCapacityLookups(schoolCapacity){
    fetch(apiURL + '/api/Capacity/GetSchoolCapacity?schoolCapacityID=' + schoolCapacity).then(response => response.json()).then(data => {
        UpdateLookupFields(data);
        //GetLastYearCapacity();
    });
}
function GetLastYearCapacity(){

    fetch('api/data/v9.2/nha_schoolenrollmentcapacities?$select=nha_schoolenrollmentcapacityid,nha_name,createdon&$expand=nha_academicyear()&$filter=(_nha_school_value eq '+schoolid+') and (nha_academicyear/nha_value eq '+pastYear+')&$orderby=nha_name asc').then(response=>response.json()).then(data=>{
        lastSchoolCapacity =  data.nha_schoolenrollmentcapacityid;
        GetGradeCapacities();
    })
}
function SetSchoolName(name){
    schoolName = name;
}
function SetSchoolId(nha_schoolid){
    schoolid = nha_schoolid;
}
function SetYearId(year){
    yearid = year; 
}
function SetCurrentYear(currentYearValue){
    currentYear = currentYearValue; 
    SetPastYear();
}
function SetPastYear(){
    pastYear= currentYear-1;
}
function SetSchool(){

}

function UpdateYearColumns(){
    $('.priorYear').html(pastYear);
    $('.currentYear').html(currentYear); 
}
function UpdateSchoolInfo(){
    $('.schoolName').html(schoolName);
}
function UpdateStatus(){
    //looks against values in optionSets.js
    var status = schoolCapacityStatus.filter(status => status.value === statusReason);
    if(status.length===1){
        $('.statusReason').append(status[0].status);

    }
    else{
        $('.statusReason').append(statusReason);
    }
    
}
function GetGradeCapacities(){
    fetch('/api/data/v9.2/nha_gradelevelcapacities?$select=nha_gradelevelcapacityid,nha_name,nha_studentsperroom,_nha_schoolenrollmentcapacity_value,nha_rooms,nha_roomdifference,nha_predictedenrollment,nha_offeredcapacity,nha_newstudentsneeded,nha_gradeindex,nha_grade,nha_expectedcapacity,nha_enrollmentgoals,nha_countdaystudents&$filter=(Microsoft.Dynamics.CRM.In(PropertyName='+"nha_schoolenrollmentcapacity"+',PropertyValues=['+currentSchoolCapacity+','+lastSchoolCapacity+']))&$orderby=nha_gradeindex asc').then(response=>response.json()).then(data=>{
        DisplayProposedCapacities(data);
    });
}

function DisplayProposedCapacities(data){
    let gradeCapacities = data;
    let currentGradeCapacities = gradeCapacities.filter(capacity=>capacity.nha_schoolenrollmentcapacity===currentSchoolCapacity).sort(sortGrades);
    let pastGradeCapacities = gradeCapacities.filter(capacity=>capacity.nha_schoolenrollmentcapacity===lastSchoolCapacity).sort(sortGrades);
    
    let allGradeCapacities = currentGradeCapacities.map(function(cyCapacity){
       let lastYearGradeValues = pastGradeCapacities.filter(pyCapacity=>pyCapacity.nha_grade===cyCapacity.nha_grade);
       if(lastYearGradeValues.length!==0){
            let condensedRow = cyCapacity;
            condensedRow.pyRooms = lastYearGradeValues[0].nha_rooms;
            condensedRow.pyOfferedCapacity=lastYearGradeValues[0].nha_offeredcapacity;
            condensedRow.pyCountDay=lastYearGradeValues[0].nha_countdaystudents;
            //parse out grade optionSet
           condensedRow.parsedGrade = GetGradeValue(cyCapacity.nha_grade);
           condensedRow.gradeCapacityId= cyCapacity.nha_gradelevelcapacityid;
            return condensedRow;
        }
        else{
            condensedRow =  cyCapacity;
            condensedRow.parsedGrade = GetGradeValue(cyCapacity.nha_grade);
            condensedRow.gradeCapacityId= cyCapacity.nha_gradelevelcapacityid;
            return condensedRow;
        }
    });

    allGradeCapacities.sort(Gradecompare);
    allGradeCapacities.forEach(function(capacity){
        $('.gradeRows').append("<tr class='rowBody' id="+capacity.gradeCapacityId+"><td id=grade"+capacity.nha_grade+">"+capacity.parsedGrade+"<td>"+capacity.pyRooms+"</td><td id='roomDiff' contenteditable=true>"+capacity.nha_roomdifference+"</td><td id='rooms_"+capacity.nha_grade+"'>"+capacity.nha_rooms+"</td><td>"+capacity.pyOfferedCapacity+"</td><td>"+capacity.pyCountDay+"</td><td>"+capacity.nha_newstudentsneeded+"</td><td contenteditable>"+capacity.nha_offeredcapacity+"</td><td>"+capacity.nha_studentsperroom+"</td><td>"+capacity.nha_expectedcapacity+"</td><td>"+capacity.nha_enrollmentgoals+"</td></tr>");
    });

}
function UpdateRoom(inputRow){
    //id of tr
    let originalRoomVal = inputRow.nextSibling.innerHTML;
    let roomCell = inputRow.nextSibling.id;

    let pyRoomCell = inputRow.previousSibling.innerHTML; 
    let roomDiff= inputRow.innerHTML;

    let newRoomVal = parseInt(pyRoomCell)+parseInt(roomDiff);
    $('#'+roomCell+'').html(newRoomVal);
    
}
function Gradecompare(a, b) {
    let gradeValue_a = gradeLevels.filter(grade => grade.value === a.nha_grade);
    let gradeValue_b = gradeLevels.filter(grade => grade.value === b.nha_grade);
    return gradeValue_a[0].displayOrder - gradeValue_b[0].displayOrder; 

}
function GetGradeValue(nha_grade){
  //grade level option set
  let gradeValue = gradeLevels.filter(grade=>grade.value===nha_grade);
  if(gradeValue.length===1){
       return  gradeValue[0].name;
  }
  else{
      return nha_grade;
  }

}
function userSubmit(event){
    event.preventDefault();
    //get every grade level capacity room and room diff and offered capacity
    //get values of total rooms avail for instruction
    //get enrollment max
    //send updates for each glc, and sec
  
}
function updateSEC(){
    /*
    $('#nha_instructionroomsavailable').val();
    $('#nha_enrollmentmaximum').val();

    let values= {
        nha_instructionroomsavailable= $('#nha_instructionroomsavailable').val(),
        nha_enrollmentmaximum =     $('#nha_enrollmentmaximum').val()
    }
    fetch('/api/v9.2/nha_schoolenrollmentcapacities('+currentSchoolCapacity+'','post'=>{
        body: values,
        headers:
        contenttype

    });*/
}
function sendValues(){

}
function openSEC(){
    //window .open (url of sec)
}
function sortGrades(a,b){
    const gradeCapacityA = a.nha_grade;
    const gradeCapacityB = b.nha_grade;
    let comparrison = 0;
    if(gradeCapacityA>gradeCapacityB){
        comparrison = 1;
    }
    else if(gradeCapacityA<gradeCapacityB){
        comparrison = -1;
    }
    return comparrison;
}
function UseJSON(gradeCapacities){
    lastSchoolCapacity= "5cd9c85d-d756-eb11-a812-000d3a3479c5";
    UpdateLookupFields();
    DisplayProposedCapacities(gradeCapacities);
}

/*
function userDecision(userDecision){
    $('#'+userDecision+'').addClass("checkedBox");
    if(userDecision==="approve"){
        $('#userNotes').prop('required',false);
        
        $("#reject").removeClass("checkedBox");
    }
    else if(userDecision==="reject"){
        $('#userNotes').prop('required',true);
        $("#approve").removeClass("checkedBox");

    }

}
function UpdateLookupFields(){

    pastYear= currentYear-1;

    schoolid= schoolCapacity.nha_school;
    schoolName = schoolCapacity.schoolName;

    statusReason= schoolCapacity.statuscode;

    UpdateSchoolInfo();
    UpdateYearColumns();
    UpdateStatus();
}
function ParseParameters(){
   const queryString =  window.location.search;
   const urlParams = new URLSearchParams(queryString);
   const schoolCapacity = urlParams.get('currentSchoolCapacity');
   if(schoolCapacity!==null){
       currentSchoolCapacity = schoolCapacity.toLowerCase();
   }
   else{
       currentSchoolCapacity="f06fec29-c052-eb11-a812-000d3a58f033";
       lastSchoolCapacity="5cd9c85d-d756-eb11-a812-000d3a3479c5";
   }

   
}

*/


