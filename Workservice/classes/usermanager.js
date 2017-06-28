var usertasks = require('./usertasks.js');

this.UserManager = function()
{
    this.currentClients = new Array();
    this.currentClientId = 0;
    
    this.registerConnection = function(socket)
    {
        var thisClient = this.getClient(socket);
        if(thisClient == null)// if client is not registered yet
        {
            thisClient = new usertasks.Client();
            this.currentClientId++;
            socket.id = this.currentClientId;
            thisClient.socket = socket;
            console.log("new client connected, clientId: '"+thisClient.socket.id+"'");
            this.currentClients.push(thisClient);
            console.log("current number of clients: '"+this.currentClients.length+"'");
        }
        return thisClient;
    };
    
    this.unregisterConnection = function(socket)
    {
        console.log("going to remove client from list...");
        for(i=0;i<this.currentClients.length;i++)
        {
            if(this.currentClients[i].socket.id==socket.id)
            {
                //delete object from array
                console.log("removing current client with clientId '"+socket.id+"'");
                this.currentClients.splice(i,1);
                console.log("after removing... current number of clients: "+this.currentClients.length);
                break;
            }
        }
    };
    
    this.getClient = function(socket)
    {
        var clientToBeFound = null;
        for(i=0;i<this.currentClients.length;i++)
        {
            if(this.currentClients[i].socket.id==socket.id)
            {
                //client already found in list of connections
                clientToBeFound = this.currentClients[i];
                break;
            }
        }
        return clientToBeFound;
    };
    
    this.assignUser = function(socket, userName)
    {
        console.log("going to assign user to client...");
        
        var user = this.findUser(userName);
        if(user==null)
        {
            user = new usertasks.User();
            user.userName = userName;
            //assign user object to client object of the corrent socket connection
            var client = this.getClient(socket);
            if(client != null)
            {
                client.user = user;
            }
        }
    }
    
    this.findUser = function(userName)
    {
        var userToBeFound = null;
        //find user object in list of all clients
        for(i=0;i<this.currentClients.length;i++)
        {
            if(this.currentClients[i].user!=null && this.currentClients[i].user.userName==userName)
            {
                console.log("user found");
                userToBeFound = this.currentClients[i].user;
                break;
            }
        }
        return userToBeFound;
    }
}