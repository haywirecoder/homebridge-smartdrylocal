
const EventEmitter = require('events');
const needle = require('needle');

// URL constant for retrieving data

const AWAKE  = "/sensor/smartdry_awake";
const BATTERY  = "/sensor/smartdry_battery";
const DRYNESS = "/sensor/smartdry_dryness";
const HUMIDITY = "/sensor/smartdry_humidity";
const SHAKE = "/sensor/smartdry_shake";
const TEMPERATURE =  "/sensor/smartdry_temperature";
const ONBOARDLED = "/light/running_light";

class SmartDry extends EventEmitter {
    log;
    refreshHandle;
    refreshTime;
    sensorRefreshHandle;
    smartDryData;
    hostname;
    debug;


    constructor(log, config) {
        super();
        this.log = log;
        this.refreshHandle = null;
        this.sensorRefreshHandle = null;
        this.refreshTime = config.deviceRefresh * 3600000 || 3600000;
        this.hostname = "http://" + config.host;
        this.smartDryData = {};
        
    };

    // Initial login and building of device list 
    async init() {

        this.log.info("Connecting to ESPHome SmartDry server...");
        this.smartDryData.isAlreadyRunning = false;    
    }

    // Start for periodic refresh of devices
    startPollingProcess()
    {
        // Set time to refresh devices
       this.refreshHandle = setTimeout(() => this.backgroundRefresh(), this.refreshTime); 
     
    };

    async backgroundRefresh () { 

        if (this.refreshHandle) 
        {
            clearTimeout(this.refreshHandle);
            this.refreshHandle = null;
        }
   
        // Get current state of the dryer
        this.getDryState().then ( res_init => {
            
            if ((this.smartDryData.awake > 0) && (this.smartDryData.shaking > 0 )) {
                //If dryer is already known to be running, background update for sensor is already stated ignored
                if(!this.smartDryData.isAlreadyRunning) {
                    this.smartDryData.isAlreadyRunning = true;
                    // Start periodically update temperature and humidity levels updates
                    this.getDrySensorData().then ( res_init => {
                        this.log.info(this.smartDryData);
                    });
                    this.emit("smartDryUpdate", {
                        event: "dryerOn",
                        data: this.smartDryData});
                    this.log.info("Dryer running");
                }
            }
            else {
                this.smartDryData.isAlreadyRunning = false;
                 // Dryer is no longer running stop updating sensor values.
                if (this.sensorRefreshHandle) 
                {
                    clearTimeout(this.sensorRefreshHandle);
                    this.sensorRefreshHandle = null;
                }
                this.emit("smartDryUpdate", {
                    event: "dryerOff",
                    data: this.smartDryData});
                this.log.info("Dryer not running");
            }
        });
        if (!initialLoad) this.refreshHandle = setTimeout(() => this.backgroundRefresh(), this.refreshTime); 

    }
    // Combination of both awake and shaking indicate the dryer is running. 
    // Otherwise drying to turned off
    async getDryState() {   
        var url = this.hostname + AWAKE;
        try {
            const response = await needle("get", url);
            var device_response = response;
            if(device_response.statusCode == 200)
                this.smartDryData.awake = device_response.body.value;

        }
        catch(err) {
                // Something went wrong, display message and return negative return code
                this.log.error("SmartDry server return: ", err.message);
                return false;
        } 

        url =  this.hostname + SHAKE;
        try {
            const response = await needle("get", url);
            var device_response = response;
            if(device_response.statusCode == 200)
                this.smartDryData.shaking = device_response.body.value;

        }
        catch(err) {
                // Something went wrong, display message and return negative return code
                this.log.error("SmartDry server return: ", err.message);
                return false;
        } 
    }

    async getDrySensorData() {   
        var l_updateData = false;
        var url = this.hostname + HUMIDITY;
        if (this.sensorRefreshHandle) 
        {
            clearTimeout(this.sensorRefreshHandle);
            this.sensorRefreshHandle = null;
        }

        try {
            const response = await needle("get", url);
            var device_response = response;
            if((device_response.statusCode == 200) && (this.smartDryData.humidity != device_response.body.value))
             {
                this.smartDryData.humidity = device_response.body.value;
                l_updateData = true
             }   

        }
        catch(err) {
                // Something went wrong, display message and return negative return code
                this.log.error("SmartDry server return: ", err.message);
                return false;
        } 

        url =  this.hostname + TEMPERATURE;
        try {
            const response = await needle("get", url);
            var device_response = response;
            if((device_response.statusCode == 200) && ( this.smartDryData.temperature != device_response.body.value))
            {    this.smartDryData.temperature = device_response.body.value;
                 l_updateData = true
            }

        }
        catch(err) {
                // Something went wrong, display message and return negative return code
                this.log.error("SmartDry server return: ", err.message);
                return false;
        } 
        // trigger update only if data actually changed and this not initialization of component.
        if((l_updateData)) { 
            this.emit("smartDryUpdate", {
            event: "sensorUpdate",
            data: this.smartDryData});
        }
        this.sensorRefreshHandle = setTimeout(() => this.getDrySensorData(), this.refreshTime*3);
    }

}
          
module.exports = SmartDry;