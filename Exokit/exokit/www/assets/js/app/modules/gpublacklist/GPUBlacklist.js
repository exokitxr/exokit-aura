Module(function GPUBlacklist() {
    this.exports = {
        match: function() {
            if (!Device.graphics.webgl) return true;

            return Device.graphics.webgl.detect([
                'radeon hd 6970m',
                'radeon hd 6770m',
                'radeon hd 6490m',
                'radeon hd 6630m',
                'radeon hd 6750m',
                'radeon hd 5750',
                'radeon hd 5670',
                'radeon hd 4850',
                'radeon hd 4870',
                'radeon hd 4670',
                'geforce 9400m',
                'geforce 320m',
                'geforce 330m',
                'geforce gt 130',
                'geforce gt 120',
                'geforce gtx 285',
                'geforce 8600',
                'geforce 9600m',
                'geforce 9400m',
                'geforce 8800 gs',
                'geforce 8800 gt',
                'quadro fx 5',
                'quadro fx 4',
                'radeon hd 2600',
                'radeon hd 2400',
                'radeon hd 2600',
                'radeon r9 200',
                'mali-4',
                'mali-3',
                'mali-2',
            ]);
        }
    }
});