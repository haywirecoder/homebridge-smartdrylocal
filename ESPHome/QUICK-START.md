## Quick Start smartdry local server

To get the dryer sensor working without the SmartDry cloud services, a local ESP32 local server will be needed.  Follow the following steps to create the server.

* Purchase an esp32 dev board. 
* Install the command line ESPHome.io tools using the instruction located here https://esphome.io/guides/getting_started_command_line.html
* At the command line in the ESPHome directory run <i>"esphome wizard smartdry.yaml"</i> and follow the prompt to configure your network.
* Open smartdry template.yaml, copy and paste the noted sections into smartdry.yaml created by wizard in the previous step and save the file. <b> Only Copy and Paste sections as noted by #--- Start ---- and #--- End --- commented sections</b>
* At the command line in the ESPHome directory run <i>"esphome run smartdry.yaml"</i>.
* Using your browser you should be able to go to smartdry.local and see various attributes. Move the dryer sensor and you should see the value change.

