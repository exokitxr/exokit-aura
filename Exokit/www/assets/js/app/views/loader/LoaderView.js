Class(function LoaderView() {
    Inherit(this, Element);
    const _this = this;
    const $this = this.element;
    let $text;

    //*** Constructor
    (function () {
        initHTML();
        style();
    })();

    function initHTML() {
        $text = $this.create('Text');
    }

    function style() {
        $this.size('100%').css({background: '#000'}).setZ(1);
        $text.html('0%').size(200, 20).center().css({textAlign: 'center', color: '#fff'});
    }

    //*** Event handlers

    //*** Public methods
    this.progress = function(e) {
        $text.html(`${Math.round(e.percent * 100)}%`);
    };

    this.animateOut = function(callback) {
        $this.tween({opacity: 0}, 500, 'easeOutCubic').onComplete(() => callback && callback());
        $text.tween({y: -20}, 500, 'easeInCubic');
    };

});