Module(function iOSDevices() {
    this.exports = {
        find: function() {
            if (Device.system.os == 'ios' && navigator.platform.toLowerCase().includes('macintel')) return '';

            if (Device.system.os != 'ios') return '';
            if (!Device.graphics.webgl) return 'legacy';
            var detect = Device.graphics.webgl.detect;
            if (detect(['a9', 'a10', 'a11', 'a12', 'a13', 'a14', 'a15', 'a16', 'a17', 'a18']) || navigator.platform.toLowerCase().includes('mac')) return Device.mobile.phone ? '6s, 7x, x' : 'ipad pro';
            if (detect('a8')) return Device.mobile.phone ? '6x' : 'ipad air 2, ipad mini 4';
            if (detect('a7')) return Device.mobile.phone ? '5s' : 'ipad air 1, ipad mini 2, ipad mini 3';
            if (detect(['sgx554', 'sgx 554'])) return Device.mobile.phone ? '' : 'ipad 4';
            if (detect(['sgx543', 'sgx 543'])) return Device.mobile.phone ? '5x, 5c, 4s' : 'ipad mini 1, ipad 2';
            return 'legacy';
        }
    };
});
