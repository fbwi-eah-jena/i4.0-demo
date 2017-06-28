//classes
this.Client = function()
{
    this.socket=null;
    this.user=null;
}

this.User = function()
{
    this.userName="";
    this.currentWorkTask=null;

    this.setCurrentWorkTask = function(id)
    {
        this.currentWorkTask = new tasks.Task(); 
        this.currentWorkTask.id = id;
    };
}

//namespace "tasks"
var tasks = 
{
    //class Task in namespace
    Task: function()
    {
        this.id="";
    }
}