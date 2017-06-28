var sensors = [];

function updateSensorData(data)
{
    var sensorAlreadyKnown = false;
    for(sensor of sensors)
    {
        if(sensor.name == data.name)
        {
            sensor = data;
        }
    }
    if(!sensorAlreadyKnown)
    {
        sensors.push(data);
    }
}