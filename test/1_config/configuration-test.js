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
 * author Dave Bryson
 *
 */

var
    svmp = require('../../lib/svmp'),
    assert = require('assert');


describe("Process configuration files", function () {

   it('read config information', function (done) {
        assert.strictEqual('proxy_log.txt', svmp.config.get('settings:log_file'));

        assert.strictEqual(undefined, svmp.config.get('settings:model:what'));
        done();
    });

    it('read booleans settings', function (done) {
        assert.equal(false, svmp.config.isEnabled('settings:port'));

        done();
    });

    it('should allow changing config items', function (done) {
        assert.strictEqual(svmp.config.get('settings:port'), 8002);
        svmp.config.set('settings:port', 9000);
        assert.strictEqual(svmp.config.get('settings:port'), 9000);
        done();
    });
});