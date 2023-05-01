# homebridge-smartdrylocal 

[![NPM Version](https://img.shields.io/npm/v/homebridge-smartdrylocal.svg?style=flat-square)](https://www.npmjs.com/package/homebridge-smartdrylocal)

This plug-in enable the uses of a local ESPHome webserver to create a local smartDry accessories in HomeKit. The accessories display Dryer status, temperature, humidity and dryer sensor battery level.  Using a Homekit application such as "Controller for Homekit" or Homebridge notification plug-in you can create a push notification when Dryer is started and completed.

## Background

As September 30, 2022,  Connected Labs suspended operations and turned off it's cloud services.  Unfortunately, with the cloud service being disabled the SmartDry sensor was useless since it was dependent on these service for the application monitoring and push notification.  The Home Assistant Community rallied together to create method to SmartDry fully local (i.e. cloud independent).  This plug-in leverage modified work (see ESP32 folder)  to create homebridge plug-in without the use Home Assistant server.



## Configuration options

| Attributes        | Description                                                                                                              |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------ |
| host              | SmartDry relay sensor server / ESPHome IP Address.  *Note:* Plug-in will shutdown if not configured.                      |
| deviceRefresh        | Polling interval to obtain status of devices, provide in seconds. Default to 30 seconds.          |


Example configuration is below.

```javascript
...

"platforms": [
{
  "name": "SmartDry",
  "host": "192.168.YYY.XXX",
  "deviceRefresh": 30,
  "platform": "SmartDry"
}
...
