const PaintGlobalOption = {
	Event: {
		order: {
			catching: 1, 
			bubbling: 2, 
			none: 3
		}, 
		supportEvent: ['click', 'contextmenu', 'mouseenter', 'mouseleave', 'mousedown', 
			'mouseup', 'mousemove', 'mousedrag', 'mousehover']
	}, 
	Path: {
		defaultStyle: {
			fillStyle: 'black', 
			strokeStyle: 'black', 
			lineWidth: 1, 
			font: '10px sans-serif', 
			shadowColor: 'black', 
			shadowOffsetX: 0, 
			shadowOffsetY: 0, 
			shadowBlur: 0, 
			globalAlpha: 1
		}, 
		defaultDraw: {
			isFill: true, 
			isStroke: false
		}, 
		animation: {
			speed: {
				fast: 1000, 
				slow: 3000
			}, 
			fps: 60
		}, 
		isShowOnTheTopWhenEventTrigger: true, 
		isMoveToTopWhenPathBeClicked: true
	}, 
	Paint: {
		display: {
			window: 1, 
			paint: 2
		}, 
		openEvent: true
	}
};
class Event {
	constructor() {
		this.event = null;
		this._lastEvent = null;
		this._quickProperties();
	}
	on(type, callback, order = PaintGlobalOption.Event.order.bubbling) {
		if(PaintGlobalOption.Event.supportEvent.includes(type)) {
			type = '_' + type;
			if(!this[type]) {
				this[type] = [];
			}
			this[type].push({
				order, 
				callback
			});
		}
		return this;
	}
	off(type, callback) {
		type = '_' + type;
		if(this[type]) {
			if(callback) {
				let index = this[type].map(v => v.callback).indexOf(callback);
				this[type].splice(index, index !== -1 ? 1 : 0);
			} else {
				this[type].length = 0;
			}
			if(!this[type].length) {
				delete this[type];
			}
		}
		return this;
	}
	trigger(type, e, order = PaintGlobalOption.Event.order.bubbling) {
		type = '_' + type;
		if(this[type]) {
			this[type].filter(v => v.order === order).map(v => v.callback).forEach(v => {
				v.bind(this)(e);
			});
		}
		return this;
	}
	once(type, callback, order) {
		let _callback = (e) => {
			callback.bind(this)(e);
			this.off(type, _callback);
		};
		this.on(type, _callback, order);
		return this;
	}
	hasEvent(type, order = PaintGlobalOption.Event.order.bubbling) {
		type = '_' + type;
		if(this[type]) {
			return this[type].some(v => v.order === order);
		}
		return false;
	}
	_quickProperties() {
		['click', 'contextmenu', 'mouseenter', 'mouseleave', 
			'mousedown', 'mouseup', 'mousemove', 'mousedrag']
			.forEach(type => {
				this[type] = (callback = {}, order) => {
					if(typeof callback === 'function') {
						this.on(type, callback, order);
					} else if(typeof callback === 'object') {
						this.trigger(type, callback, order);
					}
					return this;
				};
			});
		this.mousehover = (callback1 = {}, callback2, order) => {
			if(typeof callback1 === 'function') {
				this.on('mouseenter', callback1, order)
					.on('mouseleave', typeof callback2 === 'function' ? callback2 : callback1, order);
			} else if(typeof callback1 === 'object') {
				this.trigger('mouseenter', callback1, callback2)
					.trigger('mouseleave', callback1, callback2);
			}
			return this;
		}
		return this;
	}
}
class Path extends Event {
	constructor(left, top, option = {}) {
		super();
		this._left_paint = this._left_window = left;
		this._top_paint = this._top_window = top;
		this._paint = null;
		this._id = null;
		this._index = 0;
		this._classText = '';
		this._parent = null;
		this._visibility = true;
		this._isFirstTimeCreate = true;
		this._isLocationChanged = false;
		this._animationList = [];
		this._isAnimating = false;
		this._display = option.display !== undefined ? option.display : PaintGlobalOption.Paint.display.paint;
		this._style = option.style !== undefined ? option.style : {};
		this._style.fillStyle = this._style.fillStyle ? this._style.fillStyle : PaintGlobalOption.Path.defaultStyle.fillStyle;
		this._style.strokeStyle = this._style.fillStyle ? this._style.fillStyle : PaintGlobalOption.Path.defaultStyle.strokeStyle;
		this._style.lineWidth = this._style.lineWidth ? this._style.lineWidth : PaintGlobalOption.Path.defaultStyle.lineWidth;
		this._style.font = this._style.font ? this._style.font : PaintGlobalOption.Path.defaultStyle.font;
		this._style.shadowBlur = this._style.shadowBlur ? this._style.shadowBlur : PaintGlobalOption.Path.defaultStyle.shadowBlur;
		this._style.shadowColor = this._style.shadowColor ? this._style.shadowColor : PaintGlobalOption.Path.defaultStyle.shadowColor;
		this._style.shadowOffsetX = this._style.shadowOffsetX ? this._style.shadowOffsetX : PaintGlobalOption.Path.defaultStyle.shadowOffsetX;
		this._style.shadowOffsetY = this._style.shadowOffsetY ? this._style.shadowOffsetY : PaintGlobalOption.Path.defaultStyle.shadowOffsetY;
		this._style.globalAlpha = this._style.globalAlpha ? this._style.globalAlpha : PaintGlobalOption.Path.defaultStyle.globalAlpha;
		this._isFill = option.isFill !== undefined ? option.isFill : PaintGlobalOption.Path.defaultDraw.isFill;
		this._isStroke = option.isStroke !== undefined ? option.isStroke : PaintGlobalOption.Path.defaultDraw.isStroke;
		this._isShowOnTheTopWhenEventTrigger = option.isShowOnTheTopWhenEventTrigger !== undefined ? option.isShowOnTheTopWhenEventTrigger : PaintGlobalOption.Path.isShowOnTheTopWhenEventTrigger;
		this._isMoveToTopWhenPathBeClicked = option.isMoveToTopWhenPathBeClicked !== undefined ? option.isMoveToTopWhenPathBeClicked : PaintGlobalOption.Path.isMoveToTopWhenPathBeClicked;
	}
	display(value, redraw = true) {
		if(value !== undefined) {
			this._display = value;
			if(redraw) {
				this.redraw();
			}
			return this;
		}
		return this._display;
	}
	showOnTheTopWhenEventTrigger(value, redraw = true) {
		if(value !== undefined) {
			this._isShowOnTheTopWhenEventTrigger = value;
			if(redraw) {
				this.redraw();
			}
			return this;
		}
		return this._isShowOnTheTopWhenEventTrigger;
	}
	moveToTopWhenPathBeClicked(value, redraw = true) {
		if(value !== undefined) {
			this._isMoveToTopWhenPathBeClicked = value;
			if(redraw) {
				this.redraw();
			}
			return this;
		}
		return this._isMoveToTopWhenPathBeClicked;
	}
	left(value, redraw = true) {
		if(value !== undefined) {
			if(typeof value === 'number') {
				value = value - this._left_window;
			} else if(/\s*[-+]=\s*\d+\s*/.exec(value)) {
				value = parseInt(value.replace(/[^\d\.\-\+]/g, ''));
			}
			this._left_window += value;
			this._isLocationChanged = true;
			if(redraw) {
				this.redraw();
			}
			return this;
		}
		return this._left_window;
	}
	top(value, redraw = true) {
		if(value !== undefined) {
			if(typeof value === 'number') {
				value = value - this._top_window;
			} else if(/\s*[-+]=\s*\d+\s*/.exec(value)) {
				value = parseInt(value.replace(/[^\d\.\-\+]/g, ''));
			}
			this._top_window += value;
			this._isLocationChanged = true;
			if(redraw) {
				this.redraw();
			}
			return this;
		}
		return this._top_window;
	}
	offset(left, top, redraw = true) {
		if(left !== undefined && top !== undefined) {
			return this.left(left, false).top(top, redraw);
		}
		return {
			left: this._left_window, 
			top: this._top_window
		};
	}
	font(value, redraw = true) {
		if(value !== undefined) {
			this._style.font = value;
			if(redraw) {
				this.redraw();
			}
			return this;
		}
		return this._style.font;
	}
	fontSize(value, redraw = true) {
		if(value !== undefined) {
			if(/\s*[-+]=\s*\d+\s*/.exec(value)) {
				value = parseInt(this._style.font) + parseInt(value.replace(/[^\d\.\-\+]/g, ''));
			}
			this._style.font = this._style.font.replace(/\d+\.?\d*(?=px)/g, value);
			if(redraw) {
				this.redraw();
			}
			return this;
		}
		return parseInt(this._style.font);
	}
	lineWidth(value, redraw = true) {
		if(value !== undefined) {
			if(/\s*[-+]=\s*\d+\s*/.exec(value)) {
				value = this._style.lineWidth + parseInt(value.replace(/[^\d\.\-\+]/g, ''));
			}
			this._style.lineWidth = value;
			if(redraw) {
				this.redraw();
			}
			return this;
		}
		return this._style.lineWidth;
	}
	color(value, redraw = true) {
		if(value !== undefined) {
			this._style.fillStyle = this._style.strokeStyle = this._style.shadowColor = value;
			if(redraw) {
				this.redraw();
			}
			return this;
		}
		return this._style.fillStyle;
	}
	fillStyle(value, redraw = true) {
		if(value !== undefined) {
			this._style.fillStyle = value;
			if(redraw) {
				this.redraw();
			}
			return this;
		}
		return this._style.fillStyle;
	}
	strokeStyle(value, redraw = true) {
		if(value !== undefined) {
			this._style.strokeStyle = value;
			if(redraw) {
				this.redraw();
			}
			return this;
		}
		return this._style.strokeStyle;
	}
	fill(isFill = true, redraw = true) {
		this._isFill = isFill;
		if(redraw) {
			this.redraw();
		}
		return this;
	}
	stroke(isStroke = true, redraw = true) {
		this._isStroke = isStroke;
		if(redraw) {
			this.redraw();
		}
		return this;
	}
	shadow(value, redraw = true) {
		if(value !== undefined) {
			let result = /\s*(\w+)\s*(\w+)\s*(\w+)\s*(\w+)\s*/.exec(value);
			if(result) {
				this._style.shadowOffsetX = parseInt(result[1]);
				this._style.shadowOffsetY = parseInt(result[2]);
				this._style.shadowBlur = parseInt(result[3]);
				this._style.shadowColor = result[4];
				if(redraw) {
					this.redraw();
				}
			}
			return this;
		}
		return this._style.shadow;
	}
	shadowOffsetX(value, redraw = true) {
		if(value !== undefined) {
			if(/\s*[-+]=\s*\d+\s*/.exec(value)) {
				value = this._style.shadowOffsetX + parseInt(value.replace(/[^\d\.\-\+]/g, ''));
			}
			this._style.shadowOffsetX = value;
			if(redraw) {
				this.redraw();
			}
			return this;
		}
		return this._style.shadowOffsetX;
	}
	shadowOffsetY(value, redraw = true) {
		if(value !== undefined) {
			if(/\s*[-+]=\s*\d+\s*/.exec(value)) {
				value = this._style.shadowOffsetY + parseInt(value.replace(/[^\d\.\-\+]/g, ''));
			}
			this._style.shadowOffsetY = value;
			if(redraw) {
				this.redraw();
			}
			return this;
		}
		return this._style.shadowOffsetY;
	}
	shadowColor(value, redraw = true) {
		if(value !== undefined) {
			this._style.shadowColor = value;
			if(redraw) {
				this.redraw();
			}
			return this;
		}
		return this._style.shadowColor;
	}
	shadowBlur(value, redraw = true) {
		if(value !== undefined) {
			if(/\s*[-+]=\s*\d+\s*/.exec(value)) {
				value = this._style.shadowBlur + parseInt(value.replace(/[^\d\.\-\+]/g, ''));
			}
			this._style.shadowBlur = value;
			if(redraw) {
				this.redraw();
			}
			return this;
		}
		return this._style.shadowBlur;
	}
	opacity(value, redraw = true) {
		if(value !== undefined) {
			if(/\s*[-+]=\s*\d+\s*/.exec(value)) {
				value = this._style.globalAlpha + parseInt(value.replace(/[^\d\.\-\+]/g, ''));
			}
			this._style.globalAlpha = value;
			if(redraw) {
				this.redraw();
			}
			return this;
		}
		return this._style.globalAlpha;
	}
	style(value, redraw = true) {
		if(value !== undefined) {
			this._style = value;
			if(redraw) {
				this.redraw();
			}
			return this;
		}
		return this._style;
	}
	hide(visible = false, redraw = true) {
		this._visibility = visible;
		if(redraw) {
			this.redraw();
		}
		return this;
	}
	show(visible = true, redraw = true) {
		this._visibility = visible;
		if(redraw) {
			this.redraw();
		}
		return this;
	}
	remove(redraw = true) {
		if(this._paint) {
			this._paint.path.remove(this, false);
			if(redraw) {
				this.redraw();
			}
		}
		return this;
	}
	clone() {
		throw new Error('abstract method');
	}
	index(value, redraw = true) {
		if(value !== undefined) {
			this._index = value;
			if(this._paint) {
				this._paint.path.refreshIndex(value, false);
			}
			if(redraw) {
				this.redraw();
			}
			return this;
		}
		return this._index;
	}
	id(value, redraw = true) {
		if(value !== undefined) {
			this._id = value;
			if(redraw) {
				this.redraw();
			}
			return this;
		}
		return this._id;
	}
	classText(value, redraw = true) {
		if(value !== undefined) {
			this._classText = value;
			if(redraw) {
				this.redraw();
			}
			return this;
		}
		return this._classText;
	}
	addClass(value, redraw = true) {
		value.split(/\s+/).forEach(name => {
			name = name.trim();
			if(!this.hasClass(value)) {
				this._classText += ' ' + name;
			}
		});
		this._classText = this._classText.trim();
		if(redraw) {
			this.redraw();
		}
		return this;
	}
	hasClass(value) {
		return this._classText.includes(value.trim());
	}
	removeClass(value, redraw = true) {
		this._classText = this._classText.replace(value.trim(), '').replace(/\s{2,}/g, ' ').trim();
		if(redraw) {
			this.redraw();
		}
		return this;
	}
	toggleClass(value, redraw = true) {
		if(this.hasClass(value)) {
			this.removeClass(value);
		} else {
			this.addClass(value);
		}
		if(redraw) {
			this.redraw();
		}
		return this;
	}
	redraw() {
		if(this._paint) {
			this._paint.redraw();
		}
		return this;
	}
	delay(time) {
		this._animationList.push(() => {
			setTimeout(() => {
				this._animationList.shift();
				if(this._animationList.length) {
					this._animationList[0]();
				}
			}, time);
		});
		if(this._animationList.length === 1) {
			this._animationList[0]();
		}
		return this;
	}
	animate(property = {}, option = {}, redraw = true) {
		this._animationList.push(() => {
			let duration = option.duration !== undefined ? option.duration : PaintGlobalOption.Path.animation.speed.fast;
			let interval = 1000 / (option.fps !== undefined ? option.fps : PaintGlobalOption.Path.animation.fps);
			let properties = Object.keys(property)
				.filter(v => typeof this[v] === 'function')
				.map(v => {
					let value = property[v];
					let thisValue = this[v]();
					if(/\s*[-+]=\s*\d+\s*/.exec(value)) {
						value = thisValue + parseInt(value.replace(/[^\d\.\-\+]/g, ''));
					}
					value = Math.max(value, 0);
					return [v, thisValue, Math.abs(thisValue - value) * (thisValue < value ? 1 : -1)];
				});
			let incre = (percent, callback, redraw) => {
				properties.forEach(v => {
					let value = v[1] + percent * v[2];
					this[v[0]](value, false);
					if(callback) {
						callback.bind(this)({
							type: v, 
							now: value, 
							end: v[1] + v[2], 
							target: this
						});
					}
				});
				if(redraw) {
					this.redraw();
				}
			};
			let _animate = () => {
				let now = new Date();
				let progress = now - startTime;
				let percent = progress / duration;
				if(percent < 1) {
					incre(percent, option.step, redraw);
					setTimeout(_animate, Math.min(duration - progress, interval));
				} else {
					incre(1, option.complete, true);
					this._animationList.shift();
					if(this._animationList.length) {
						this._animationList[0]();
					} else {
						this._isAnimating = false;
					}
				}
			}
			let startTime = new Date();
			_animate();
		});
		if(this._animationList.length === 1) {
			this._animationList[0]();
			this._isAnimating = true;
		}
		return this;
	}
	_convertToPaint(point) {
		if(this._paint) {
			point = this._paint._windowToPaint(point);
		}
		return point;
	}
	convertoPaint() {
		[this._left_paint, this._top_paint] = this._convertToPaint([this._left_window, this._top_window]);
		return this;
	}
}
class MultiPath extends Path {
	constructor(option, ...paths) {
		super(paths[0] ? paths[0]._left_window : undefined, paths[0] ? paths[0]._top_window : undefined, option);
		this.list = [];
		this.addRange(...paths);
	}
	add(path, redraw = true) {
		if(!this.list.includes(path)) {
			path._style = this._style;
			path._parent = this;
			this.list.push(path);
			if(!this._left_window) {
				this._left_paint = this._left_window = path._left_window;
				this._top_paint = this._top_window = path._top_window;
			}
			if(redraw) {
				this.redraw();
			}
		}
		return this;
	}
	addRange(...paths) {
		paths.forEach((path, i, a) => this.add(path, i === a.length - 1));
		return this;
	}
	remove(path, redraw = true) {
		let index = this.list.indexOf(path);
		if(index !== -1) {
			this.list.splice(index, 1)[0]._parent = null;
			if(index === 0) {
				this._left_paint = this._left_window = this.list[0] ? this.list[0]._left_window : undefined;
				this._top_paint = this._top_window = this.list[0] ? this.list[0]._top_window : undefined;
			}
			if(redraw) {
				this.redraw();
			}
		}
		return this;
	}
	clear(redraw = true) {
		this.list.length = 0;
		this._left_paint = this._left_window = undefined;
		this._top_paint = this._top_window = undefined;
		if(redraw) {
			this.redraw();
		}
		return this;
	}
	left(value, redraw = true) {
		if(value !== undefined) {
			if(this._left_window !== undefined) {
				let delta = this._left_window;
				super.left(value, false);
				delta = this._left_window - delta;
				this.list.forEach((path, i, a) => path.left(path._left_window + delta, i === a.length - 1));
			}
			return this;
		}
		return this._left_window;
	}
	top(value, redraw = true) {
		if(value !== undefined) {
			if(this._top_window !== undefined) {
				let delta = this._top_window;
				super.top(value, false);
				delta = this._top_window - delta;
				this.list.forEach((path, i, a) => path.top(path._top_window + delta, i === a.length - 1));
			}
			return this;
		}
		return this._top_window;
	}
	clone() {
		return new MultiPath({}, ...MultiPath._copyPath(this, []));
	}
	static _copyPath(path, list) {
		if(path instanceof MultiPath) {
			path.list.forEach(v => MultiPath._copyPath(v, list));
		} else {
			list.push(path.clone());
		}
		return list;
	}
}
class ConnectList {
	constructor(self) {
		this.self = self;
		this.path = [];
		this.line = [];
	}
	add(path, redraw = true) {
		let line = null;
		if(path !== this.self && !this.path.includes(path)) {
			this.path.push(path);
			path.connectList.path.push(this.self);
			line = new ConnectLine(this.self, path);
			this.line.push(line);
			path.connectList.line.push(line);
			if(redraw) {
				this.self.redraw();							
			}
		}
		return line;
	}
	remove(path, redraw = true) {
		let index = this.path.indexOf(path);
		let line = null;
		if(index !== -1) {
			this.path.splice(index, 1);
			line = this.line.splice(this.line.indexOf(this.line.find(v => v.to === path)), 1)[0];
			path.connectList.path.splice(path.connectList.path.indexOf(this.self), 1);
			path.connectList.line.splice(path.connectList.line.indexOf(path.connectList.line.find(v => v.from = this.self)), 1);
			if(redraw) {
				this.self.redraw();							
			}
		}
		return line;
	}
}
class Shape extends Path {
	constructor(left, top, option) {
		super(left, top, option);
		this.connectList = new ConnectList(this);
	}
	connect(path, redraw = true) {
		return this.connectList.add(path, redraw);
	}
	unconnect(path, redraw = true) {
		return this.connectList.remove(path, redraw);
	}
}
class Rect extends Shape {
	constructor(left, top, width, height, option) {
		super(left, top, option);
		this._width = width;
		this._height = height;
	}
	width(value, redraw = true) {
		if(value !== undefined) {
			if(/\s*[-+]=\s*\d+\s*/.exec(value)) {
				value = this._width + parseInt(value.replace(/[^\d\.\-\+]/g, ''));
			}
			this._width = value;
			if(redraw) {
				this.redraw();
			}
			return this;
		}
		return this._width;
	}
	height(value, redraw = true) {
		if(value !== undefined) {
			if(/\s*[-+]=\s*\d+\s*/.exec(value)) {
				value = this_height + parseInt(value.replace(/[^\d\.\-\+]/g, ''));
			}
			this._height = value;
			if(redraw) {
				this.redraw();
			}
			return this;
		}
		return this._height;
	}
	clone() {
		return new Rect(this._left_window, this._top_window, this._width, this._height);
	}
}
class Circle extends Shape {
	constructor(left, top, radius, option, startAngle = 0, endAngle = 360) {
		super(left, top, option);
		this._radius = radius;
		this._startAngle = Circle.toRadian(startAngle);
		this._endAngle = Circle.toRadian(endAngle);
		this._centerLeft_paint = this._centerLeft_window = left + radius;
		this._centerTop_paint = this._centerTop_window = top + radius;
	}
	left(value, redraw = true) {
		if(value !== undefined) {
			super.left(value, false);
			this._centerLeft_window = this._left_window + this._radius;
			if(redraw) {
				this.redraw();
			}
			return this;
		}
		return this._left_window;
	}
	top(value, redraw = true) {
		if(value !== undefined) {
			super.top(value, false);
			this._centerTop_window = this._top_window + this._radius;
			if(redraw) {
				this.redraw();
			}
			return this;
		}
		return this._top_window;
	}
	radius(value, redraw = true) {
		if(value !== undefined) {
			if(/\s*[-+]=\s*\d+\s*/.exec(value)) {
				value = this._radius + parseInt(value.replace(/[^\d\.\-\+]/g, ''));
			}
			this._radius = value;
			if(redraw) {
				this.redraw();
			}
			return this;
		}
		return this._radius;
	}
	centerLeft(value, redraw = true) {
		if(value !== undefined) {
			if(typeof value === 'number') {
				return this.left(value, false).left(`-=${this._radius}`, redraw);							
			} else {
				return this.left(value, redraw);
			}
		}
		return this._centerLeft_window;
	}
	centerTop(value, redraw = true) {
		if(value !== undefined) {
			if(typeof value === 'number') {
				return this.top(value, false).top(`-=${this._radius}`, redraw);
			} else {
				return this.top(value, redraw);
			}
		}
		return this._centerTop_window;
	}
	center(left, top, redraw = true) {
		if(left !== undefined && top !== undefined) {
			return this.centerLeft(left, false).centerTop(top, redraw);
		}
		return {
			left: this._centerLeft_window, 
			top: this._centerTop_window
		};
	}
	startAngle(value, redraw = true) {
		if(value !== undefined) {
			if(/\s*[-+]=\s*\d+\s*/.exec(value)) {
				value = Circle.toDegree(this._startAngle) + parseInt(value.replace(/[^\d\.\-\+]/g, ''));
			}
			this._startAngle = Circle.toRadian(value);
			if(redraw) {
				this.redraw();
			}
			return this;
		}
		return Circle.toDegree(this._startAngle);
	}
	endAngle(value, redraw = true) {
		if(value !== undefined) {
			if(/\s*[-+]=\s*\d+\s*/.exec(value)) {
				value = Circle.toDegree(this._endAngle) + parseInt(value.replace(/[^\d\.\-\+]/g, ''));
			}
			this._endAngle = Circle.toRadian(value);
			if(redraw) {
				this.redraw();
			}
			return this;
		}
		return Circle.toDegree(this._endAngle);
	}
	angle(start, end, redraw = true) {
		if(start !== undefined && end !== undefined) {
			return this.startAngle(start, false).endAngle(end, redraw);
		}
		return {
			start: Circle.toDegree(this._startAngle), 
			end: Circle.toDegree(this._endAngle)
		};
	}
	convertoPaint() {
		super.convertoPaint();
		[this._centerLeft_paint, this._centerTop_paint] = this._convertToPaint([this._centerLeft_window, this._centerTop_window]);
		this.connectList.line.forEach(line => {
			if(line.from === this) {
				line._left_window = this._centerLeft_window;
				line._left_paint = this._centerLeft_paint;
				line._top_window = this._centerTop_window;
				line._top_paint = this._centerTop_paint;
			} else {
				line._right_window = this._centerLeft_window;
				line._right_paint = this._centerLeft_paint;
				line._bottom_window = this._centerTop_window
				line._bottom_paint = this._centerTop_paint;
			}
		});
		return this;
	}
	clone() {
		return new Circle(this._left_window, this._top_window, this._radius, {}, Circle.toDegree(this._startAngle), Circle.toDegree(this._endAngle));
	}
	static toRadian(degree) {
		return -degree * (Math.PI / 180);
	}
	static toDegree(radian) {
		return -radian * (180 / Math.PI);
	}
}
class Ring extends Circle {
	constructor(left, top, radius, option, startAngle, endAngle, ringWidth = radius / 1.5) {
		super(left, top, radius, option, startAngle, endAngle);
		this._ringWidth = ringWidth;
	}
	radius(value, redraw = true, both = true) {
		if(value !== undefined) {
			let delta = this._radius;
			super.radius(value, false);
			delta = this._radius - delta;
			if(both) {
				this._ringWidth += delta;
			}
			if(redraw) {
				this.redraw();
			}
			return this;
		}
		return this._radius;
	}
	ringWidth(value, redraw = true) {
		if(value !== undefined) {
			if(/\s*[-+]=\s*\d+\s*/.exec(value)) {
				value = this._ringWidth + parseInt(value.replace(/[^\d\.\-\+]/g, ''));
			}
			this._ringWidth = value;
			if(redraw) {
				this.redraw();
			}
			return this;
		}
		return this._ringWidth;
	}
	clone() {
		return new Ring(this._left_window, this._top_window, this._radius, {}, Circle.toDegree(this._startAngle), Circle.toDegree(this._endAngle), this._ringWidth);
	}
}
class Polygon extends Shape {
	constructor(option, ...points) {
		super(points[0] ? points[0][0] : undefined, points[0] ? points[0][1] : undefined, option);
		this._points_paint = points;
		this._points_window = points.map(v => v.slice(0));
	}
	left(value, redraw = true) {
		if(value !== undefined) {
			let delta = this._left_window;
			super.left(value, false);
			delta = this._left_window - delta;
			this._points_window.forEach(v => v[0] += delta);
			if(redraw) {
				this.redraw();
			}
			return this;
		}
		return this._left_window;
	}
	top(value, redraw = true) {
		if(value !== undefined) {
			let delta = this._top_window;
			super.top(value, false);
			delta = this._top_window - delta;
			this._points_window.forEach(v => v[1] += delta);
			if(redraw) {
				this.redraw();
			}
			return this;
		}
		return this._top_window;
	}
	points(value, redraw = true) {
		if(value !== undefined) {
			this._points_window = value;
			if(!this._left_window) {
				this._left_window = value[0][0];
				this._top_window = value[0][1];
			}
			this._isLocationChanged = true;
			if(redraw) {
				this.redraw();
			}
			return this;
		}
		return this._points_window;
	}
	convertoPaint() {
		super.convertoPaint();
		this._points_window.forEach((v, i) => this._points_paint[i] = this._convertToPaint(v));
		return this;
	}
	clone() {
		return new Polygon({}, ...this._points_window.map(v => v.slice(0)));
	}
}
class Text extends Shape {
	constructor(text, left, top, option) {
		super(left, top, option);
		this._text = text;
	}
	text(value, redraw = true) {
		if(value !== undefined) {
			this._text = value;
			if(redraw) {
				this.redraw();
			}
			return this;
		}
		return this._text;
	}
	clone() {
		return new Text(this._text, this._left_window, this._top_window);
	}
}
class Line extends Shape {
	constructor(left, top, right, bottom, option) {
		super(left, top, option);
		this._right_paint = this._right_window = right;
		this._bottom_paint = this._bottom_window = bottom;
	}
	left(value, redraw = true, both = true) {
		if(value !== undefined) {
			let delta = this._left_window;
			super.left(value, false);
			if(both) {
				delta = this._left_window - delta;
				this._right_window += delta;
			}
			if(redraw) {
				this.redraw();
			}
			return this;
		}
		return this._left_window;
	}
	top(value, redraw = true, both = true) {
		if(value !== undefined) {
			let delta = this._top_window;
			super.top(value, false);
			if(both) {
				delta = this._top_window - delta;
				this._bottom_window += delta;
			}
			if(redraw) {
				this.redraw();
			}
			return this;
		}
		return this._left_window;
	}
	right(value, redraw = true, both = true, relativeWindow = true) {
		if(value !== undefined) {
			if(typeof value === 'number') {
				if(relativeWindow) {
					if(this._paint) {
						value = this._paint._canvas.width - value;
					} else {
						return this;
					}		
				}
				value = value - this._right_window;
			} else if(/\s*[-+]=\s*\d+\s*/.exec(value)) {
				value = parseInt(value.replace(/[^\d\.\-\+]/g, ''));
			}
			this._right_window += value;
			if(both) {
				this._left_window += value;
			}
			this._isLocationChanged = true;
			if(redraw) {
				this.redraw();
			}
			return this;
		}
		return this._right_window;
	}
	bottom(value, redraw = true, both = true, relativeWindow = true) {
		if(value !== undefined) {
			if(typeof value === 'number') {
				if(relativeWindow) {
					if(this._paint) {
						value = this._paint._canvas.height - value;
					} else {
						return this;
					}
				}
				value = value - this._bottom_window;
			} else if(/\s*[-+]=\s*\d+\s*/.exec(value)) {
				value = parseInt(value.replace(/[^\d\.\-\+]/g, ''));
			}
			this._bottom_window += value;
			if(both) {
				this._top_window += value;
			}
			this._isLocationChanged = true;
			if(redraw) {
				this.redraw();
			}
			return this;
		}
		return this._bottom_window;
	}
	startPoint(left, top, redraw = true) {
		if(left !== undefined && top !== undefined) {
			return this.left(left, false, false).top(top, redraw, false);
		}
		return {
			left: this._left_window, 
			top: this._top_window
		};
	}
	endPoint(right, bottom, redraw = true) {
		if(right !== undefined && bottom !== undefined) {
			return this.right(right, false, false).bottom(bottom, redraw, false);
		}
		return {
			left: this._right_window, 
			top: this._bottom_window
		};
	}
	convertoPaint() {
		super.convertoPaint();
		[this._right_paint, this._bottom_paint] = this._convertToPaint([this._right_window, this._bottom_window]);
		return this;
	}
	clone() {
		return new Line(this._left_window, this._top_window, this._right_window, this._bottom_window);
	}
}
class Curve extends Line {
	constructor(left, top, right, bottom, option, controlLeft = left, controlTop = bottom) {
		super(left, top, right, bottom);
		this._controlLeft_paint = this._controlLeft_window = controlLeft;
		this._controlTop_paint = this._controlTop_window = controlTop;
	}
	left(value, redraw = true, both = true) {
		if(value !== undefined) {
			super.left(value, false, both);
			this._controlLeft_window = this._left_window;
			if(redraw) {
				this.redraw();
			}
			return this;
		}
		return this._left_window;
	}
	top(value, redraw = true, both = true) {
		if(value !== undefined) {
			super.top(value, false, both);
			this._controlTop_window = this._bottom_window;
			if(redraw) {
				this.redraw();
			}
			return this;
		}
		return this._top_window;
	}
	right(value, redraw = true, both = true) {
		if(value !== undefined) {
			super.right(value, false, both);
			this._controlLeft_window = this._left_window;
			if(redraw) {
				this.redraw();
			}
			return this;
		}
		return this._right_window;
	}
	bottom(value, redraw = true, both = true) {
		if(value !== undefined) {
			super.bottom(value, false, both);
			this._controlTop_window = this._bottom_window;
			if(redraw) {
				this.redraw();
			}
			return this;
		}
		return this._bottom_window;
	}
	controlLeft(value, redraw = true) {
		if(value !== undefined) {
			if(typeof value === 'number') {
				value = value - this._controlLeft_window;
			} else if(/\s*[-+]=\s*\d+\s*/.exec(value)) {
				value = parseInt(value.replace(/[^\d\.\-\+]/g, ''));
			}
			this._controlLeft_window += value
			this._isLocationChanged = true;;
			if(redraw) {
				this.redraw();
			}
			return this;
		}
		return this._controlLeft_window;
	}
	controlTop(value, redraw = true) {
		if(value !== undefined) {
			if(typeof value === 'number') {
				value = value - this._controlTop_window;
			} else if(/\s*[-+]=\s*\d+\s*/.exec(value)) {
				value = parseInt(value.replace(/[^\d\.\-\+]/g, ''));
			}
			this._controlTop_window += value;
			this._isLocationChanged = true;
			if(redraw) {
				this.redraw();
			}
			return this;
		}
		return this._controlTop_window;
	}
	control(left, top, redraw = true) {
		if(left !== undefined && top !== undefined) {
			return this.controlLeft(left, false).controlTop(top, redraw);
		}
		return {
			left: this._controlLeft_window, 
			top: this._controlTop_window
		};
	}
	convertoPaint() {
		super.convertoPaint();
		[this._controlLeft_paint, this._controlTop_paint] = this._convertToPaint([this._controlLeft_window, this._controlTop_window]);
		return this;
	}
	clone() {
		return new Curve(this._left_window, this._top_window, this._right_window, this._bottom_window, {}, this._controlLeft_window, this._controlTop_window);
	}
}
class ConnectLine extends Line {
	constructor(shape1, shape2, option) {
		super(shape1._centerLeft_window, shape1._centerTop_window, shape2._centerLeft_window, shape2._centerTop_window);
		this.from = shape1;
		this.to = shape2;
		this._isDrawed = false;
	}
}
class MultiLine extends Polygon {
	clone() {
		return new MultiLine({}, ...this._points_window.map(v => v.slice(0)));
	}
}
class PathQuery {
	constructor(paint) {
		this.list = [];
		this._paint = paint;
		this._quickProperties();
	}
	add(path) {
		if(!this.list.includes(path)) {
			this.list.push(path);
		}
		return this;
	}
	addRange(...paths) {
		paths.forEach(path => this.add(path));
		return this;
	}
	invert() {
		return new PathQuery(this._paint).addRange(this._paint.path.list.filter(path => !this.list.includes(path)));
	}
	redraw() {
		if(this._paint) {
			this._paint.redraw();
		}
		return this;
	}
	clear() {
		this.list.length = 0;
		return this;
	}
	_quickProperties() {
		['display', 'ShowOnTheTopWhenEventTrigger', 'MoveToTopWhenPathBeClicked', 
			'left', 'top', 'font', 'fontSize', 'lineWidth', 'color', 'fillStyle', 
			'id', 'strokeStyle', 'fill', 'stroke', 'style', 'hide', 'show', 
			'shadow', 'shadowOffsetX', 'shadowOffsetY', 'shadowBlur', 'opacity', 
			'shadowColor', 'classText', 'addClass', 'removeClass', 'toggleClass']
			.forEach(type => {
				this[type] = (value, redraw = true) => {
					this.list.forEach((path, i, a) => path[type](value, i === a.length - 1));
					return this;
				};
			});
		['offset', 'animate'].forEach(type => {
			this[type] = (v1, v2, redraw = true) => {
				this.list.forEach((path, i, a) => path[type](v1, v2, i === a.length - 1));
				return this;
			}
		});
		['remove', 'index'].forEach(type => {
			this[type] = (redraw = true) => {
				this.list.forEach((path, i, a) => path[type](i === a.length - 1));
				return this;
			}
		});
		['click', 'contextmenu', 'mouseenter', 'mouseleave', 'mousedown', 'mouseup', 
			'mousedrag']
			.forEach(type => {
				this[type] = (callback, order) => {
					this.list.forEach(path => path[type](callback, order));
					return this;
				};
			});
		this.mousehover = (callback1, callback2, order) => {
			this.list.forEach(path => path.mousehover(callback1, callback2, order));
			return this;
		};
		return this;
	}
}
class PaintPath {
	constructor(paint) {
		this._paint = paint;
		this.list = [];
		this._list = [];
	}
	add(path) {
		if(!this.list.includes(path)) {
			this.list.push(path);
		}
		return this;
	}
	addRange(...paths) {
		paths.forEach(path => this.add(path));
		return this;
	}
	remove(path, redraw = true) {
		let index = this.list.indexOf(path);
		if(index !== -1) {
			this.list.splice(index, 1);
			if(redraw) {
				this.redraw();
			}
		}
		return this;
	}
	last() {
		return this.list[this.list.length - 1];
	}
	moveToEnd(path, redraw = true) {
		let index = this.list.indexOf(path);
		if(index !== -1) {
			this.list.push(this.list.splice(index, 1)[0]);
			if(redraw) {
				this.redraw();
			}
		}
		return this;
	}
	refreshIndex(redraw = true) {
		this.list.sort((a, b) => a._index - b._index);
		if(redraw) {
			this.redraw();
		}
		return this;
	}
	clear(redraw = true) {
		this.list.length =  this._list.length = 0;
		if(redraw) {
			this.redraw();
		}
		return this;
	}
	save(isReplace = false) {
		if(isReplace || !this._list.length) {
			this._list = this.list.slice(0);
		}
		return this;
	}
	restore(redraw = true) {
		this.list = this._list.slice(0);
		this._list.length = 0;
		if(redraw) {
			this.redraw();
		}
		return this;
	}
	find(selector) {
		let pathQuery = new PathQuery(this._paint);
		selector.split(/\s*,\s*/).forEach(s => {
			let path = this.list.slice(0);
			let result = /\s*([\w\*]*)\s*([\.\#\*]*)(\w*)\s*/.exec(s);
			let name = result[1].toLowerCase();
			let type = result[2];
			let classOrId = result[3].toLowerCase();
			if(name !== '' && name !== '*') {
				path = path.filter(v => v.constructor.name.toLowerCase() === name);
			}
			if(name === '*' && type === '' && classOrId === '' || 
				name !== '*' && type === '' && classOrId === '' || 
				type === '*' && classOrId === '') {
				pathQuery.addRange(...path);
			} else if(type !== '' && type !== '*' && classOrId !== '') {
				if(type === '.') {
					pathQuery.addRange(...path.filter(v => v.hasClass(classOrId)));
				} else {
					let item = path.find(v => (v._id + '').toLowerCase() === classOrId);
					if(item) {
						pathQuery.add(item);
					}
				}
			}
		});
		return pathQuery;
	}
	redraw() {
		if(this._paint) {
			this._paint.redraw();
		}
		return this;
	}
}
class PaintStyle {
	constructor(paint) {
		this.list = new Map();
	}
	set(selector, style) {
		this.list.set((selector || '').trim().toLowerCase(), style);
		return this;
	}
	get(selector) {
		return this.list.get((selector || '').trim().toLowerCase()) || {};
	}
	remove(selector) {
		this.list.delete(selector.trim().toLowerCase());
		return this;
	}
	computeStyle(path, isReplace = false) {
		let style = {};
		PaintStyle._setStyle(style, this.get(path.constructor.name.toLowerCase()), isReplace);
		path._classText.split(/\s+/).forEach(v => {
			PaintStyle._setStyle(style, this.get('.' + v));
		}, isReplace);
		PaintStyle._setStyle(style, this.get('#' + path._id), isReplace);
		PaintStyle._setStyle(style, path._style, isReplace);
		return style;
	}
	static _setStyle(o, style, isReplace = false) {
		Object.keys(style).forEach(v => {
			if(o[v]) {
				if(isReplace) {
					o[v] = style[v];
				}
			} else {
				o[v] = style[v];
			}
		});
	}
}
class Paint extends Event {
	constructor(container, option = {}) {
		super();
		this._canvas = document.createElement('canvas');
		this._paint = this._canvas.getContext('2d');
		this._canvas.width = parseInt(getComputedStyle(container).getPropertyValue('width'));
		this._canvas.height = parseInt(getComputedStyle(container).getPropertyValue('height'));
		this._width = this._canvas.width * 2;
		this._height = this._canvas.height * 2;
		this._left = this._offsetLeft = -this._width / 4;
		this._top = this._offsetTop = -this._height / 4;
		this.path = new PaintPath(this);
		this.pathQuery = new PathQuery(this);
		this.style = new PaintStyle();
		this._catchedEventPath = [];
		this._eventList = [];
		this._isEventOpen = option.openEvent !== undefined ? option.openEvent : PaintGlobalOption.Paint.openEvent;
		this.setEvent();
		container.appendChild(this._canvas);
	}
	_windowToPaint(point) {
		return [point[0] - this._offsetLeft, point[1] - this._offsetTop];
	}
	createPath(path) {
		this._paint.beginPath();
		if(!(path instanceof Circle)) {
			this._paint.moveTo(path._left_paint, path._top_paint);
		} else if(Math.abs(path._startAngle - path._endAngle) !== Math.PI * 2) {
			if(!(path instanceof Ring)) {
				this._paint.moveTo(path._centerLeft_paint, path._centerTop_paint);
			}
		}
		if(path instanceof Text) {
			let {width, height} = this._measureText(path);
			this._paint.rect(path._left_paint, path._top_paint - height, width, height);
		} if(path instanceof Rect) {
			this._paint.rect(path._left_paint, path._top_paint, path._width, path._height);
		} else if(path instanceof Circle) {
			this._paint.arc(path._centerLeft_paint, path._centerTop_paint, Math.max(path._radius, 0), path._startAngle, path._endAngle, true);
			if(path instanceof Ring) {
				this._paint.arc(path._centerLeft_paint, path._centerTop_paint, Math.max(path._ringWidth, 0), path._endAngle, path._startAngle, false);
			}
		}  else if(path instanceof Polygon) {
			path._points_paint.forEach(v => this._paint.lineTo(v[0], v[1]));
		}  else if(path instanceof Curve) {
			this._paint.quadraticCurveTo(path._controlLeft_paint, path._controlTop_paint, path._right_paint, path._bottom_paint);
		}  else if(path instanceof Line) {
			this._paint.lineTo(path._right_paint, path._bottom_paint);
		}
		if(!(path instanceof Line || path instanceof MultiLine)) {
			this._paint.closePath();
		}
		return this;
	}
	drawPath(path) {
		this._paint.save();
		let [isFill, isStroke] = path._parent ? 
			[path._parent._isFill, path._parent._isStroke] : 
			[path._isFill, path._isStroke];
		PaintStyle._setStyle(this._paint, this.style.computeStyle(path), true);
		if(path instanceof Line || path instanceof MultiLine) {
			this._paint.stroke();
		} else {
			if(path instanceof Text) {
				if(isFill) {
					this._paint.fillText(path._text, path._left_paint, path._top_paint);
				}
				if(isStroke) {
					this._paint.strokeText(path._text, path._left_paint, path._top_paint);
				}
			} else {
				if(isFill) {
					this._paint.fill();
				}
				if(isStroke) {
					this._paint.stroke();
				}
			}
		}
		this._paint.restore();
		return this;
	}
	clearPaint() {
		[this._canvas.width, this._canvas.height] = [this._canvas.width, this._canvas.height];
		this._paint.translate(this._offsetLeft, this._offsetTop);
		return this;
	}
	draw(path, addPath = true, e = null) {
		if(path._visibility) {
			if(!path._paint) {
				path._paint = this;
			}
			if(addPath) {
				this.path.add(path);
			}
			if(path._isFirstTimeCreate) {
				path.convertoPaint();
				path._isFirstTimeCreate = false;
			} else if(path._display === PaintGlobalOption.Paint.display.window && this._isOffseted) {
				path.convertoPaint();
				if(path === this.path.last()) {
					this._isOffseted = false;
				}
			} else if(path._isLocationChanged) {
				path.convertoPaint();
				path._isLocationChanged = false;
			}
			if(path instanceof MultiPath) {
				path.list.forEach(v => this.draw(v, false, e));
			}
			if(path.connectList) {
				path.connectList.line.forEach(v => {
					if(!v._isDrawed) {
						this.draw(v, false, e);
						v._isDrawed = true;
					} else {
						v._isDrawed = false;
					}
				});
			}
			this.createPath(path);
			if(e) {
				this._checkEvent(path, e);
			}
			this.drawPath(path);
		}
		return this;
	}
	redraw() {
		this.clearPaint();
		this.path.list.forEach(path => this.draw(path, false));
		return this;
	}
	setEvent() {
		['click', 'contextmenu', 'mouseenter', 'mouseleave', 
			'mousedown', 'mouseup', 'mousemove']
			.forEach(type => {
			this._canvas.addEventListener(type, e => {
				this.trigger(e.type, e);
				if(this._isEventOpen) {
					this.clearPaint();
					this.path.list.forEach(path => this.draw(path, false, {
						type: e.type, 
						offsetX: e.offsetX, 
						offsetY: e.offsetY
					}));
					if(this._catchedEventPath.length) {
						let eventObject = {
							order: null, 
							clientX: e.offsetX, 
							clientY: e.offsetY
						};
						eventObject.order = PaintGlobalOption.Event.order.catching;
						this._catchedEventPath.forEach(path => {
							this._executeEvent(path.event, path, eventObject);
						});
						eventObject.order = PaintGlobalOption.Event.order.none;
						let path = this._catchedEventPath[this._catchedEventPath.length - 1];
						this._executeEvent(path.event, path, eventObject);
						eventObject.order = PaintGlobalOption.Event.order.bubbling;
						while(this._catchedEventPath.length) {
							let path = this._catchedEventPath.pop();
							this._executeEvent(path.event, path, eventObject);
						}
					}
				}
			});
		});
		return this;
	}
	openEvent() {
		this._isEventOpen = true;
		return this;
	}
	closeEvent() {
		this._isEventOpen = false;
		return this;
	}
	_executeEvent(type, path, e) {
		this._eventList.push(() => {
			let mousedownedOffset = path._mousedownedOffset;
			path = path._parent ? path._parent : path;
			if(path.hasEvent(type, e.order)) {
				let flag = false;
				if(path._isShowOnTheTopWhenEventTrigger && this.path.last() !== path) {
					this.path.save();
					this.path.moveToEnd(path);
					flag = true;
				}
				let [path_left, path_top] = [
					path._left_window + this._offsetLeft - this._left, 
					path._top_window + this._offsetTop - this._top
				];
				path.trigger(type, {
					type: type, 
					clientX: e.clientX, 
					clientY: e.clientY, 
					offsetX: mousedownedOffset ? mousedownedOffset[0] : e.clientX - path_left, 
					offsetY: mousedownedOffset ? mousedownedOffset[1] : e.clientX - path_top, 
					target: path, 
					order: e.order
				}, e.order);
				if(flag) {
					if(path._isMoveToTopWhenPathBeClicked && type === 'click') {
						this.path.save(true);
					}
					if(type === 'mouseleave') {
						this.path.restore();
					}
				}
			}
			this._eventList.shift();
			if(this._eventList.length) {
				this._eventList[0]();
			}
		});
		if(this._eventList.length === 1) {
			this._eventList[0]();
		}
		return this;
	}
	_checkEvent(path, e) {
		if(this.path.list.every(v => !v._isAnimating) || !path._isAnimating) {
			if(this._getEventType(path, e)) {
				if(this.path.list.every(v => !v._mousedowning) || path._mousedowning) {
					this._catchedEventPath.push(path);
				}
			}
		}
		return this;
	}
	_isPointInPath(path, x, y) {
		if(path instanceof Line || path instanceof MultiLine) {
			let rangeX = [x];
			let rangeY = [y];
			for(let i = path._style.lineWidth / 2; i > 0; i--) {
				rangeX.push(x + i, x - i);
				rangeY.push(y + i, y - i);
			}
			rangeX.sort((a, b) => a - b);
			rangeY.sort((a, b) => a - b);
			for(let i = 0, lenX = rangeX.length; i < lenX; i++) {
				for(let j = 0, lenY = rangeY.length; j < lenY; j++) {
					if(this._paint.isPointInStroke(rangeX[i], rangeY[j])) {
						return true;
					}
				}
			}
		} else {
			return this._paint.isPointInPath(x, y);
		}
		return false;
	}
	_getEventType(path, e) {
		if(e.type === 'mouseup' || e.type === 'mouseleave') {
			path._mousedowning = false;
			path._mousedownedOffset = null;
			if(path._parent) {
				path._parent._mousedowning = false;
			}
		}
		if(this._isPointInPath(path, e.offsetX, e.offsetY)) {
			if(['click', 'contextmenu', 'mousedown', 'mouseup'].includes(e.type)) {
				path.event = path._lastEvent = e.type;
				if(e.type === 'mousedown') {
					path._mousedowning = true;
					if(path._parent) {
						path._parent._mousedowning = true;
					}
					let [path_left, path_top] = path._parent ? 
						[path._parent._left_window, path._parent._top_window] : 
						[path._left_window, path._top_window];
					path_left += this._offsetLeft - this._left;
					path_top += this._offsetTop - this._top;
					if(path instanceof Circle) {
						let offset = path._centerLeft_window - path._radius - path._left_window;
						path_left += offset;
						path_top += offset;
					}
					path._mousedownedOffset = [e.offsetX - path_left, e.offsetY - path_top];
				}
			} else {
				if(path._lastEvent) {
				if(path._mousedowning) {
						path.event = path._lastEvent = 'mousedrag';
					} else if(path._lastEvent === 'mouseleave') {
						path.event = path._lastEvent = 'mouseenter';
					} else {
						path.event = path._lastEvent = 'mousemove';
					}
				} else {
					path.event = path._lastEvent = 'mouseenter';
				}
			}
		} else {
			if(path._lastEvent) {
				if(path._mousedowning) {
					path.event = path._lastEvent = 'mousedrag';
				} else if(path._lastEvent !== 'mouseleave') {
					path.event = path._lastEvent = 'mouseleave';
				} else {
					path.event = path._lastEvent = null;
				}
			}
		}
		return path.event;
	}
	_measureText(path) {
		this._paint.save();
		this._paint.font = path._style.font;
		let width = this._paint.measureText(path._text).width;
		this._paint.restore();
		return {
			width, 
			height: parseInt(path._style.font)
		};
	}
}