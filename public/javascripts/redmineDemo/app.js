
var allProject=[];
var allIssues=[];
function loadingNow(){
	$("#loading").show();
}
function loadingNowEnd(){
	$("#loading").hide();
}
function displayProjects(jsonObj){
	jsonEdit=JSON.stringify(jsonObj);
	first = jsonEdit.indexOf('[');
	last = jsonEdit.lastIndexOf(']');
	finalJson = jsonEdit.substring(first+1,last);
	var find = 'name';
	var re = new RegExp(find, 'g');
	finalJson = finalJson .replace(re,"text");
	var json = JSON.parse("["+finalJson+"]");
	for (var i=0; i<json.length; i++) {
		if (json[i].parent === undefined) {
			json[i]["parent"] = "#";
		}
		else{
			tempParent = json[i].parent.id;
			json[i].parent =tempParent;
		}
	}
	$(function () {
		try{
			$('#project_tree').jstree({"plugin":["sort"],'core' : {
				'data' : json
			}}).on('changed.jstree', function (e, data) {
				var i, j, r = [];
				for(i = 0, j = data.selected.length; i < j; i++) {
					r.push(data.instance.get_node(data.selected[i]).id);
				}
				getAllIssuesCount(r.join(', '));
			});
			loadingNowEnd();
		}
		catch(e){

		}

	});
}

function getURLInfo(url, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open (
    "GET",                               
    url,
    true
  );
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
      if (typeof callback == "function") {
        callback.apply(xhr);
      }
    }
  }
  xhr.send();
}


function getAllProjects(total){
	allProject=[];
	$("#tempData").empty();
	$("#tempData").hide();
	i=1;
	function next() {
        try{
	        $.ajax({
	            async: true,
	            url: 'http://redmine.micnguyen.com/projects/'+i+'.json',
	            success: function(r) {
	                if (r!="" || r!=null){
						$("#tempData").append(JSON.stringify(r).substring(JSON.stringify(r).indexOf(":")+1,JSON.stringify(r).lastIndexOf("}"))+"|");
					}
	                ++i;
	                if (i < total+1) {
	                    next();
	                }

	            },
	            error: function(r){
	            	alert("The server is too slow to load... please refresh the browser again");
                    ++i;
	                if (i < total+1) {
	                    next();
	                }
                   
                }
	        });
    	}
    	catch (e){

    	}
    }
    next();
    $(document).ajaxStop(function() {
  		jstring = $("#tempData").html();
    	jstring = jstring.substring(0,jstring.length-1);
    	jArrary = jstring.split("|");
    	finalJson = '{"projects":[';
    	for (var i=0;i<jArrary.length;i++){
    		if (i==0){
				finalJson=finalJson+jArrary[i];
    		}
    		else{
    			finalJson=finalJson+","+jArrary[i];
    		}
    		
    	}
		finalJson = finalJson+"]}";
		passinJson = JSON.parse(finalJson);
		displayProjects(passinJson);
		for (var i=0;i<passinJson.projects.length;i++){
			//alert("here");
			window.allProject.push({id:passinJson.projects[i].id, name:passinJson.projects[i].name});
		}
		$("#tempData").empty();
	});
	return null;
}
function getAllProjectsCount(){
	getURLInfo(
  		"http://redmine.micnguyen.com/projects.json", 
	  	function() {
	    	var resp  = JSON.parse(this.responseText).total_count;
	    	getAllProjects(resp);
  		}
	);
	loadingNow();
}

function getAllIssuesCount(projectID){
	getURLInfo(
  		"http://redmine.micnguyen.com/projects/"+projectID+"/issues.json", 
	  	function() {
	    	var resp  = JSON.parse(this.responseText).total_count;
	    	for (var i=0;i<window.allProject.length;i++){
	    		if (window.allProject[i].id== projectID){
	    			listAllIssues(projectID,resp,window.allProject[i].name);
	    			break;
	    		}
	    	}
	    	
  		}
	); 		
	
	$("#loading").show();
}

