# Node SVMP CLI

Serves as a basic TCP proxy between Android devices and Android VMs running in the cloud. Handles authentication, session management, and proxying messages.

## Setup

### Prerequisites
* Install [Node.js](http://nodejs.org)

### Install Steps
1. Download this project
2. Within the root directory of this project, run this command to install the project and download dependencies:
```sh
$ npm install
```

### Configuration

Set shell environment variables:
```sh
$ export overseer_url="https://localhost:3000/"
$ export auth_token="OVERSEER_AUTH_TOKEN"
$ export trust_all_certs=true # needed when using self-signed certificates
```

### Running the CLI

Run the command line client from the root directory of the project:
```sh
$ node ./bin/cli.js -h
```

## License

Copyright (c) 2012-2014, The MITRE Corporation, All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
