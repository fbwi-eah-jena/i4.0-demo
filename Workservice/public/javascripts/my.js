var taskgroupTemplateHTML = "";
var taskTemplateHTML = "";
var taskComponentTemplateHTML = "";
var noTasksAvailableTemplateHTML = "";
var worktaskTemplateHTML = "";
var processDataTemplateHTML = "";
var toolDataTemplate = "";
var workTaskComponentTemplateHTML = "";
var currentMyTaskList = null;
var socket;
var userId = null;
var workingstation = null;

$(document).ready(function(){
    
    $.when(
            $.get("templates/taskgroup.template.html",function(data){
                taskgroupTemplateHTML=data;
            }),
            $.get("templates/task.template.html",function(data){
                taskTemplateHTML=data;
            }),
            $.get("templates/taskComponent.template.html",function(data){
                taskComponentTemplateHTML=data;
            }),
            $.get("templates/taskList.notasks.template.html",function(data){
                noTasksAvailableTemplateHTML=data;
            }),
            $.get("templates/worktask.template.html",function(data){
                worktaskTemplateHTML=data;
            }),
            $.get("templates/processData.template.html",function(data){
                processDataTemplateHTML=data;
            }),
            $.get("templates/toolData.template.html",function(data){
                toolDataTemplateHTML=data;
            }),
            $.get("templates/workTaskComponent.template.html",function(data){
                workTaskComponentTemplateHTML=data;
            })
            ).then (function(){
        
            // WebSocket connection...
            socket = io.connect();

            socket.on('connect', function(){
                //register userName for current connection
                console.log('web socket connection established... ');
            }); 
            socket.on('userid', function (data){
                console.log('current userid: '+userId);
                console.log('receiving userName from server: '+data);
                userId = data;//set global userid to current userName
                console.log('registering userId '+userId);
                $("#userId").html(userId);//display userid
                socket.emit("register", userId);
                
                socket.on('workingstation', function (data) {
                    console.log("received workingstation name from server: '"+data+"'");
                   workingstation = data;
                });
                
                // register user-related events
                socket.on('workflow/tasklist/user/'+userId, function (data) {
                    console.log("received tasklist data through web sockets connection...");
                    console.log(data);
                    buildTaskList($.parseJSON(data),"all_tasks");
                });
                socket.on('workflow/mytasklist/user/'+userId, function (data) {
                    console.log("received mytasklist data through web sockets connection...");
                    console.log(data);
                    currentMyTaskList = $.parseJSON(data);
                    buildTaskList(currentMyTaskList,"my_tasks");
                });
                socket.on('workflow/do/user/'+userId, function (data) {
                    console.log("received task to be done by user...");
                    console.log(data);
                    var workTasks = JSON.parse(data);//returns an array of task ids
                    console.log("number of tasks to be done: "+workTasks.length);
                    showWorkTask(workTasks[0]);//show first task
                    //navigate to work tab
                    $("#nav_work_tasks").trigger('click');
                });
                socket.on('workflow/complete/user/'+userId, function (data) {
                    console.log("received task completion notification...");
                    console.log(data);
                    //navigate to myTasks tab
                    $("#nav_my_tasks").trigger('click');
                    resetWorkTaskTab();
                });

            });
            socket.on('disconnect', function (){
                console.log('web socket disconnected...')
            });
            socket.on('toolData', function (data) {
                updateProcessData(data);
            });
    });
    //initialize nav buttons
    $('#nav_all_tasks').click(function(){
        $(this).toggleClass( "active" );
        $("#my_tasks").hide();
        $("#work_tasks").hide();
        $("#nav_work_tasks").removeClass( "active" );
        $('#all_tasks').fadeIn();
        $("#nav_my_tasks").removeClass( "active" );
    });
    $('#nav_my_tasks').click(function(){
        $(this).toggleClass( "active" );
        $("#all_tasks").hide();
        $("#nav_all_tasks").removeClass( "active" );
        $("#work_tasks").hide();
        $("#nav_work_tasks").removeClass( "active" );
        $('#my_tasks').fadeIn();
    });
    $('#nav_work_tasks').click(function(){
        $(this).toggleClass( "active" );
        $("#all_tasks").hide();
        $("#nav_my_tasks").removeClass( "active" );
        $("#my_tasks").hide();
        $("#nav_my_tasks").removeClass( "active" );
        $('#work_tasks').fadeIn();
    });
});

