## Quick Start smartdry local server

To get this working without the SmartDry cloud and create a local services following steps

* Purchase an esp32 dev board. 
* Install the command line ESPHome.io tools using the instruction here https://esphome.io/guides/getting_started_command_line.html
* At the command line in the ESPHome directory run <i>"esphome wizard smartdry.yaml"</i> and follow the prompt to configure your network.
* Open smartdry template.yaml and copy and paste the noted sections into smartdry.yaml created by wizard in previous step and save.
* At the command line in the ESPHome directory run <i>"esphome run smartdry.yaml"</i>
* Using your browser you should be able to go to smartdry.local and see various attributes. 

