let schoolid;
let schoolName;
let yearid;
let pastYear;
let currentYear;
let currentSchoolCapacity; 
let lastSchoolCapacity;
let statusReason;
let apiURL= "localhost:51286";

$(document).ready(function (){


    GetSchools(schools);
    GetAcademicYears(years);

    //production
    //GetSelectedCapacity();

     //testing
     GetSelectedCapacity(schoolCapacity,notes);
     lastSchoolCapacity="5cd9c85d-d756-eb11-a812-000d3a3479c5";
     ShowProposedCapacities(gradeCapacities);

    //listen for room difference changes 
    var tdElements = document.getElementsByClassName('roomDiff');
    for(var i=0; i<tdElements.length;i++){
        tdElements[i].addEventListener('input',function(e){
            UpdateRoom(e);
        })
    }
  
   
 
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
    ShowSchoolChoices(schoolData)
}
function GetAcademicYears(years){
    let yearData = years;
    if(yearData==null|| undefined){
        fetch('/api/data/v9.2/nha_academicyears?$select=nha_academicyearid,nha_name,nha_value,statuscode&$filter=(statecode eq 0)&$orderby=nha_name asc').then(response=>response.json()).then(data=>{

         });
    }
    ShowYearChoices(yearData);
   

}
function GetSelectedCapacity(schoolCapacity,notes){
    if(schoolCapacity==null||undefined){
        fetch('/api/data/v9.2/nha_schoolenrollmentcapacities?$select=nha_schoolenrollmentcapacityid,nha_name,statuscode,nha_roomtotal,nha_percentageexpected,nha_instructionroomsavailable,nha_expectedcapacitytotal,nha_enrollmentmaximum,nha_enrollmentgoalstotal&$filter=(_nha_school_value eq '+schoolid+' and _nha_academicyear_value eq '+yearid +')&$orderby=nha_name asc').then(response=>response.json()).then(data=>{
            //update schoolcapacityvalues
            ShowSchoolCapacityValues(data);
            GetNotes();
        })
    }
    else{

        ShowSchoolCapacityValues(schoolCapacity);
        GetNotes(notes);
       
    } 
}
function GetNotes(notes){
    if(notes==null|| undefined){
          //uses currentSchoolCapacity
        fetch('/api/data/v9.2/nha_schoolenrollmentnoteses?$select=nha_schoolenrollmentnotesid,nha_name,createdon,nha_notefield,nha_enrollmentcapacitystatus&$filter=(_nha_schoolenrollmentcapacity_value eq '+currentSchoolCapacity+')&$orderby=createdon desc').then(response=>response.json()).then(data=>{
        //update notes section
        ShowNotes(data);
        })
    }
    else{
        ShowNotes(notes);
    }
  
 
}
function GetSchoolCapacity(schoolCapacity){
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
function GetGradeCapacities(){
    fetch('/api/data/v9.2/nha_gradelevelcapacities?$select=nha_gradelevelcapacityid,nha_name,nha_studentsperroom,_nha_schoolenrollmentcapacity_value,nha_rooms,nha_roomdifference,nha_predictedenrollment,nha_offeredcapacity,nha_newstudentsneeded,nha_gradeindex,nha_grade,nha_expectedcapacity,nha_enrollmentgoals,nha_countdaystudents&$filter=(Microsoft.Dynamics.CRM.In(PropertyName='+"nha_schoolenrollmentcapacity"+',PropertyValues=['+currentSchoolCapacity+','+lastSchoolCapacity+']))&$orderby=nha_gradeindex asc').then(response=>response.json()).then(data=>{
        ShowProposedCapacities(data);
    });
}
function ShowSchoolChoices(data){
    data.forEach(function(school){
        $('#school').append('<option value="'+school.nha_name+'" id="'+school.nha_schoolid+'">'+school.nha_name+'</opiton>');
    })
    UpdatedSelectedSchool(); 
}
function ShowYearChoices(data){
    data.forEach(function(year){
        //check against current
        if(year.statuscode===126990001){
            $('#academicYear').append('<option value="'+year.nha_value+'" id="'+year.nha_academicyearid+'" default>'+ year.nha_name+'</option>');
        }
        else{
            $('#academicYear').append('<option value="'+year.nha_value+'" id="'+year.nha_academicyearid+'">'+ year.nha_name+'</option>');
        }
       
    });
    UpdatedSelectedYear();
}
function ShowProposedCapacities(data){
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
           condensedRow.parsedGrade = FindGradeValue(cyCapacity.nha_grade);
           condensedRow.gradeCapacityId= cyCapacity.nha_gradelevelcapacityid;
            return condensedRow;
        }
        else{
            condensedRow =  cyCapacity;
            condensedRow.parsedGrade = FindGradeValue(cyCapacity.nha_grade);
            condensedRow.gradeCapacityId= cyCapacity.nha_gradelevelcapacityid;
            return condensedRow;
        }
    });

    allGradeCapacities.sort(Gradecompare);
    allGradeCapacities.forEach(function(capacity){
        $('.gradeRows').append("<tr class='rowBody' id="+capacity.gradeCapacityId+"><td id=grade"+capacity.nha_grade+">"+capacity.parsedGrade+"<td>"+capacity.pyRooms+"</td><td id=roomDiff_"+capacity.gradeCapacityId+" class='roomDiff' contenteditable=true>"+capacity.nha_roomdifference+"</td><td id='rooms_"+capacity.gradeCapacityId+"'>"+capacity.nha_rooms+"</td><td>"+capacity.pyOfferedCapacity+"</td><td>"+capacity.pyCountDay+"</td><td>"+capacity.nha_newstudentsneeded+"</td><td id=offeredcapacity_"+capacity.gradeCapacityId+" contenteditable>"+capacity.nha_offeredcapacity+"</td><td>"+capacity.nha_studentsperroom+"</td><td>"+capacity.nha_expectedcapacity+"</td><td>"+capacity.nha_enrollmentgoals+"</td></tr>");
    });

}
function ShowNotes(data){
    data.forEach(function(note){
        $('#notes').append('<div id='+note.nha_schoolenrollmentnotesid+'><p>'+note.nha_name+'</p><p>'+note.createdon+'</p><p>'+note.nha_enrollmentcapacitystatus+'</p><p>'+note.nha_notefield+'</p></div>');
    });
}
function ShowSchoolCapacityValues(data){
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
function UpdatedSelectedSchool(){
    let selectedSchool = $('#school option:selected');
    SetSchoolId(selectedSchool.id);
    SetSchoolName(selectedSchool.val()); 
    
     //await to have both and then get grade capacities
    //GetSelectedCapacity()
    //GetLastYearCapacity();
    UpdateSchoolNameDisplay();
}
function UpdatedSelectedYear(){
    let selectedYear = $('#academicYear option:selected');

    SetYearId(selectedYear.id);
    SetCurrentYear(selectedYear.val());

    //get prior year school enrollment capacity
    //await to have both and then get grade capacities
    //GetSelectedCapacity();
    //GetLastYearCapacity();
    UpdateYearColumns();
  
}
function UpdateYearColumns(){
    $('.priorYear').html(pastYear);
    $('.currentYear').html(currentYear); 
}
function UpdateSchoolNameDisplay(){
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
function UpdateRoom(eventtrigger){

    let inputRow= eventtrigger.currentTarget;
    let originalRoomVal = inputRow.nextSibling.innerHTML;
    let roomCell = inputRow.nextSibling.id;

    let pyRoomCell = inputRow.previousSibling.innerHTML; 
    let roomDiff= inputRow.innerHTML;

    let newRoomVal = parseInt(pyRoomCell)+parseInt(roomDiff);
    $('#'+roomCell+'').html(newRoomVal);
    
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
function Gradecompare(a, b) {
    let gradeValue_a = gradeLevels.filter(grade => grade.value === a.nha_grade);
    let gradeValue_b = gradeLevels.filter(grade => grade.value === b.nha_grade);
    return gradeValue_a[0].displayOrder - gradeValue_b[0].displayOrder; 

}
function FindGradeValue(nha_grade){
  //grade level option set
  let gradeValue = gradeLevels.filter(grade=>grade.value===nha_grade);
  if(gradeValue.length===1){
       return  gradeValue[0].name;
  }
  else{
      return nha_grade;
  }

}
function SaveData(){
    let gradeTable = $('.gradeRows');
    let gradeRows = gradeTable[0].children; 
    let gradeUpdates = [];
    for(var i = 0;i<gradeRows.length;i++){
        let grade = {};
        //get grade capacity id of row/ id is set to current year capacity
        let gradeid= gradeRows[i].id;

        //get value of room, room difference, and offered capacity with unique id of each value
        let gradeRoom = $('#rooms_'+gradeid);
        let gradeRoomDiff = $('#roomDiff_'+gradeid);
        let offeredCapacity = $('#offeredcapacity_'+gradeid);

        //create an object with values
        grade.nha_gradelevelcapacityid=gradeid;
        grade.nha_room= gradeRoom[0].innerHTML;
        grade.nha_roomdifference= gradeRoomDiff[0].innerHTML;
        grade.nha_offeredcapacity = offeredCapacity[0].innerHTML; 

        //add to array
        gradeUpdates.push(grade);
    }
    console.log(gradeUpdates);
    //go through each tr and get id 
        //go through each td to get room,room diff and offered capacity values
    //updates values on SEC
    let SEC_values= {
        "nha_instructionroomsavailable": $('#nha_instructionroomsavailable').val(),
        "nha_enrollmentmaximum" :  $('#nha_enrollmentmaximum').val()
    }
    
    fetch('/api/v9.2/nha_schoolenrollmentcapacities('+currentSchoolCapacity+'',{
        method:'POST',
        body:JSON.stringify(SEC_values),
        headers:"",
        accept: "json"
    });
    //some kind of success message
}
function openSEC(){
    //window .open (url of sec)
   // Window.open('/nha_schoolenrollmentcapacities()')
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

