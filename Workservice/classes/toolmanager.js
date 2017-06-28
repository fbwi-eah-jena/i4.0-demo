this.ToolManager = function()
{
    this.tools = [];
    
    this.addTool = function(name,url)
    {
        var tool = new tools.Tool(name,url);
        this.tools.push(tool);
        return tool;
    }
    
    this.getSummary = function()
    {
        var summary = [];
        for(tool of this.tools)
        {
            summary.push(tool.getToolSummary());
        }
        return summary;
    }
    
    this.resetAll = function()
    {
        for(tool of this.tools)
        {
            tool.reset();
        }
    }
}

var tools = {
    
    Tool: function(name,url)
    {
        this.name = name;
        this.url = url;
        this.data = new tools.ToolData();
        
        this.reset = function()
        {
            this.data.params = [];
        }
        
        this.addValue = function(param,value)
        {
            this.data.addParamValue(param,value);
        }
        
        this.getToolSummary = function()
        {
            var params = [];
            for(param of this.data.params)
            {
                params.push(param.getSummary());
            }
            var toolSummary = {
                "name" : this.name,
                "data" : params
            }
            return toolSummary;
        }
    },
    
    ToolData: function()
    {
        this.params = [];
        
        this.addParamValue = function(paramName, value)
        {
            //find param in array of params
            var paramToBeFilled = null;
            for(param of this.params)
            {
                if(param.name == paramName)//parameter found
                {
                    paramToBeFilled = param;
                    break;
                }
            }
            if(paramToBeFilled==null)//if param is not existing yet
            {
                paramToBeFilled = new tools.Parameter(paramName);
                this.params.push(paramToBeFilled);
            }
            paramToBeFilled.addValue(value);
        }
    },
    
    Parameter: function(paramName)
    {
        this.name=paramName;
        this.values = [];
        
        this.addValue = function(value)
        {
            if(this.values.length == 500)//max number of values to be stored
            {
                this.values.shift();//remove the oldest element
            }
            this.values.push(value);
        };
        
        this.getLastValue = function()
        {
            var valToBeReturned = null;
            if(this.values.length>0)
            {
                valToBeReturned = this.values[this.values.length-1];
            }
            return valToBeReturned;
        }
        
        this.getMinValue = function()
        {
            var currentMin = null;
            for(value of this.values)
            {
                if(currentMin==null || currentMin > value)
                {
                    currentMin = value;
                }
            }
            return currentMin;
        }
        
        this.getMaxValue = function()
        {
            var currentMax = null;
            for(value of this.values)
            {
                if(currentMax==null || currentMax < value)
                {
                    currentMax = value;
                }
            }
            return currentMax;
        }
        
        this.getAvg = function()
        {
            var sum = this.values.reduce(function(sum, value){
              return sum + value;
            }, 0);

            var avg = sum / this.values.length;
            return avg;
        }
        
        this.getStDev = function()
        {
            var avg = this.getAvg();
            var squareDiffs = this.values.map(function(value){
              var diff = value - avg;
              var sqr = diff * diff;
              return sqr;
            });
            var sumSquaredDiffs = squareDiffs.reduce(function(sum, value){
              return sum + value;
            }, 0);
            var avgSquaredDiffs = sumSquaredDiffs / squareDiffs.length;
            var stdDev = Math.sqrt(avgSquaredDiffs);
            return stdDev;
        }
        
        this.getSummary = function()
        {
            var summary = {
                "name" : this.name,
                "lastValue" : this.getLastValue(),
                "min" : this.getMinValue(),
                "max" : this.getMaxValue(),
                "avg" : this.getAvg(),
                "stdev" : this.getStDev(),
                "count" : this.values.length
            }
            return summary;
        }
    }
}