function listAllIssues(projectID,total,projectName){
	$("#tempDataIssue").empty();
	$("#tempDataIssue").hide();
	i=0;
	issueTotalList=[];
	function next() {
        try{
	        url = 'http://redmine.micnguyen.com/projects/'+projectID+'/issues.json?offset='+i*25;
	        $.ajax({
	            async: true,
	            url: url,
	            success: function(r) {
	            	
	                if (r!="" || r!=null){
						$("#tempDataIssue").append(JSON.stringify(r)+"|");
					}
	                ++i;
	                if (i < total/25) {
	                    next();
	                }

	            },
	            error: function(r){
	            	alert("The server is too slow to load... please refresh the browser again");
                    ++i;
	                if (i < total/25) {
	                    next();
	                }
                   
                }
	        });
    	}
    	catch (e){
    	}
    }
    function processdata(){
    	jstring = $("#tempDataIssue").html();
    	jstring = jstring.substring(0,jstring.length-1);
    	jArrary = jstring.split("|");
    	for(var i=0;i<jArrary.length;i++){
    		jArrary[i]=JSON.parse(jArrary[i]);
    	}
    	for (var i=0;i<jArrary.length;i++){
    		for (var j=0; j<jArrary[i].issues.length; j++) {
    			issueTotalList.push(jArrary[i].issues[j]);
    		}
    	}
    	window.allIssues= issueTotalList;
    	$("#tempDataIssue").empty();
    	loadingNowEnd();
    }
    var d = $.Deferred();
	$.when( d ).done(function (v) {
    	 $(document).one("ajaxStop", function() {
	    	processdata();
	    	generateReport(window.allIssues,projectName);
    	});
	});
	d.resolve(next());
    
}
	
$( document ).ready(function() {
	getAllProjectsCount();
});

function checkifDue(endDate){
	var date = new Date(endDate);
	var now = new Date();
	if (date > now)
		return true;
	else
		return false;
}

function getPriorityCount(jsonData){
	var flags = [], output = [], l = jsonData.length, i;
	var priorityCount=[];
	for( i=0; i<l; i++) {
    	if( flags[jsonData[i].priority.name ]) continue;
    	flags[jsonData[i].priority.name ] = true;
    	output.push(jsonData[i].priority.name);
	}
	count=0;
	for (var i=0;i<output.length;i++){
		count=0;
		for (var j=0;j<l;j++){
			if (jsonData[j].priority.name == output[i]){
				count++;
			}
		}
		priorityCount.push({
				label: output[i],
				value: count
			});
	}
	return priorityCount;
}

function getStatCount(jsonData){
	var flags = [], output = [], l = jsonData.length, i;
	var Count=[];
	for( i=0; i<l; i++) {
    	if( flags[jsonData[i].status.name ]) continue;
    	flags[jsonData[i].status.name ] = true;
    	output.push(jsonData[i].status.name);
	}
	count=0;
	for (var i=0;i<output.length;i++){
		count=0;
		for (var j=0;j<l;j++){
			if (jsonData[j].status.name == output[i]){
				count++;
			}
		}
		Count.push({
				label: output[i],
				value: count
			});
	}
	return Count;
}
function getTrackCount(jsonData){
	var flags = [], output = [], l = jsonData.length, i;
	var Count=[];
	for( i=0; i<l; i++) {
    	if( flags[jsonData[i].tracker.name ]) continue;
    	flags[jsonData[i].tracker.name ] = true;
    	output.push(jsonData[i].tracker.name);
	}
	count=0;
	for (var i=0;i<output.length;i++){
		count=0;
		for (var j=0;j<l;j++){
			if (jsonData[j].tracker.name == output[i]){
				count++;
			}
		}
		Count.push({
				label: output[i],
				value: count
			});
	}
	return Count;
}

function calcuatePercentage(jsonData){
	var flags = [], output = [], l = jsonData.length, i;
	var percent=0;
	var sum=0;
	for( i=0; i<l; i++) {
		if (jsonData[i].done_ratio!=null || jsonData[i].done_ratio!="" || jsonData[i].done_ratio !== undefined)
			sum= sum+parseInt(jsonData[i].done_ratio);
	}
	percent = Math.round(sum/l);
	return percent;
}

function countOverDue(jsonData){
	var flags = [], output = [], l = jsonData.length, i;
	var sum=0;
	for( i=0; i<l; i++) {
		if (jsonData[i].due_date!=null || jsonData[i].due_date!="" || jsonData[i].due_date !== undefined)
			if (checkifDue(jsonData[i].due_date))
				sum++;
	}
	return sum;
}

