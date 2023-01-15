"use strict";
const smartdryengine = require('./smartdrymain');
const smartdrysensor = require('./accessories/smartdrysensor');

const PLUGIN_NAME = 'homebridge-smartdrylocal';
const PLATFORM_NAME = 'SmartDryLocal';
const manufacturerID = "01AE";


var Service, Characteristic, HomebridgeAPI, UUIDGen;

module.exports = function(homebridge) {

  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  HomebridgeAPI = homebridge;
  UUIDGen = homebridge.hap.uuid;
  homebridge.registerPlatform(PLUGIN_NAME, PLATFORM_NAME, SmartDryPlatform);
}

class SmartDryPlatform {
  constructor(log, config, api) {
  this.log = log;
  this.api = api;
  this.name = config.name;
  this.config = config;
  this.accessories = [];
  this.smartDryDevice = {};
  
  // Check if authentication information has been provided.
  try{
    if (this.config.host == "")
    {
      this.log.error('Plug-in configuration error: Smartdry local host information not provided.');
      // terminate plug-in initialization
      return;
    }
  }
  catch(err) {
    this.log.error('Plug-in configuration error: Smartdry local host information not provided.');
    // terminate plug-in initialization
    return;
  }

  this.smartDryDevice.name = this.config.name ? config.name : "SmartDry";
  this.smartDryDevice.deviceId = manufacturerID +"."+ this.config.host;
  this.sd = new smartdryengine (log, this.config);
 
  // When this event is fired it means Homebridge has restored all cached accessories from disk.
  // Dynamic Platform plugins should only register new accessories after this event was fired,
  // in order to ensure they weren't added to homebridge already. This event can also be used
  // to start discovery of new accessories.
  api.on('didFinishLaunching', () => {

    this.initialLoad =  this.sd.init().then (() => {
       this.log.debug('Initialization Successful.');
       // Once devices are discovered update Homekit accessories
       this.refreshAccessories();
    }).catch(err => {
      this.log.error('Smartdry initialization Failure:', err);
      // terminate plug-in initialization
      return;
    });
    
  });
  }
   // Create associates in Homekit based 
  async refreshAccessories() {

    var sensorAccessory = new smartdrysensor(this.sd, this.smartDryDevice, this.config, this.log, Service, Characteristic, UUIDGen, HomebridgeAPI);
      // check the accessory was not restored from cache
      var foundAccessory = this.accessories.find(accessory => accessory.UUID === sensorAccessory.uuid)
      if (!foundAccessory) {
        // create a new accessory
        let newAccessory = new this.api.platformAccessory(sensorAccessory.name, sensorAccessory.uuid);
        // add services and Characteristic
        sensorAccessory.setAccessory(newAccessory);
        // register the accessory
        this.addAccessory(sensorAccessory);
      }
      else // accessory already exist just set characteristic
        sensorAccessory.setAccessory(foundAccessory);

     // Clean accessories with no association with devices.
     this.orphanAccessory();
     this.sd.startPollingProcess();
  };

// Find accessory with no association with smartDry monitoring device and remove
async orphanAccessory() {
  var cachedAccessory = this.accessories;
  var smartdryaccessorysensor = UUIDGen.generate(this.smartDryDevice.deviceId).toString();

  for (var i = 0; i < cachedAccessory.length; i++) 
  {   
    let accessory = cachedAccessory[i];
    // determine if accessory is currently a device in thus should remain
    if (smartdryaccessorysensor !=  accessory.UUID) {
          this.removeAccessory(accessory,true);
    }
  }
}


//Add accessory to homekit dashboard
addAccessory(device) {

  this.log.info('Adding accessory');
      try {
        this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [device.accessory]);
        this.accessories.push(device.accessory);
      } catch (err) {
          this.log.error(`An error occurred while adding accessory: ${err}`);
      }
}

//Remove accessory to homekit dashboard
removeAccessory(accessory, updateIndex) {
  this.log.info('Removing accessory:',accessory.displayName );
    if (accessory) {
        this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
    }
    if (updateIndex) {
      if (this.accessories.indexOf(accessory) > -1) {
          this.accessories.splice(this.accessories.indexOf(accessory), 1);
    }}
  }

  // This function is invoked when homebridge restores cached accessories from disk at startup.
  // It should be used to setup event handlers for characteristics and update respective values.
  configureAccessory(accessory) {
    this.log.info('Loading accessory from cache:', accessory.displayName);
    // add the restored accessory to the accessories cache so we can track if it has already been registered
    this.accessories.push(accessory);
  } 

}
