# homebridge-smartdrylocal 

This plug-in enable the uses of a local ESPHome webserver to create a local smartDry accessories in HomeKit. The accessories display Dryer status, temputure, humidty and dryer sensor battery level.  Using a Homekit application such as "Controller for Homekit" or Homebridge notification plug-in you can create a push notification when Dryer is started and completed.

# Background

As September 30th 2022, SmartDry suspended operations the SmartDry worked by connecting to a cloud service run by Connected Labs that then pushed notifications to your mobile device via their application.  Unfortunately, with the cloud service going away, most people found they now have a paperweight al. The Home Assistant Community rallied together to create method to SmartDry fully local (cloud independent). This plug-in levrage  that work to create homebridge plug-in without the use Home Assistant server.