function generateReport(jsonData,projectName){
	var totalIssue = jsonData.length;
	var htmlPercentOver="";
	if (totalIssue>0){
		$("#priorityTitle").html("<b>Priority Report: </b>");
		$("#statTitle").html("<b>Status Report: </b>");
		$("#trackTitle").html("<b>Tracker Report: </b>");
		$("#otherTitle").html("<b>Other Report(s): </b>");
		$("#completeTitle").html("Project Completion");
		var htmlPercent='<div class="progress"><div class="progress-bar progress-bar-success" role="progressbar" aria-valuenow="'+calcuatePercentage(jsonData)+'" aria-valuemin="0" aria-valuemax="100" style="width:'+calcuatePercentage(jsonData)+'%">'+calcuatePercentage(jsonData)+'% Completed </div> </div>';
		var percentOver = Math.round((countOverDue(jsonData)/totalIssue)*100);
		//console.log(percentOver);
		if (percentOver<=50)
			htmlPercentOver='<div class="progress"><div class="progress-bar progress-bar-success" role="progressbar" aria-valuenow="'+percentOver+'" aria-valuemin="0" aria-valuemax="100" style="width:'+percentOver+'%"> '+countOverDue(jsonData)+'/'+totalIssue+'</div> </div>';
		if (percentOver>50 && percentOver<=75)
			htmlPercentOver='<div class="progress"><div class="progress-bar progress-bar-warning" role="progressbar" aria-valuenow="'+percentOver+'" aria-valuemin="0" aria-valuemax="100" style="width:'+percentOver+'%"> '+countOverDue(jsonData)+'/'+totalIssue+'</div> </div>';
		if (percentOver>75)
			htmlPercentOver='<div class="progress"><div class="progress-bar progress-bar-danger" role="progressbar" aria-valuenow="'+percentOver+'" aria-valuemin="0" aria-valuemax="100" style="width:'+percentOver+'%"> '+countOverDue(jsonData)+'/'+totalIssue+'</div> </div>';
		$("#showPercent").html(htmlPercent);
		$("#showPercentOver").html(htmlPercentOver);
		$("#duedateTitle").html("<b>Total Over Due Tasks: </b>"+ countOverDue(jsonData)+" out of "+totalIssue);
	}
	else{
		$("#priorityTitle").empty();
		$("#statTitle").empty();
		$("#trackTitle").empty();
		$("#otherTitle").empty();
		$("#completeTitle").empty();
		$("#showPercent").empty();
		$("#duedateTitle").empty();
		$("#showPercentOver").empty();
	}

	var priorityCount=getPriorityCount(jsonData);
	var statCount= getStatCount(jsonData);
	var trackCount= getTrackCount(jsonData);
	

	 $('#chart-priority').remove();
     $('#canvas-holder-priority').html('<canvas id="chart-priority"  width="300" height="300"></canvas>');
	var ctx = document.querySelector("#chart-priority").getContext("2d");
	window.myPie = new Chart(ctx).Pie(priorityCount);
	var priorityLabel="";
	for (var i=0;i<priorityCount.length;i++){
		priorityLabel= priorityLabel+"[<b>" +priorityCount[i].label +":</b> " + priorityCount[i].value+"]     ";
	}
	$("#priorityLabel").html(priorityLabel);
	

	$('#chart-stat').remove();
    $('#canvas-holder-stat').html('<canvas id="chart-stat"  width="300" height="300"></canvas>');
	var ctx = document.querySelector("#chart-stat").getContext("2d");
	window.myDoughnut = new Chart(ctx).Doughnut(statCount);
	var statLabel="";
	for (var i=0;i<statCount.length;i++){
		statLabel= statLabel+"[<b>" +statCount[i].label +":</b> " + statCount[i].value+"]     ";
	}
	$("#statLabel").html(statLabel);

	
	var trackLabel="";
	var dLabel=[];
	var dd =[];
	for (var i=0;i<trackCount.length;i++){
		dLabel.push(trackCount[i].label);
		dd.push(trackCount[i].value);
		trackLabel= trackLabel+"[<b>" +trackCount[i].label +":</b> " + trackCount[i].value+"]     ";
	}
	var dataIn = {labels:[],datasets:[]};
	dataIn.labels= dLabel;
	dataIn.datasets.push({data:dd});
	$('#chart-track').remove();
    $('#canvas-holder-track').html('<canvas id="chart-track"  width="300" height="300"></canvas>');
	var ctx = document.querySelector("#chart-track").getContext("2d");
	window.myBarChart  = new Chart(ctx).Bar(dataIn);
	$("#trackLabel").html(trackLabel);
	

	$("#myProject").html("<h3> "+projectName +"</h3>");
	$("#totalissue").html("<b>The total issue(s) for this current project are: </b>"+totalIssue);

}