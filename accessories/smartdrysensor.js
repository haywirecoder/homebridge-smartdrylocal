"use strict";
const manufacturerID = "01AE";

class smartDrySensor {
    constructor(sd, device, config, log, Service, Characteristic, UUIDGen, Homebridge) {
    this.Characteristic = Characteristic;
    this.Service = Service;
    this.name = device.name;
    //use the smartdry bluetooth manufacturerID combine with local IP address to create unique name
    this.deviceid = device.deviceId;
    this.log = log;
    this.uuid = UUIDGen.generate(this.deviceid);
    this.dryerActive = false;
    this.currentTemperature = 0;
    this.currentHumidity = 0;

    
    // Register sensor for updates
    this.sd = sd;
    this.sd.on("smartDryUpdate", this.refreshState.bind(this));
  }

  refreshState(eventData)
  {
    this.log(`Device updated requested: ` , eventData);
    var outletService = this.accessory.getService(this.Service.Outlet);
    var batteryService = this.accessory.getService(this.Service.Battery);
    var tempService = this.accessory.getService(this.Service.TemperatureSensor);
    var humService = this.accessory.getService(this.Service.HumiditySensor);


    switch (eventData.event) {
      case "dryerOn":
        // if dry is already ON skip
        if(this.dryerActive) break;

        // When Dryer starts create accessories for battery, temperature and humidity 
        this.log.info('refreshState: Adding Services');
        this.dryerActive = true;
        if(batteryService == undefined) {
          batteryService = this.accessory.addService(this.Service.Battery, "Battery Level"); 
          outletService.addLinkedService(batteryService);
        }
        // create handlers for required characteristics
        batteryService.getCharacteristic(this.Characteristic.StatusLowBattery)
          .on('get', async callback => this.getStatusLowBattery(callback));
        batteryService.getCharacteristic(this.Characteristic.BatteryLevel)
          .on('get', async callback => this.getBatteryLevel(callback));
        // Add temperature sensor
        if (tempService == undefined) {
          tempService = this.accessory.addService(this.Service.TemperatureSensor, "Dryer Temperature");  
          outletService.addLinkedService(tempService);
        }
        // create handlers for required characteristics
        tempService.getCharacteristic(this.Characteristic.CurrentTemperature)
            .on('get', async callback => this.getCurrentTemperature(callback));
  
        // Add Humidity sensor
        if (humService == undefined) {
          humService = this.accessory.addService(this.Service.HumiditySensor, "Dryer Humidity");  
          outletService.addLinkedService(humService);
        }
        // create handlers for required characteristics
        humService.getCharacteristic(this.Characteristic.CurrentRelativeHumidity)
            .on('get', async callback => this.getCurrentRelativeHumidity(callback));
        // turn ON dry accessory
        outletService.updateCharacteristic(this.Characteristic.On,this.dryerActive);

      break;

      case "dryerOff":
        // if dry is already OFF skip
        if(!this.dryerActive) break;

        // When try is turn OFF remove the supporting services
        this.log.info('refreshState: Removing Services');
        this.dryerActive = false;
        if(batteryService != undefined) this.accessory.removeService(batteryService);
        // Remove service if already created in cache accessory
        tempService = this.accessory.getService(this.Service.TemperatureSensor);
        if (tempService!= undefined) this.accessory.removeService(tempService);
        humService = this.accessory.getService(this.Service.HumiditySensor);
        if (humService != undefined) this.accessory.removeService(humService);  
        // turn OFF dry accessory
        outletService.updateCharacteristic(this.Characteristic.On,this.dryerActive);
      break;

      case "sensorUpdate":
        // if dry is  off skip (should never happend)
        if(!this.dryerActive) break;
        his.log.info('refreshState: Updating sensor');
        this.currentTemperature = eventData.data.temperature;
        this.currentHumidity = eventData.data.humidity;
      break;

    }
   
  }

  setAccessory(accessory) {
    this.accessory = accessory;
    this.accessory.getService(this.Service.AccessoryInformation)
        .setCharacteristic(this.Characteristic.Manufacturer, 'SmartDry')
        .setCharacteristic(this.Characteristic.Model, 'SmartDry ')
        .setCharacteristic(this.Characteristic.SerialNumber, this.deviceid);
    
    var outletService = this.accessory.getService(this.Service.Outlet);
    if(outletService == undefined) outletService = this.accessory.addService(this.Service.Outlet,this.name); 
    outletService.setCharacteristic(this.Characteristic.Name, this.name); 
    outletService.getCharacteristic(this.Characteristic.On)
          .on("get",  async callback => this.getPowerState(callback))
          .on('set', async (state, callback) => this.setPowerState(state, callback));   

  }

  // Handle requests to set and get the current value of the for outlet
  async setPowerState(value,callback){
    this.log('setPowerState: Dryer State - ', this.dryerActive);
    var outletService = this.accessory.getService(this.Service.Outlet);
    setTimeout(function () {outletService.updateCharacteristic(this.Characteristic.On,this.dryerActive)}.bind(this),1000);
    return callback(null);
  }

  async getPowerState(callback) {
   
    return callback(null, this.dryerActive);
  }

  // Handle requests to get the current value of the "Status Low Battery" characteristic
  async getStatusLowBattery(callback) {
  
    var currentValue = this.Characteristic.StatusLowBattery.BATTERY_LEVEL_NORMAL;
    this.log.debug('getStatusLowBattery  StatusLowBattery - ', currentValue);
    return callback(null, currentValue);
  }
  async getBatteryLevel(callback) {
    this.log.debug('getBatteryLevel: BatteryLevel - ');
    // set this to current battery level
    const currentValue =  100;
    return callback(null, currentValue);
  }
   //Handle requests to get the current value of the "Current temperature" characteristic
   async getCurrentTemperature(callback) {
    // set this to a valid value for CurrentTemperature
    return callback(null,this.currentTemperature);
  }

  //Handle requests to get the current value of the "Current Relative Humidity" characteristic
  async getCurrentRelativeHumidity (callback) {
    return callback(null,this.currentHumidity);
  }
  
}
module.exports = smartDrySensor;