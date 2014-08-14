(function (DungeonScript) {


    function Frames() {
        this.frames = [];
        this.top = function () {
            var frame = null;
            if (this.frames.length > 0) {
                frame = this.frames[this.frames.length - 1]
            }
            return frame;
        };

    }

    // Remove the topmost frame from the frame stack
    Frames.prototype.pop = function () {
        this.frame.pop();
    };

    // Add a new frame on the frame stack
    Frames.prototype.push = function (position) {
        var parentFrame = this.top();
        this.frames.push(new Frame(position, parentFrame));
    };

    Frames.prototype.var = function (key, value) {
        return this.top().var(key, value);
    };


    function Frame(position, parent) {
        this.position = position || null;
        this.parent = parent || null;
        this.vars = {};
    }

    Frame.prototype.var = function(key, value) {
        var returnValue;

        if (arguments.length > 1) {
            this.vars[key] = value;
        }

        if (this.vars.hasOwnProperty(key)) {
            returnValue = this.vars[key];
        } else {
            if (this.parent) {
                returnValue = parent.var(key);
            }
        }

        return returnValue;
    };

    Frame.prototype.delete = function (key) {
        delete this.vars[key];
    };


    DungeonScript.Frame = Frame;
    DungeonScript.Frames = Frames;


})(this.DungeonScript);
