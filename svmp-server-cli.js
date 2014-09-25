#!/usr/bin/env node

/*
 * Copyright 2013-2014 The MITRE Corporation, All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this work except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @author Dave Bryson
 *
 */

/**
 * Command line administration client for SVMP
 */

var
    program = require('commander'),
    colors = require('colors'),
    fs = require('fs'),
    overseerClient = require('svmp-overseer-client'),
    config = require('nconf'),
    yaml = require('js-yaml'),
    Table = require('cli-table');

colors.setTheme({
    silly: 'rainbow',
    input: 'grey',
    verbose: 'cyan',
    prompt: 'grey',
    info: 'green',
    data: 'grey',
    help: 'cyan',
    warn: 'yellow',
    debug: 'blue',
    error: 'red'
});


/**
 * Current version used. Read from package.json
 * @type {String}
 */
program.version(require('./package.json').version);

program
    .command('list')
    .description('List proxy Users')
    .action(function () {
        console.log('');
        console.log('Proxy users:'.bold.help);
        svmp.listUsers(function (err, res) {
            if (!badResponse(err, res)) {
                var list = res.body.users;
                var table = new Table({
                    head: ['User', 'VM_IP', 'VM_ID', 'VOL_ID', 'Device']
                });

                for (var i = 0; i < list.length; i++) {
                    var o = list[i];
                    var vm_ip = o.vm_ip || "";
                    var vm_id = o.vm_id || "";
                    var volume_id = o.volume_id || "";
                    var device = o.device_type || "";

                    table.push([
                        o.username,
                        vm_ip,
                        vm_id,
                        volume_id,
                        device
                    ]);

                }
                console.log(table.toString());
                console.log('');
            }
        });
    });

program
    .command('devices')
    .description('List supported device types')
    .action(function () {
        console.log('');
        console.log('Supported device types:'.bold.help);
        svmp.listDevices(function (err, res) {
            if (!badResponse(err, res)) {
                var images = res.body;
                var table = new Table({
                    head: ['Device Type']
                });
                for (var key in images) {
                    table.push([key]);
                }
                console.log(table.toString());
                console.log('');
            }
        });
    });

program
    .command('clear-vm-info <username>')
    .description('Clear the Users VM Information')
    .action(function (un) {
        console.log('');
        console.log('Clearing user information...'.bold.help);
        var update = {vm_ip: "", vm_id: ""};
        svmp.updateUser(un, update, function (err, res) {
            if (!badResponse(err, res)) {
                console.log('    Done! Cleared VM IP and VM ID for user:', un);
                console.log('');
            }
        });
    });

program
    .command('show <username>')
    .description('Show information about a user')
    .action(function (un) {
        console.log('');
        console.log('Finding user information...'.bold.help);
        svmp.getUser(un, function (err, res) {
            if (!badResponse(err, res)) {
                var user = res.body.user;
                console.log(JSON.stringify(user, null, 4).data);
                console.log('');
            }
        });
    });

program
    .command('add <username> <password> <email> <device_type>')
    .description('Add a User to system. NOTE: this does NOT create a volume for the User! (Use this command if you aren\'t using a cloud platform)')
    .action(function (un, pw, email, dev) {
        console.log('');
        console.log('Adding a new user...'.bold.help);
        svmp.createUser(un, pw, email, dev, function (err, res) {
            if (!badResponse(err, res)) {
                console.log('    Done! Created user:', un);
                console.log('    NOTE: The user does NOT have a volume assigned; use the "volume-create" command to do so'.warn);
                console.log('');
            }
        });
    });

program
    .command('add-user-with-volume <username> <password> <email> <device_type>')
    .description('Add a new User to the system and create a volume for the User')
    .action(function (un, pw, email, dev) {
        console.log('');
        console.log('Adding a new user...'.bold.help);
        svmp.createUser(un, pw, email, dev, function (err, res) {
            if (!badResponse(err, res)) {
                console.log('    Created user:', un);
                console.log('');

                // add the user's volume
                svmp.overseerClient.createVolume(un, function (err, res) {
                    if (!badResponse(err, res)) {
                        console.log('    Volume created for:', un);
                        console.log('    ... information saved to user\'s account ...');
                        console.log('    NOTE: The Volume is NOT attached to the user\'s VM.'.warn);
                        console.log('');
                    }
                });
            }
        });
    });

program
    .command('vm <username>')
    .description('Create and start a VM for a user in the system.')
    .action(function (un, imageid, imageflvr) {
        console.log('');
        console.log('Creating a new VM, this may take a few seconds...'.bold.help);

        svmp.setupVM(un, function (err, res) {
            if (!badResponse(err, res)) {
                console.log('    Done! VM created and running, IP:', res.body.vm_ip);
                console.log('');
            }
        });
    });

