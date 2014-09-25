# Node SVMP CLI

Serves as a basic TCP proxy between Android devices and Android VMs running in the cloud. Handles authentication, session management, and proxying messages.

## Installation

`npm install -g git+https://github.com/SVMP/svmp-server-cli`

## Configuration

Set the following two variables:

* `overseer_url` - Full URL to the [SVMP Overseer](https://github.com/SVMP/svmp-overseer)
* `auth_token` - Admin-role JWT login token obtained from the Overseer's `svmp-create-token` tool
* `trust_all_certs` - Set to true to disable cert validation checking when using self-signed certs for the Overseer

These can be set either as environment variables or in the YAML-format config file `~/.svmprc`.

## Usage

```svmp-server-cli [options] [command]```

Commands:

* `list`                   List proxy Users
* `devices`                List supported device types
* `clear-vm-info <username>` Clear the Users VM Information
* `show <username>`        Show information about a user
* `add <username> <password> <email> <device_type>` Add a User to system. NOTE: this does NOT create a volume for the User! (Use this command if you aren't using a cloud platform)
* `add-user-with-volume <username> <password> <email> <device_type>` Add a new User to the system and create a volume for the User
* `vm <username>`          Create and start a VM for a user in the system.
* `vm-add <username> <vm_ip_address> Register an existing VM at a given IP address to the user. (For testing/dev ONLY.)
* `list-volumes`           list available volumes
* `volume-create <username>` Create and assign a Volume to a user based on the gold snapshot id in config-local
* `volume-assign <username> <volume_id>` Does not attach Volume to VM, simply associates an existing user data volume with the specified user.
delete <username>      Delete a User from the Proxy
* `images`                 List available images and flavors on your cloud platform; this information is needed when creating a VM

## License

Copyright (c) 2012-2014, The MITRE Corporation, All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
