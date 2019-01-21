![Lynxari IoT Platform](https://agilatech.com/images/lynxari/lynxari200x60.png) **IoT Platform**
## Lynxari VEML6070 UV sensor device driver

This device driver is specifically designed to be used with the Agilatech® Lynxari IoT Platform.
Please see [agilatech.com](https://agilatech.com/software) to download a copy of the system.

### Install
```
$> npm install @agilatech/lynxari-veml6070-device
```
Install in the same directory in which lynxari is installed.


### Design
This device driver is designed for both streaming and polled data collection from the Vishay VEML6070 UVsensor.  The sensor reports UVA radiation, and this driver is programed to report on those parameters.  It will automatically poll and stream these values with configurable time periods.


### Usage
This device driver is designed to be consumed by the Agilatech® Lynxari IoT system.  As such, it is not really applicable or useful in other environments.

To use it with Lynxari, insert its object definition as an element in the devices array in the _devlist.json_ file.
```
{
  "name": "VEML6070",
  "module": "@agilatech/lynxari-veml6070-device",
  "options": {
    "devicePoll": 1000,
    "streamPeriod": 60000,
    "deltaPercent":1,
    "bus":2,
    "integration": 1
  }
}
```


#### Device config object
The device config object is an element in the devlist.json device configuration file, which is located in the Lynxari root directory.  It is used to tell the Lynxari system to load the device, as well as several operational parameters.

_name_ is simply the name given to the device.  This name can be used in queries and for other identifcation purposes.

_module_ is the name of the npm module. The module is expected to exist in this directory under the _node_modules_ directory.  If the module is not strictly an npm module, it must still be found under the node_modules directory.

_options_ is an object within the device config object which defines all other operational parameters.  In general, any parameters may be defined in this options object, and most modules will have many several.  The three which are a part of every Lynxari device are 'devicePoll', 'streamPeriod', and 'deltaPercent'.  The veml6070 options also can define 'bus', and 'integration'.  Finally, all parameter values can have a range defined by specifying '<parameter>\_range'.


```
"devicePoll":<period>
Period in milliseconds in which device will be polled to check for new data

"streamPeriod":<period>
Period in milliseconds for broadcast of streaming values

"deltaPercent":<percent>
Percent of the data range which must be exceeded (delta) to qualify as "new" data

"bus":<linux bus device>
i2c bus number -- 2 for example expects the device to be addressable on the /dev/i2c-2 bus

"integration":<integration value>
One of four possible integration values can be supplied, 0, 1, 2, or 3. Associated result counts are strictly linear by a factor of 2^i. This means an integration of 2 results in a factor of 4 in output data counts. The greater the integration time, the more sample counts will be made. In theory, this will result in a more accurate result, but will also require more time, up to half-second.
```

#### devicePoll and streamPeriod
_devicePoll_ is given in milliseconds, and defines how often the device will be polled for new values.  This paramter is primary useful in sensors which sit idle waiting to be polled, and not for devices which supply values on their own schedule (i.e. for pull ranther that push).

_streamPeriod_ is also given in milliseconds, and defines how often the device will publish its values on the data stream.  Streaming is disabled if this parameter is set to 0. 

#### deltaPercent explained
_deltaPercent_ is the percentage of the current numerical data range which a polled data value must exceed to be considred "new". As an example, consider a temperature range of 100, a deltaPercent of 2, and the current temerature of 34.  In such a case, a device poll must produce a value of 36 or greater, or 32 or less than in order to be stored as a current value.  35 or 33 will be ignored.  deltaPercent may be any value greater than 0 or less than 100, and may be fractional. If not defined, the default is 5 percent.

#### bus file for Linux-based I2C access
_bus_ defines the i2c device bus number on Linux-based systems from which to read and write data.  Since this driver is tightly coupled with the lower level hardware driver, it will not work with Windows-based systems.

#### Defining the value ranges
Value ranges may also be defined in the options, and are closely related to deltaPercent.  If not defined, the software will keep track of minimum and maximum values and derive the range from them.  However, that takes time for the software to "learn" the ranges, so they can be defined in the options object:
```
"uv_range":<numeric range>
"uv_index_range":<numeric range>
```
where the &lt;numeric range&gt; is a number representing the absolute range of the value.


#### module config 
Every module released by Agilatech includes configuration in a file named 'config.json' and we encourage any other publishers to follow the same pattern.  The parameters in this file are considered defaults, since they are overriden by definitions appearing in the options object of the Lynxari devlist.json file.

The construction of the config.json mirrors that of the options object, which is simply a JSON object with key/value pairs.
Here is an example of an 'config.json' file which polls the device every hour and streams values every two hours, with the integration time value set to 1:
```
{
    "devicePoll":3600000,
    "streamPeriod":7200000,
    "integration":1
}
```


#### Default values
If not defined in either the devlist.json or the config.json files, the program uses the following default values:
* _streamPeriod_ : 10000 (10,000ms or 10 seconds)
* _devicePoll_ : 1000 (1,000ms or 1 second)
* _deltaPercent_ : 5 (polled values must exceed the range by &plusmn; 5%)


### Properties
All drivers contain the following 4 core properties:
1. **state** : the current state of the device, containing either the value *chron-on* or *chron-off* 
to indicate whether the device is monitoring data isochronally (a predefinied uniform time period of device data query).
2. **id** : the unique id for this device.  This device id is used to subscribe to this device streams.
3. **name** : the given name for this device.
4. **type** : the given type category for this device,  (_sensor_, _actuator_, etc)


#### Monitored Properties
In the *on* state, the driver software for this device monitors three values.
1. **uv** - the raw uv reading from the sensor
2. **uv_index** - the calculated uv index


#### Streaming Properties
In the *on* state, the driver software continuously streams three values in isochronal
fashion with a period defined by *streamPeriod*. Note that a *streamPeriod* of 0 disables streaming.
1. **uv_stream**
2. **uv_index_stream**
  

### State
This device driver has a binary state: __on__ or __off__. When off, no parameter values are streamed or available, and no commands are accepted other than the _turn-on_ transition. When on, the device is operations and accepts all commands.  The initial state is _off_.
  
  
### Transitions
1. **turn-on** : Sets the device state to *on*. When on, the device is operational and accepts all commands. Values are streamed, and the device is polled periodically to keep monitored values up to date.

2. **turn-off** : Sets the device state to *off*, When off, no parameter values are streamed or available, and no commands are accepted other than the _turn-on_ transition.


### Compatibility
This driver runs under Lynxari operating on any computer from a small single board computer up to large cloud server, using any of the following operating systems:
* 32 or 64-bit Linux
* macOS and OS X
* SunOS
* AIX


### Copyright
Copyright © 2019 [Agilatech®](https://agilatech.com). All Rights Reserved.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
