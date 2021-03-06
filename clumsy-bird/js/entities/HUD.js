game.HUD = game.HUD || {};

game.HUD.Container = me.Container.extend({
    init: function() {
        // call the constructor
        this._super(me.Container, 'init');
        // persistent across level change
        this.isPersistent = true;

        // non collidable
        this.collidable = false;

        // make sure our object is always draw first
        this.z = Infinity;

        // give a name
        this.name = "HUD";

        // add our child score object at the top left corner
        this.addChild(new game.HUD.ScoreItem(5, 5));
        this.addChild(new game.HUD.Text(0, 0));
    },
    
    update: function() {
        game.data.text = "target: " + game.data.targetHeight + "               actual: " + game.data.trueHeight;
    }
});

/**
 * custom text
 */
game.HUD.Text = me.Renderable.extend({
    /**
     * constructor
     */
    init: function(x, y) {
        // call the parent constructor
        // (size does not matter here)
        this._super(me.Renderable, "init", [x, y, 10, 10]);

        // local copy of the global score
        this.leftText = new me.Font('gamefont', 40, '#000', 'left');
        this.rightText = new me.Font('gamefont', 40, '#000', 'right');

        // make sure we use screen coordinates
        this.floating = true;
    },

    draw: function (renderer) {
        var context = renderer.getContext();
        if (me.state.isCurrent(me.state.PLAY)) {
            this.leftText.draw(context, "TARGET: " + (600 - game.data.targetHeight) + 'txn/sec\nACTUAL: ' + (600 - game.data.trueHeight) + "txn/sec", 20, 0);
            this.rightText.draw(context, game.data.db + "\n" + game.data.benchmark, me.video.renderer.getWidth() - 20, 0);
        }
    }

});


/**
 * a basic HUD item to display score
 */
game.HUD.ScoreItem = me.Renderable.extend({
    /**
     * constructor
     */
    init: function(x, y) {
        // call the parent constructor
        // (size does not matter here)
        this._super(me.Renderable, "init", [x, y, 10, 10]);

        // local copy of the global score
        this.stepsFont = new me.Font('gamefont', 80, '#000', 'center');

        // make sure we use screen coordinates
        this.floating = true;
    },

    draw: function (renderer) {
        var context = renderer.getContext();
        if (game.data.start && me.state.isCurrent(me.state.PLAY))
            this.stepsFont.draw(context, game.data.steps, me.video.renderer.getWidth()/2, 10);
    }

});

var BackgroundLayer = me.ImageLayer.extend({
    init: function(image, z, speed) {
        name = image;
        width = 900;
        height = 600;
        ratio = 1;
        // call parent constructor
        this._super(me.ImageLayer, 'init', [name, width, height, image, z, ratio]);
    },

    update: function() {
        if (me.input.isKeyPressed('mute')) {
            game.data.muted = !game.data.muted;
            if (game.data.muted){
                me.audio.disable();
            }else{
                me.audio.enable();
            }
        }
        if (me.input.isKeyPressed('pause')) {
            socket.emit('chat message', 'pause');
            game.data.paused = !game.data.paused;
        }
        return true;
    }
});

var Share = me.GUI_Object.extend({
    init: function(x, y) {
        var settings = {};
        settings.image = "share";
        settings.spritewidth = 150;
        settings.spriteheight = 75;
        this._super(me.GUI_Object, 'init', [x, y, settings]);
    },

    onClick: function(event) {
        var shareText = 'Just made ' + game.data.steps + ' steps on Clumsy Bird! Can you beat me? Try online here!';
        var url = 'http://ellisonleao.github.io/clumsy-bird/';
        FB.ui(
            {
             method: 'feed',
             name: 'My Clumsy Bird Score!',
             caption: "Share to your friends",
             description: (
                    shareText
             ),
             link: url,
             picture: 'http://ellisonleao.github.io/clumsy-bird/data/img/clumsy.png'
            }
        );
        return false;
    }

});

var Tweet = me.GUI_Object.extend({
    init: function(x, y) {
        var settings = {};
        settings.image = "tweet";
        settings.spritewidth = 152;
        settings.spriteheight = 75;
        this._super(me.GUI_Object, 'init', [x, y, settings]);
    },

    onClick: function(event) {
        var shareText = 'Just made ' + game.data.steps + ' steps on Clumsy Bird! Can you beat me? Try online here!';
        var url = 'http://ellisonleao.github.io/clumsy-bird/';
        var hashtags = 'clumsybird,melonjs';
        window.open('https://twitter.com/intent/tweet?text=' + shareText + '&hashtags=' + hashtags + '&count=' + url + '&url=' + url, 'Tweet!', 'height=300,width=400')
        return false;
    }

});

var PlayerButton = me.GUI_Object.extend({
    init: function(x, y, gImage, benchmark, playerImg) {
        this.benchmark = benchmark;
        this.playerImg = playerImg;
        this._super(me.GUI_Object, 'init', [x, y, {image: gImage}]);
    },
    
    onClick: function(event) {
        console.log('using benchmark: ' + this.benchmark);
        game.data.benchmark = this.benchmark;
        game.data.playerImg = this.playerImg;

        // send off config
        socket.emit('setup', {dbms: game.data.db, benchmark: game.data.benchmark});
        me.state.change(me.state.LOADING);
    }
});

var StageButton = me.GUI_Object.extend({
    init: function(x, y, gImage, db, stageImgs) {
        this.db = db;
        this.stageImgs = stageImgs;  // a struct containing the stage graphics
        this._super(me.GUI_Object, 'init', [x, y, {image: gImage}]);
    },
    
    onClick: function(event) {
        console.log('using db: ' + this.db);
        game.data.db = this.db;
        game.data.stageImgs = this.stageImgs;
        
        me.state.change(game.states.PLAYER_SELECT);
    }
});

var RetryButton = me.GUI_Object.extend({
    init: function(x, y) {
        this._super(me.GUI_Object, 'init', [x, y, {image: "retrybutton"}]);
    },
    
    onClick: function(event) {
        socket.emit('gameover', "restart");
        me.state.change(me.state.PLAY);
    }
});

var NewConfigButton = me.GUI_Object.extend({
    init: function(x, y) {
        this._super(me.GUI_Object, 'init', [x, y, {image: "newbutton"}]);
    },
    
    onClick: function(event) {
        socket.emit('gameover', "menu");
        me.state.change(game.states.STAGE_SELECT);
    }
});
