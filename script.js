let schoolid;
let yearid;
let currentSchoolCapacity; 
let lastSchoolCapacity;
let statusReason;
let pastYear;
let currentYear;
let schoolName;


$(document).ready(function (){
    debugger;
    GetSchools(schools);
    GetAcademicYears(years);
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
    if(yearData!=null|| undefined){
        fetch('/api/data/v9.2/nha_academicyears?$select=nha_academicyearid,nha_name,nha_value,statuscode&$filter=(statecode eq 0)&$orderby=nha_name asc').then(response=>response.json()).then(data=>{

         });
    }
    FillYearChoices(yearData);
   

}
function GetSelectedCapacity(){
    fetch('/api/data/v9.2/nha_schoolenrollmentcapacities?$select=nha_schoolenrollmentcapacityid,nha_name,statuscode,nha_roomtotal,nha_percentageexpected,nha_instructionroomsavailable,nha_expectedcapacitytotal,nha_enrollmentmaximum,nha_enrollmentgoalstotal&$filter=(_nha_school_value eq '+schoolid+' and _nha_academicyear_value eq '+yearid +')&$orderby=nha_name asc').then(response=>response.json()).then(data=>{
        //update schoolcapacityvalues
        UpdateSchoolCapacityValues(data);
        GetNotes();
    })
    
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
   
}
function FillYearChoices(data){
    data.forEach(function(year){
        //check against current
        if(year.statuscode==="current"){
            $('#academicYear').append('<option value="'+year.nha_value+'" id="'+year.nha_academicyearid+'" default>"'+ year.nha_name+'"</option>');
        }
        else{
            $('#academicYear').append('<option value="'+year.nha_value+'" id="'+year.nha_academicyearid+'">"'+ year.nha_name+'"</option>');
        }
       
    });
}
function UpdateSchoolCapacityValues(data){
    //update fields
    if(data[0].value.count==1){
        let sec = data[0].value;
        schoolCapacity = sec;
        currentSchoolCapacity = sec.nha_schoolenrollmentnotesid;

        $('#nha_enrollmentmaximum').value= sec.nha_enrollmentmaximum;
        $('#nha_instructionroomsavailable').value = sec.nha_instructionroomsavailable;
    
        //read only info
        $('#nha_roomtotal').value= sec.nha_roomtotal;
        $('#nha_enrollmentgoalstotal').value=sec.nha_enrollmentgoalstotal;
        $('#nha_expectedcapacitytotal').value=sec.nha_expectedcapacitytotal;
        $('#nha_percentageexpected').value= sec.nha_percentageexpected; 
    
        UpdateLookupFields();
        GetLastYearCapacity();
    }
   
}
function ShowNotes(data){
    data[0].value.forEach(function(note){
        $('#notes').append('<div id='+note.nha_schoolenrollmentnotesid+'><p>'+note.nha_name+'</p><p>'+note.createdon+'</p><p>'+note.nha_enrollmentcapacitystatus+'</p><p>'+note.nha_notefield+'</p></div>');
    });
}
function UpdatedSelectedSchool(){
    schoolid = $('#school').selectedOption; 
     //await to have both and then get grade capacities
    GetSelectedCapacity()
    GetLastYearCapacity();
}
function UpdatedSelectedYear(){
    yearid = $('#year').selectedOption.id;
    currentYear = yearid.value; 
    pastYear= currentYear-1;

    //get prior year school enrollment capacity
    //await to have both and then get grade capacities
    GetSelectedCapacity();
    GetLastYearCapacity();
}
function GetSchoolCapacityLookups(schoolCapacity){
    fetch(apiURL + '/api/Capacity/GetSchoolCapacity?schoolCapacityID=' + schoolCapacity).then(response => response.json()).then(data => {
        UpdateLookupFields(data);
        GetLastYearCapacity();
    });
}
function GetLastYearCapacity(){

    fetch('api/data/v9.2/nha_schoolenrollmentcapacities?$select=nha_schoolenrollmentcapacityid,nha_name,createdon&$expand=nha_academicyear()&$filter=(_nha_school_value eq '+schoolid+') and (nha_academicyear/nha_value eq '+pastYear+')&$orderby=nha_name asc').then(response=>response.json()).then(data=>{
        lastSchoolCapacity =  data.nha_schoolenrollmentcapacityid;
        GetGradeCapacities();
    })
}
function UpdateYearColumns(){
    $('.priorYear').append(pastYear);
    $('.currentYear').append(currentYear); 
}
function UpdateSchoolInfo(){
    $('.schoolName').append(schoolName);
}
function UpdateStatus(){
    //looks against values in optionSets.js
    var status = schoolCapacityStatus.filter(status => status.value === statusReason);
    if (statusReason === 126990007 || statusReason === 126990005) {
        $('#submitForm').removeClass("hidden");
    }
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
            return condensedRow;
        }
        else{
            condensedRow =  cyCapacity;
            condensedRow.parsedGrade = GetGradeValue(cyCapacity.nha_grade);
            return condensedRow;
        }
    });

    allGradeCapacities.sort(Gradecompare);
    allGradeCapacities.forEach(function(capacity){
        $('.gradeRows').append("<tr class='rowBody' id=gradeRow"+capacity.nha_grade+"><td id=grade"+capacity.nha_grade+">"+capacity.parsedGrade+"<td>"+capacity.pyRooms+"</td><td>"+capacity.nha_roomdifference+"</td><td>"+capacity.nha_rooms+"</td><td>"+capacity.pyOfferedCapacity+"</td><td>"+capacity.pyCountDay+"</td><td>"+capacity.nha_newstudentsneeded+"</td><td>"+capacity.nha_offeredcapacity+"</td><td>"+capacity.nha_studentsperroom+"</td><td>"+capacity.nha_expectedcapacity+"</td><td>"+capacity.nha_enrollmentgoals+"</td></tr>");
    });

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

    //fix this logic
    event.preventDefault();
    /*
    let selectedOption = $( "input:checked" ).val();
    let notes=  $('#userNotes').val();
    var removeWhiteSpace = notes.trim();
    let preventSubmit = false;
    if($('#userNotes').prop('required')===true){
        if(removeWhiteSpace===""){
            alert('Notes are required if you decide to reject the grade capacities');
            preventSubmit = true;
        }
    }
    else if(selectedOption===undefined){
        alert('You most select either "approve" or "reject" to be able to submit');
        preventSubmit = true;
    }
    if (!preventSubmit) {
        var checked = $("input:checked");
        let valueChecked = checked.val();
        sendValues(valueChecked, notes);
    }*/
  

}
function sendValues(valueChecked,notes){

    let data={
        decision:valueChecked,
        decisionNotes: notes,
        user:"",
        school:schoolName,
        status:statusReason
    };

    fetch(apiURL+'/api/Capacity/Post?schoolCapacityid='+currentSchoolCapacity,{
        headers:{
            'Content-Type':'application/json'
        },
        body: JSON.stringify(data),
        method:'post'
    }).then(response=>{
        alert("submission received");
        location.reload();
      //  var frm = document.getElementById('submitForm')[0];
        //frm.reset();  // Reset all form data
 
    });
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
function UpdateLookupFields(){

    pastYear= currentYear-1;

    schoolid= schoolCapacity.nha_school;
    schoolName = schoolCapacity.schoolName;

    statusReason= schoolCapacity.statuscode;

    UpdateSchoolInfo();
    UpdateYearColumns();
    UpdateStatus();
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