program
    .command('vm-add <username> <vm_ip_address>')
    .description('Register an existing VM at a given IP address to the user. (For testing/dev ONLY.)')
    .action(function (un, vmip) {
        console.log('');
        console.log('Updating user\'s VM IP address...'.bold.help);

        var update = {vm_ip: vmip, vm_id: ""};
        svmp.updateUser(un, update, function (err, res) {
            if (!badResponse(err, res)) {
                console.log('    Done! Updated VM IP and cleared VM ID for user:', un);
                console.log('');
            }
        });
    });


program
    .command('list-volumes')
    .description('list available volumes')
    .action(function () {
        console.log('');
        console.log('Available volumes:'.bold.help);

        svmp.listVolumes(function (err, res) {
            if (!badResponse(err, res)) {
                var r = res.body.volumes;
                var table = new Table({
                    head: ['Name', 'Status', 'ID']
                });

                for (var i = 0; i < r.length; i++) {
                    table.push(r[i]);
                }
                console.log(table.toString());
                console.log('');
            }
        });
    });

program
    .command('volume-create <username>')
    .description('Create and assign a Volume to a user based on the gold snapshot id in config-local')
    .action(function (un) {
        console.log('');
        console.log('Creating data volume for user...'.bold.help);

        // add the user's volume
        svmp.createVolume(un, function (err, res) {
            if (!badResponse(err, res)) {
                console.log('    Done! Volume created for user:', un);
                console.log('    ... information saved to user\'s account ...');
                console.log('    NOTE: The Volume is NOT attached to the user\'s VM'.warn);
                console.log('');
            }
        });
    });

program
    .command('volume-assign <username> <volume_id>')
    .description('Does not attach Volume to VM, simply associates an existing user data volume with the specified user.')
    .action(function (un, volid) {
        console.log('');
        console.log('Associating volume with user...'.bold.help);

        svmp.assignVolume(un, volid, function (err, res) {
            if (!badResponse(err, res)) {
                console.log('    Done! Updated volume ID for user:', un);
                console.log('');
            }
        });
    });

program
    .command('delete <username>')
    .description('Delete a User from the Proxy')
    .action(function (un) {
        console.log('');
        console.log('Deleting user...'.bold.help);

        svmp.deleteUser(un, function (err, res) {
            if (!badResponse(err, res)) {
                console.log('    Done!');
                console.log('');
            }
        });
    });

program
    .command('images')
    .description('List available images and flavors on your cloud platform; this information is needed when creating a VM')
    .action(function () {

        svmp.listImages(function (err, res) {
            if (!badResponse(err, res)) {
                console.log('');
                console.log('Image flavors available:'.bold.help);
                var flavorTable = new Table({
                    head: ['Name', 'ID']
                });
                for (i = 0; i < res.body.flavors.length; i++) {
                    var o = res.body.flavors[i];
                    flavorTable.push([o[1], o[0]]);
                }
                console.log(flavorTable.toString());
                console.log('');
                console.log('NOTE: Use the ID value when choosing a Flavor'.warn);
                console.log('');

                console.log('Images available:'.bold.help);
                var imgTable = new Table({
                    head: ['Name', 'ID']
                });
                for (i = 0; i < res.body.images.length; i++) {
                    var o = res.body.images[i];
                    imgTable.push([o[1], o[0]]);
                }
                console.log(imgTable.toString());
                console.log('');
            }
        });
    });


if (process.argv.length <= 2) {
    console.log('');
    console.log('    Run "svmp-config -h" to see available commands'.error);
    console.log('');
    process.exit();
} else {
    config.env(['overseer_url', 'auth_token', 'trust_all_certs']);
    if (fs.existsSync(process.env.HOME + '/.svmprc')) {
        config.file({
            file: process.env.HOME + '/.svmprc',
            format: {
                parse: yaml.safeLoad,
                stringify: yaml.safeDump
            }
        });
    }

    if (typeof config.get('overseer_url') === 'undefined') {
        console.log('No overseer_url set.');
        process.exit();
    }

    if (typeof config.get('auth_token') === 'undefined') {
        console.log('No auth_token set.');
        process.exit();
    }

    console.log('Using overseer URL: ' + config.get('overseer_url'));

    if (config.get('trust_all_certs')) {
        console.log('Trusting ALL server SSL/TLS certificates...'.warn);
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    }

    // Overseer Client
    var svmp = new overseerClient(config.get('overseer_url'), config.get('auth_token'));

    program.parse(process.argv);
}

// internal function
// returns 'true' and logs if there is an error
// returns 'false' if there is no error
function badResponse(err, response) {
    var errText;
    if (err) {
        errText = '    Error: ' + err.message;
    }
    else if (response.status !== 200) {
        errText = '    Error code: ' + response.status + ', text: ' + response.text;
    }

    if (errText) {
        console.log(errText.error);
        console.log('');
        return true;
    }
    return false;
}
