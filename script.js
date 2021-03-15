let schoolid;
let schoolName;
let yearid;
let pastYear;
let currentYear;
let currentSchoolCapacity; 
let lastSchoolCapacity;
let statusReason;
let currentAcademicYearStatus= 126990001;
let apiURL= "https://enrollmentcapacityapi.azurewebsites.net";
let testing = true;

$(document).ready(function (){
    //testing
    if(testing){
        GetSchools(schools);
        GetAcademicYears(years);
    }
    else{
        GetSchools();
        GetAcademicYears();
    }

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
        fetch(apiURL+'/api/School/Schools').then(response=>response.json()).then(data=>{
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
        fetch(apiURL+'/api/Year/Years').then(response=>response.json()).then(data=>{
            yearData= data; 
        });
    }
    ShowYearChoices(yearData);
   

}
function GetSelectedCapacity(schoolCapacity){
    if(schoolCapacity==null||undefined){
        fetch(apiURL+'/api/Capacity/GetSchoolCapacity?schoolid='+schoolid+'&academicyearid='+yearid).then(response=>response.json()).then(data=>{
            ShowSchoolCapacityValues(data);
        });
    }
    else{
        ShowSchoolCapacityValues(schoolCapacity);       
    } 
}
function GetNotes(notes){
    if(notes==null|| undefined){
          fetch(apiURL+'/api/Note/SchoolCapacityNotes?schoolid='+schoolid+'&yearid='+yearid).then(response=>response.json()).then(data=>{
            ShowNotes(data);

          });
    }
    else{
        ShowNotes(notes);
    }
}

function GetGradeCapacities(gradeCapacities){
    if(gradeCapacities===null||gradeCapacities===undefined){
        fetch(apiURL+'/api/GradeCapacity/GradeCapacities?schoolid='+schoolid+'&academicyearid='+yearid+'&pastacademicyearid='+pastYear).then(response=>response.json()).then(data=>{
            ShowProposedCapacities(data);
        });
    }
    else{
        ShowProposedCapacities(gradeCapacities);
    }
 
    
}
function ShowSchoolChoices(data){
    data.forEach(function(school){
        $('#school').append('<option class="dropdown-item" value="'+school.nha_name+'" id="'+school.nha_schoolid+'">'+school.nha_name+'</opiton>');
    });
    UpdatedSelectedSchool(); 
}
function ShowYearChoices(data){
    data.forEach(function(year){
        if(year.statuscode===currentAcademicYearStatus){
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

    //remove children from old grade level capacities to update with new
    $('.gradeRows').empty();
    allGradeCapacities.sort(Gradecompare);
    allGradeCapacities.forEach(function(capacity){
        $('.gradeRows').append("<tr class='rowBody' id="+capacity.gradeCapacityId+"><td id=grade"+capacity.nha_grade+">"+capacity.parsedGrade+"<td>"+capacity.pyRooms+"</td><td id=roomDiff_"+capacity.gradeCapacityId+" class='roomDiff' contenteditable=true>"+capacity.nha_roomdifference+"</td><td id='rooms_"+capacity.gradeCapacityId+"'>"+capacity.nha_rooms+"</td><td>"+capacity.pyOfferedCapacity+"</td><td>"+capacity.pyCountDay+"</td><td>"+capacity.nha_newstudentsneeded+"</td><td id=offeredcapacity_"+capacity.gradeCapacityId+" contenteditable>"+capacity.nha_offeredcapacity+"</td><td>"+capacity.nha_studentsperroom+"</td><td>"+capacity.nha_expectedcapacity+"</td><td>"+capacity.nha_enrollmentgoals+"</td></tr>");
    });

}
function ShowNotes(data){
    $('#notes').empty();
    data.forEach(function(note){
        $('#notes').append('<div class=list-group-item id='+note.nha_schoolenrollmentnotesid+'><p class=mb-1>'+note.nha_name+'</p><p class=mb-1>'+note.createdon+'</p><p>'+note.nha_enrollmentcapacitystatus+'</p><p>'+note.nha_notefield+'</p></div>');
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
        $('#nha_roomtotal').html(sec.nha_roomtotal);
        $('#nha_enrollmentgoalstotal').html(sec.nha_enrollmentgoalstotal);
        $('#nha_expectedcapacitytotal').html(sec.nha_expectedcapacitytotal);
        $('#nha_percentageexpected').html( sec.nha_percentageexpected);    
}
function UpdatedSelectedSchool(){
    let selectedSchool = $('#school option:selected');
    SetSchoolId(selectedSchool.id);
    SetSchoolName(selectedSchool.val()); 
    
    UpdateSchoolNameDisplay();
    userSelection();
}
function UpdatedSelectedYear(){
    let selectedYear = $('#academicYear option:selected');

    SetYearId(selectedYear.id);
    SetCurrentYear(selectedYear.val());

    UpdateYearColumns();
    userSelection();
}
function userSelection(){
    if(testing){
        GetSelectedCapacity(schoolCapacity);
        GetNotes(notes);
        GetGradeCapacities(gradeCapacities);
    }
    else{
        GetSelectedCapacity();
        GetNotes();
        GetGradeCapacities();
    }
   
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
    //remove children
    $('#statusReason').empty();
   schoolCapacityStatus.forEach(statusR=>{
       if(statusR.value===statusReason){
        $('#statusReason').append('<option value='+statusR.value+' id='+statusR.value+' default>'+statusR.status+'</option>');
       }
       else{
        $('#statusReason').append('<option value='+statusR.value+' id='+statusR.value+' >'+statusR.status+'</option>');
       }     
   });
    if(status.length===1){
        //replaces html text 
        $('.statusReason').html(status[0].status);

    }
    else{
        $('.statusReason').html(statusReason);
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
        grade.nha_rooms= gradeRoom[0].innerHTML;
        grade.nha_roomdifference= gradeRoomDiff[0].innerHTML;
        grade.nha_offeredcapacity = offeredCapacity[0].innerHTML; 

        //add to array
        gradeUpdates.push(grade);
    }
  
    let SEC_values= {
        "nha_schoolenrollmentcapacityid":currentSchoolCapacity,
        "nha_instructionroomsavailable": $('#nha_instructionroomsavailable').val(),
        "nha_enrollmentmaximum" :  $('#nha_enrollmentmaximum').val()
    }

    fetch(apiURL+'/api/Capacity/SchoolCapacity',{
        method:'Post',
        body:JSON.stringify(SEC_values),
        headers:{'Content-Type':'application/json'},
        accept:"json",
        
    }).then(response=>{
        if(!response.ok){
            alert("Error");
        }
        else if(response.ok){
            alert("School enrollment capacities successfully updated");
        }
    })
    fetch(apiURL+'/api/GradeCapacity/PostGradeCapacities',{
        method:'Post',
        body:JSON.stringify(gradeUpdates),
        headers:{'Content-Type':'application/json'},
        accept:"json",
    }).then(response=>{
        if(!response.ok){
            alert("Error");
        }
        else if(response.ok){
            alert("grade capacities successfully updated");
        }
    })
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