function buildTaskList(tasklist,divContainerId)
{

    var numberOfTasks = 0;
    if(tasklist.tasks != null)//value is not null
    {
        var taskgroups = tasklist.tasks.reduce(function(result, current) {//group by function for json arrays
                        result[current.name] = result[current.name] || [];
                        result[current.name].push(current);
                        return result;
                    }, {});

        var taskgroupId = 0;
        
        $("#"+divContainerId).html("");//clear html code
        $.each(taskgroups, function(key, taskgroup){ 

                //fill taskgroup data
                taskgroupId++;        
                var taskgroupName = key;
                var thisTaskgroupHTML = taskgroupTemplateHTML;
                thisTaskgroupHTML = thisTaskgroupHTML.replace(/#{TASKGROUP_NAME}/g,taskgroupName);
                thisTaskgroupHTML = thisTaskgroupHTML.replace(/#{TASKGROUP_SIZE}/g,taskgroup.length);
                thisTaskgroupHTML = thisTaskgroupHTML.replace(/#{TASKGROUP_ID}/g,taskgroupId);
                thisTaskgroupHTML = thisTaskgroupHTML.replace(/#{TASKGROUP_TYPE}/g,divContainerId);
                var taskGroupActionFunctionName = "claimTasks";
                var taskGroupActionButtonName = "Claim";
                var taskListMultiSelectOption = "data-toggle=\"items\"";
                var taskGroupProcessIcon = "hand-down";
                if(divContainerId=="my_tasks")
                {
                    taskGroupActionFunctionName = "doTasks";
                    taskGroupActionButtonName = "Do";
                    taskListMultiSelectOption = "";//no multi select
                    taskGroupProcessIcon = "play";
                }

                thisTaskgroupHTML = thisTaskgroupHTML.replace(/#{TASKGROUP_ACTION}/g,taskGroupActionFunctionName);
                thisTaskgroupHTML = thisTaskgroupHTML.replace(/#{TASKGROUP_ACTION_NAME}/g,taskGroupActionButtonName);
                thisTaskgroupHTML = thisTaskgroupHTML.replace(/#{TASK_LIST_MULTI_SELECT}/g,taskListMultiSelectOption);
                thisTaskgroupHTML = thisTaskgroupHTML.replace(/#{TASKGROUP_PROCESS_ICON}/g,taskGroupProcessIcon);

                //fill in tasks of the current taskgroup
                var allTasksHTML = "";
                $.each(taskgroup,function(taskNumber, task){
                    var thisTaskHTML = taskTemplateHTML;
                    thisTaskHTML = thisTaskHTML.replace(/#{TASKGROUP_TYPE}/g,divContainerId);
                    thisTaskHTML = thisTaskHTML.replace(/#{TASKGROUP_ID}/g,taskgroupId);
                    thisTaskHTML = thisTaskHTML.replace(/#{TASK_ID}/g,task.id);
                    thisTaskHTML = thisTaskHTML.replace(/#{PRODUCT_ID}/g,task.productId);
                    var taskTime = (new Date() - new Date(task.startTime))/1000;//in minutes
                    var taskTimeUnit = (taskTime > 60) ? "min" : "sec";
                    if(taskTimeUnit=="min")
                        taskTime /= 60;
                    taskTime = Math.round(taskTime);
                    thisTaskHTML = thisTaskHTML.replace(/#{TASK_TIME}/g,taskTime+" "+taskTimeUnit);

                    //fill in all components
                    var allComponentsHTML = "";
                    $.each(task.components, function(componentNumber,component){
                            var thisComponentHTML = taskComponentTemplateHTML;
                            thisComponentHTML = thisComponentHTML.replace(/#{COMPONENT_NAME}/g,component.name);
                            thisComponentHTML = thisComponentHTML.replace(/#{COMPONENT_VALUE}/g,component.value);
                            allComponentsHTML += thisComponentHTML;
                           });
                    thisTaskHTML = thisTaskHTML.replace(/#{TASK_COMPONENTS}/g,allComponentsHTML);
                    allTasksHTML += thisTaskHTML;
                    numberOfTasks++;       
                });

                thisTaskgroupHTML = thisTaskgroupHTML.replace(/#{TASKS_LIST}/g,allTasksHTML);

                $("#"+divContainerId).append(thisTaskgroupHTML);
                console.log("taskgroup "+key);
        });
        //refresh listgroup multi select functionality
        $('.list-group').listgroup();
    }
    else
    {
        $("#"+divContainerId).html(noTasksAvailableTemplateHTML);
    }
    $("#"+divContainerId+"_badge").html(numberOfTasks);
}

function claimTasks(taskGroupId)
{
    console.log("claiming tasks for group '"+taskGroupId+"'");
    //get selected tasks from html-list conteainer
    var taskArray = new Array();
    $.each($(".active.task_group_all_tasks_"+taskGroupId), function(key, element){
        //id has the structure... "taskid_53525_pid_4711" (means four elements)
        var taskDataArray = element.id.split("_");
        var thisTaskId = taskDataArray[1];
        var thisProductId = taskDataArray[3];
        console.log("task to be claimed: "+thisTaskId+" productID: "+thisProductId+ " workingstation: "+workingstation);
        let thisTaskObject = {id: thisTaskId, productId: thisProductId, workingstation: workingstation};
        taskArray.push(thisTaskObject);
    });
    //send claim message to server
    if(taskArray.length>0)
    {
        console.log("sending tasklist to server... "+JSON.stringify(taskArray));
        let claimedTasksObject = {claimedtasks: taskArray};
        socket.emit("claim",JSON.stringify(claimedTasksObject));
        //socket.emit("claim","{\"task_id\",\"workingstation\" : 19,\"productId\": \"44\"}");
    }
}

//at the moment only one task can be selected (no multiple select possible)
function doTasks(taskGroupId)
{
    console.log("doing tasks for group '"+taskGroupId+"'");
    //get selected tasks from html-list conteainer
    var taskArray = new Array();
    $.each($(".active.task_group_my_tasks_"+taskGroupId), function(key, element){
        var taskNameArray = element.id.split("_");
        var thisTaskId = taskNameArray[1];
        console.log(thisTaskId);
        taskArray.push(thisTaskId);
    });
    //send claim message to server
    if(taskArray.length>0)
    {
        console.log("sending tasklist to work to server");
        socket.emit("do",JSON.stringify(taskArray));
    }
}

function completeTask(taskId)
{
    console.log("completing task with id: "+taskId);
    var currentTask = getTaskFromMyTasksList (taskId);
    if(currentTask!=null)
    {
      socket.emit("complete",JSON.stringify(currentTask));  
    }
}


function showWorkTask(taskId)
{
    console.log("showing workTask '"+taskId+"'");
    var currentWorkTask = getTaskFromMyTasksList(taskId);
    
    if(currentWorkTask!=null)//if task is a known task in myTaskList
    {
        $("#work_tasks_badge").html("1");//show that there is one task that is currently done
        var thisWorkTaskHTML = worktaskTemplateHTML;
        thisWorkTaskHTML = thisWorkTaskHTML.replace(/#{TASK_NAME}/g,currentWorkTask.name);
        thisWorkTaskHTML = thisWorkTaskHTML.replace(/#{TASK_ID}/g,currentWorkTask.id);
        thisWorkTaskHTML = thisWorkTaskHTML.replace(/#{PRODUCT_ID}/g,currentWorkTask.productId);
        var taskTime = new Date(currentWorkTask.startTime);
        thisWorkTaskHTML = thisWorkTaskHTML.replace(/#{TASK_TIME}/g,taskTime.toLocaleTimeString());
        var componentsList = "";
        $.each(currentWorkTask.components, function(key, element){
            var thisTaskComponentHTML = workTaskComponentTemplateHTML;
            thisTaskComponentHTML = thisTaskComponentHTML.replace(/#{COMPONENT_NAME}/g,element.name);
            thisTaskComponentHTML = thisTaskComponentHTML.replace(/#{COMPONENT_VALUE}/g,element.value);
            componentsList += thisTaskComponentHTML;
        });
        thisWorkTaskHTML = thisWorkTaskHTML.replace(/#{TASK_COMPONENTS}/g,componentsList);
        var thisProcessDataHTML = "";//leave it empty... will be filled and updated when new data arrives through web socket connection 
        thisWorkTaskHTML = thisWorkTaskHTML.replace(/#{PROCESS_DATA_LIST}/g,thisProcessDataHTML);
        $("#work_tasks").html(thisWorkTaskHTML);
    }
}

function updateProcessData(dataAsJSON)
{
    //console.log("updating process data "+dataAsJSON);
    var dataObj = JSON.parse(dataAsJSON);
    updateSensorData(dataObj);
    //create new ui component
    var thisProcessDataHTML = processDataTemplateHTML;
    thisProcessDataHTML = thisProcessDataHTML.replace(/#{TOOL_NAME}/g,dataObj.name);
    var paramsList = "";
    $.each(dataObj.data, function(key, element){
        var thisToolDataHTML = toolDataTemplateHTML;
        thisToolDataHTML = thisToolDataHTML.replace(/#{PARAM_NAME}/g,element.name);
        thisToolDataHTML = thisToolDataHTML.replace(/#{PARAM_LAST_VALUE}/g,element.lastValue);
        thisToolDataHTML = thisToolDataHTML.replace(/#{PARAM_MIN_VALUE}/g,element.min);
        thisToolDataHTML = thisToolDataHTML.replace(/#{PARAM_MAX_VALUE}/g,element.max);
        thisToolDataHTML = thisToolDataHTML.replace(/#{PARAM_AVG_VALUE}/g,element.avg);
        thisToolDataHTML = thisToolDataHTML.replace(/#{PARAM_STDEV_VALUE}/g,element.stdev);
        thisToolDataHTML = thisToolDataHTML.replace(/#{PARAM_VALUE_COUNT}/g,element.count);
        paramsList += thisToolDataHTML;
    });
    thisProcessDataHTML = thisProcessDataHTML.replace(/#{TOOL_DATA}/g,paramsList);
    
    var uiComponent = $("#process_data_"+dataObj.name);
    //console.log("uiComponent: "+uiComponent + "length: "+uiComponent.length);
    if(uiComponent.length===0)//if tool is not shown yet
    {
        $("#process_data").append(thisProcessDataHTML);
    }
    else
    {
        $("#process_data_"+dataObj.name).replaceWith(thisProcessDataHTML);
    }
    
}

function resetWorkTaskTab()
{
    console.log("resetting work task tab");
    $("#work_tasks_badge").html("0");//show that there no task currently done
    $("#work_tasks").html(noTasksAvailableTemplateHTML);
    
}

function getTaskFromMyTasksList (taskId)
{
    var taskToBeFound = null;
    console.log("searching for task with id "+taskId);
    $.each(currentMyTaskList.tasks, function(key, element){
        if(element.id==taskId)
        {
            console.log("task found with id "+taskId);
            taskToBeFound = element;
        }
    });
    return taskToBeFound;
}

function refreshAllTasksList()
{
    socket.emit("complete",JSON.stringify(currentTask)); 
}