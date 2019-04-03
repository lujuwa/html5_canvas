const ChartGlobalOption = {
	style: {
		backgroundColor: 'white'
	}, 
	chart: {
		openEvent: true, 
		showTitle: true, 
		showLegend: true
	}
};

class LegendRect extends Rect {}
class LegendText extends Text {}
class Title extends Text {}
class ValueRect extends Rect {}
class ValueCircle extends Circle {}
class ValueRing extends Ring {}
class TipLine extends MultiLine {}
class TipText extends Text {}

class Chart extends Paint {
	constructor(container, data, option = {}) {
		option.openEvent = option.openEvent !== undefined ? option.openEvent : ChartGlobalOption.chart.openEvent;
		super(container, option);
		this.data = data;
		this.width = this._canvas.width;
		this.height = this._canvas.height;
		this.left = this.width * 0.1;
		this.top = 0;
		this.right = this.width * 0.9;
		this.bottom = this.height * 0.9;
		this.chartPath = [];
		this._showTitle = option.showTitle !== undefined ? option.showTitle : ChartGlobalOption.chart.showTitle;
		this._showLegend = option.showLegend !== undefined ? option.showLegend : ChartGlobalOption.chart.showLegend;
		this._openEvent = option.openEvent;
	}
	showTitle() {
		let titleSize = this.width / 15;
		let title = new Title(this.data.title, this.width / 2, titleSize).fontSize(titleSize)
			.display(1).fillStyle('steelblue');
		this.draw(title);
		title.left(`-=${this._measureText(title).width / 2}`);
		this.chartPath.push(title);
		this.top += titleSize;
		return this;
	}
	showLegend() {
		let legendQuantity = 5;
		let legendWidth = this.width / legendQuantity;
		let legendRectWidth = legendWidth / 3;
		let legendHeight = legendRectWidth / 2;
		let legendTexts = this.data.data.map(v => v.name);
		let yGap = legendHeight / 2;
		legendTexts.forEach((v, i, a) => {
			let _col = i % legendQuantity;
			let _row = parseInt(i / legendQuantity);
			let _left = _col * legendWidth;
			let _top = this.top + _row * legendHeight + (_row + 1) * yGap;
			let legendRect = new LegendRect(_left, _top, legendRectWidth, legendHeight)
				.display(1).fillStyle('steelblue');
			let legendText = new LegendText(v, _left + legendRectWidth, _top + legendHeight).fontSize(legendHeight)
				.display(1);
			this.chartPath.push(legendRect, legendText);
			this.draw(legendRect).draw(legendText);
		});
		this.top += yGap + Math.ceil(legendTexts.length / legendQuantity) * (legendHeight + yGap);
		return this;
	}
}

class LineChart extends Chart {
	constructor(container, data, option) {
		super(container, data, option);
	}
	show() {
		if(this._showTitle) {
			this.showTitle();
		}
		if(this._showLegend) {
			this.showLegend();
		}
		this.top += this.height * 0.1;
		let texts = this.data.data.map(v => v.name);
		let values = this.data.data.map(v => v.value);
		let textSize = this.width / 40;
		let maxValue = Math.max(...values);
		let maxSize = this.width / 20;
		let xAxial = new Line(this.left, this.top, this.left, this.bottom);
		let yAxial = new Line(this.left, this.bottom, this.right, this.bottom);
		let xAxialLength = this.right - this.left;
		let yAxialLength = this.bottom - this.top;
		let xAxialTextQuantity = texts.length;
		let xAxialTextGap = xAxialLength / xAxialTextQuantity;
		let yAxialTextQuantity = Math.min(xAxialTextQuantity, 10);
		let yAxialTextGap = yAxialLength / yAxialTextQuantity;
		let yAxialValueGap = parseInt(yAxialTextGap / yAxialLength * maxValue);
		let lastPoint = null;
		this.draw(xAxial).draw(yAxial);
		for(let i = 0; i < yAxialTextQuantity; i++) {
			let _bottom = this.bottom - i * yAxialTextGap;
			let yAxialText = new Text(i * yAxialValueGap, this.left, _bottom + textSize / 2).fontSize(textSize);
			this.draw(yAxialText);
			yAxialText.left(`-=${this._measureText(yAxialText).width + 5}`);
		}
		texts.forEach((v, i, a) => {
			let _left = this.left + xAxialTextGap / 2 + i * xAxialTextGap;
			let xAxialText = new Text(v, _left, this.bottom + textSize).fontSize(textSize);
			let xAxialLine = new Line(_left, this.bottom, _left, this.top);
			let _top = this.top + (1 - values[i] / maxValue) * yAxialLength;
			let valueSize = values[i] / maxValue * maxSize;
			let valueCircle = new ValueCircle(_left - valueSize, _top - valueSize, valueSize);
			if(i !== 0) {
				let line = new Line(lastPoint[0], lastPoint[1], _left, _top).strokeStyle('gray');
				this.chartPath.push(line);
			}
			lastPoint = [_left, _top];
			this.draw(xAxialLine.strokeStyle('gray')).draw(xAxialText);
			this.chartPath.push(valueCircle);
			xAxialText.left(`-=${this._measureText(xAxialText).width / 2}`);
		});
		let legendRects = this.chartPath.filter(v => v instanceof LegendRect);
		let lines = this.chartPath.filter(v => v instanceof Line);
		let valueCircles = this.chartPath.filter(v => v instanceof ValueCircle);
		valueCircles.forEach((valueCircle, i, a) => {
			let color = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 1)`;
			this.draw(valueCircle.fillStyle(color));
			let radius = valueCircle._radius;
			valueCircle
				.radius(0).animate({
					radius
				}, {
					duration: 500, 
					complete: () => {
						if(i !== a.length - 1) {
							this.draw(lines[i]);
							lines[i].index(-1, i === a.length - 2);
						}
					}
				}, i === a.length - 1)
				.mousehover(function() {
					this.animate({
						radius: radius + radius / 3, 
						shadowBlur: radius / 2
					}, {
						duration: 50, 
						complete() {
							this.animate({
								radius: radius + radius / 4
							}, {
								duration: 50
							});
						}
					});
				}, function() {
					this.animate({
						radius: radius - radius / 5, 
						shadowBlur: 0
					}, {
						duration: 50, 
						complete() {
							this.animate({
								radius: radius
							}, {
								duration: 50
							});
						}
					});
				})
				.mousemove((e) => {
					this.draw(new Text(values[i], e.clientX, e.clientY).fontSize(textSize), false);
				});
			if(this._showLegend) {
				let legendRect = legendRects[i];
				legendRect
					.fillStyle(color)
					.mousehover(() => {
						this._executeEvent('mouseenter', valueCircle, {
							clientX: valueCircle._centerLeft_window, 
							clientY: valueCircle._centerTop_window, 
							order: 2
						});
						legendRect.animate({
							opacity: .8
						}, {
							duration: 50
						});
					}, () => {
						this._executeEvent('mouseleave', valueCircle, {
							clientX: valueCircle._left_window, 
							clientY: valueCircle._top_window, 
							order: 2
						});
						legendRect.animate({
							opacity: 1
						}, {
							duration: 50
						});
					});
			}
		});
		return this;
	}
}

class BarChart extends Chart {
	constructor(container, data, option) {
		super(container, data, option);
	}
	show() {
		if(this._showTitle) {
			this.showTitle();
		}
		if(this._showLegend) {
			this.showLegend();
		}
		this.top += this.height * 0.1;
		let texts = this.data.data.map(v => v.name);
		let values = this.data.data.map(v => v.value);
		let textSize = this.width / 40;
		let maxValue = Math.max(...values);
		let xAxial = new Line(this.left, this.top, this.left, this.bottom);
		let yAxial = new Line(this.left, this.bottom, this.right, this.bottom);
		let xAxialLength = this.right - this.left;
		let yAxialLength = this.bottom - this.top;
		let xAxialTextQuantity = texts.length;
		let xAxialTextGap = xAxialLength / xAxialTextQuantity;
		let yAxialTextQuantity = Math.min(xAxialTextQuantity, 10);
		let yAxialTextGap = yAxialLength / yAxialTextQuantity;
		let yAxialValueGap = parseInt(yAxialTextGap / yAxialLength * maxValue);
		let rectWidth = xAxialTextGap / 3;
		this.draw(xAxial).draw(yAxial);
		for(let i = 0; i < yAxialTextQuantity; i++) {
			let _bottom = this.bottom - i * yAxialTextGap;
			let yAxialLine = new Line(this.left, _bottom, this.right, _bottom);
			let yAxialText = new Text(i * yAxialValueGap, this.left, _bottom + textSize / 2).fontSize(textSize);
			if(i !== 0) {
				this.draw(yAxialLine.strokeStyle('gray'));
			}
			this.draw(yAxialText);
			yAxialText.left(`-=${this._measureText(yAxialText).width + 5}`);
		}
		texts.forEach((v, i, a) => {
			let _left = this.left + xAxialTextGap / 2 + i * xAxialTextGap;
			let xAxialText = new Text(v, _left, this.bottom + textSize).fontSize(textSize);
			let _top = this.top + (1 - values[i] / maxValue) * yAxialLength;
			let valueRect = new ValueRect(_left - rectWidth / 2, _top, rectWidth, this.bottom - _top);
			this.draw(xAxialText);
			this.chartPath.push(valueRect);
			xAxialText.left(`-=${this._measureText(xAxialText).width / 2}`);
		});
		let legendRects = this.chartPath.filter(v => v instanceof LegendRect);
		let valueRects = this.chartPath.filter(v => v instanceof ValueRect);
		valueRects.forEach((valueRect, i, a) => {
			let color = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 1)`;
			this.draw(valueRect.fillStyle(color));
			let height = valueRect._height;
			let top = valueRect._top_window;
			valueRect
				.height(0).top(top + height).animate({
					height, 
					top
				}, {
					duration: 500
				}, i === a.length - 1)
				.mousehover(function() {
					this.animate({
						opacity: .8
					}, {
						duration: 50
					});
				}, function() {
					this.animate({
						opacity: 1
					}, {
						duration: 50
					});
				})
				.mousemove((e) => {
					this.draw(new Text(values[i], e.clientX, e.clientY).fontSize(textSize), false);
				});
			if(this._showLegend) {
				let legendRect = legendRects[i];
				legendRect
					.fillStyle(color)
					.mousehover(() => {
						this._executeEvent('mouseenter', valueRect, {
							clientX: valueRect._centerLeft_window, 
							clientY: valueRect._centerTop_window, 
							order: 2
						});
						legendRect.animate({
							opacity: .8
						}, {
							duration: 50
						});
					}, () => {
						this._executeEvent('mouseleave', valueRect, {
							clientX: valueRect._centerLeft_window, 
							clientY: valueRect._centerTop_window, 
							order: 2
						});
						legendRect.animate({
							opacity: 1
						}, {
							duration: 50
						});
					});
			}
		});
		return this;
	}
}

class BarChart2 extends Chart {
	constructor(container, data, option) {
		super(container, data, option);
	}
	show() {
		if(this._showTitle) {
			this.showTitle();
		}
		if(this._showLegend) {
			this.showLegend();
		}
		this.top += this.height * 0.1;
		let texts = this.data.data.map(v => v.name);
		let values = this.data.data.map(v => v.value);
		let textSize = this.width / 40;
		let maxValue = Math.max(...values);
		let xAxial = new Line(this.left, this.top, this.left, this.bottom);
		let yAxial = new Line(this.left, this.bottom, this.right, this.bottom);
		let xAxialLength = this.right - this.left;
		let yAxialLength = this.bottom - this.top;
		let yAxialTextQuantity = texts.length;
		let yAxialTextGap = yAxialLength / yAxialTextQuantity;
		let xAxialTextQuantity = Math.min(yAxialTextQuantity, 10);
		let xAxialTextGap = xAxialLength / xAxialTextQuantity;
		let xAxialValueGap = parseInt((xAxialTextGap / xAxialLength) * maxValue);
		let rectHeight = xAxialTextGap / 3;
		this.draw(xAxial).draw(yAxial);
		texts.forEach((v, i, a) => {
			let _bottom = this.bottom - (yAxialTextGap / 2 + i * yAxialTextGap);
			let yAxialText = new Text(v, this.left, _bottom + textSize / 2).fontSize(textSize);
			let valueRect = new ValueRect(this.left, _bottom - rectHeight / 2, values[i] / maxValue * xAxialLength, rectHeight);
			this.draw(yAxialText);
			this.chartPath.push(valueRect);
			yAxialText.left(`-=${this._measureText(yAxialText).width + 5}`);
		});
		for(let i = 0; i < xAxialTextQuantity; i++) {
			let _left = this.left + i * xAxialTextGap;
			let xAxialText = new Text(i * xAxialValueGap, _left, this.bottom + textSize).fontSize(textSize);
			let xAxialLine = new Line(_left, this.top, _left, this.bottom);
			this.draw(xAxialLine.strokeStyle('gray')).draw(xAxialText);
			xAxialText.left(`-=${this._measureText(xAxialText).width / 2}`);
		}
		let legendRects = this.chartPath.filter(v => v instanceof LegendRect);
		let valueRects = this.chartPath.filter(v => v instanceof ValueRect);
		valueRects.forEach((valueRect, i, a) => {
			let color = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 1)`;
			this.draw(valueRect.fillStyle(color));
			let width = valueRect._width;
			valueRect
				.width(0).animate({
					width
				}, {
					duration: 500
				}, i === a.length - 1)
				.mousehover(function() {
					this.animate({
						opacity: .8
					}, {
						duration: 50
					});
				}, function() {
					this.animate({
						opacity: 1
					}, {
						duration: 50
					});
				})
				.mousemove((e) => {
					this.draw(new Text(values[i], e.clientX, e.clientY).fontSize(textSize), false);
				});
			if(this._showLegend) {
				let legendRect = legendRects[i];
				legendRect
					.fillStyle(color)
					.mousehover(() => {
						this._executeEvent('mouseenter', valueRect, {
							clientX: valueRect._centerLeft_window, 
							clientY: valueRect._centerTop_window, 
							order: 2
						});
						legendRect.animate({
							opacity: .8
						}, {
							duration: 50
						});
					}, () => {
						this._executeEvent('mouseleave', valueRect, {
							clientX: valueRect._centerLeft_window, 
							clientY: valueRect._centerTop_window, 
							order: 2
						});
						legendRect.animate({
							opacity: 1
						}, {
							duration: 50
						});
					});
			}
		});
		return this;
	}
}

class RingChart extends Chart {
	constructor(container, data, option) {
		super(container, data, option);
	}
	show() {
		if(this._showTitle) {
			this.showTitle();
		}
		if(this._showLegend) {
			this.showLegend();
		}
		this.top += this.height * 0.1;
		let texts = this.data.data.map(v => v.name);
		let values = this.data.data.map(v => v.value);
		let textSize = this.width / 40;
		let fanTipLineEndLength = this.width / 25;
		let maxSize = (this.bottom - this.top) / 2;
		let centerLeft = (this.left + this.right) / 2;
		let centerTop = (this.top + this.bottom) / 2;
		let perAngle = 360 / values.reduce((t, v) => t += v, 0);
		let startAngle = 0;
		let radius = maxSize;
		values.forEach((v, i, a) => {
			let angle = v * perAngle;
			let valueFan = new ValueRing(centerLeft - radius, centerTop - radius, radius, {}, startAngle, startAngle + angle);
			let middleAngle = Circle.toRadian((startAngle + startAngle + angle) / 2);
			let fanTipLineStartPoint = [
				centerLeft + Math.cos(middleAngle) * radius, 
				centerTop + Math.sin(middleAngle) * radius, 
			];
			let fanTipLineOffset = radius + radius / 4;
			let fanTipLineTurnPoint = [
				centerLeft + Math.cos(middleAngle) * fanTipLineOffset, 
				centerTop + Math.sin(middleAngle) * fanTipLineOffset];
			let fanTipLineEndDirection = fanTipLineTurnPoint[0] < centerLeft ? -1 : 1;
			let fanTipLineEndPoint = [
				fanTipLineTurnPoint[0] + fanTipLineEndLength * fanTipLineEndDirection, 
				fanTipLineTurnPoint[1]];
			let fanTipLine = new TipLine({}, fanTipLineStartPoint, fanTipLineTurnPoint, fanTipLineEndPoint);
			let fanTipText = new TipText(v, fanTipLineEndPoint[0], fanTipLineEndPoint[1] + textSize / 2).fontSize(textSize);
			startAngle += angle;
			if(fanTipLineEndDirection < 0) {
				fanTipText.left(`-=${this._measureText(fanTipText).width}`);
			}
			this.chartPath.push(valueFan, fanTipLine, fanTipText);
		});
		let legendRects = this.chartPath.filter(v => v instanceof LegendRect);
		let valueRings = this.chartPath.filter(v => v instanceof ValueRing);
		let tipLines = this.chartPath.filter(v => v instanceof TipLine);
		let tipTexts = this.chartPath.filter(v => v instanceof TipText);
		valueRings.forEach((valueRing, i, a) => {
			let color = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 1)`;
			let tipLine = tipLines[i];
			let tipText = tipTexts[i];
			this.draw(valueRing.fillStyle(color));
			let radius = valueRing._radius;
			valueRing
				.radius(0).animate({
					radius
				}, {
					duration: 500, 
					complete: () => {
						this.draw(tipLine.strokeStyle('gray'));
						this.draw(tipText);
						tipLine.index(-1, i === a.length - 1);
					}
				}, i === a.length - 1)
				.mousehover(function() {
					this.animate({
						radius: radius + radius / 4, 
						shadowBlur: radius / 2
					}, {
						duration: 50, 
						complete() {
							this.animate({
								radius: radius + radius / 5
							}, {
								duration: 50
							});
						}
					});
				}, function() {
					this.animate({
						radius: radius - radius / 6, 
						shadowBlur: 0
					}, {
						duration: 50, 
						complete() {
							this.animate({
								radius: radius
							}, {
								duration: 50
							});
						}
					});
				});
			if(this._showLegend) {
				let legendRect = legendRects[i];
				legendRect
					.fillStyle(color)
					.mousehover(() => {
						this._executeEvent('mouseenter', valueRing, {
							clientX: valueRing._centerLeft_window, 
							clientY: valueRing._centerTop_window, 
							order: 2
						});
						legendRect.animate({
							opacity: .8
						}, {
							duration: 50
						});
					}, () => {
						this._executeEvent('mouseleave', valueRing, {
							clientX: valueRing._left_window, 
							clientY: valueRing._top_window, 
							order: 2
						});
						legendRect.animate({
							opacity: 1
						}, {
							duration: 50
						});
					});
			}
		});
		return this;
	}
}

class FanChart extends Chart {
	constructor(container, data, option) {
		super(container, data, option);
	}
	show() {
		if(this._showTitle) {
			this.showTitle();
		}
		if(this._showLegend) {
			this.showLegend();
		}
		this.top += this.height * 0.1;
		let texts = this.data.data.map(v => v.name);
		let values = this.data.data.map(v => v.value);
		let textSize = this.width / 40;
		let fanTipLineEndLength = this.width / 25;
		let maxSize = (this.bottom - this.top) / 2;
		let centerLeft = (this.left + this.right) / 2;
		let centerTop = (this.top + this.bottom) / 2;
		let perAngle = 360 / values.reduce((t, v) => t += v, 0);
		let startAngle = 0;
		let radius = maxSize;
		values.forEach((v, i, a) => {
			let angle = v * perAngle;
			let valueFan = new ValueCircle(centerLeft - radius, centerTop - radius, radius, {}, startAngle, startAngle + angle);
			let middleAngle = Circle.toRadian((startAngle + startAngle + angle) / 2);
			let fanTipLineStartPoint = [
				centerLeft + Math.cos(middleAngle) * radius, 
				centerTop + Math.sin(middleAngle) * radius, 
			];
			let fanTipLineOffset = radius + radius / 4;
			let fanTipLineTurnPoint = [
				centerLeft + Math.cos(middleAngle) * fanTipLineOffset, 
				centerTop + Math.sin(middleAngle) * fanTipLineOffset];
			let fanTipLineEndDirection = fanTipLineTurnPoint[0] < centerLeft ? -1 : 1;
			let fanTipLineEndPoint = [
				fanTipLineTurnPoint[0] + fanTipLineEndLength * fanTipLineEndDirection, 
				fanTipLineTurnPoint[1]];
			let fanTipLine = new TipLine({}, fanTipLineStartPoint, fanTipLineTurnPoint, fanTipLineEndPoint);
			let fanTipText = new TipText(v, fanTipLineEndPoint[0], fanTipLineEndPoint[1] + textSize / 2).fontSize(textSize);
			startAngle += angle;
			if(fanTipLineEndDirection < 0) {
				fanTipText.left(`-=${this._measureText(fanTipText).width}`);
			}
			this.chartPath.push(valueFan, fanTipLine, fanTipText);
		});
		let legendRects = this.chartPath.filter(v => v instanceof LegendRect);
		let valueCircles = this.chartPath.filter(v => v instanceof ValueCircle);
		let tipLines = this.chartPath.filter(v => v instanceof TipLine);
		let tipTexts = this.chartPath.filter(v => v instanceof TipText);
		valueCircles.forEach((valueCircle, i, a) => {
			let color = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 1)`;
			let tipLine = tipLines[i];
			let tipText = tipTexts[i];
			this.draw(valueCircle.fillStyle(color));
			let radius = valueCircle._radius;
			valueCircle
				.radius(0).animate({
					radius
				}, {
					duration: 500, 
					complete: () => {
						this.draw(tipLine.strokeStyle('gray'));
						this.draw(tipText);					
						tipLine.index(-1, i === a.length - 1);
					}
				}, i === a.length - 1)
				.mousehover(function() {
					this.animate({
						radius: radius + radius / 4, 
						shadowBlur: radius / 2
					}, {
						duration: 50, 
						complete() {
							this.animate({
								radius: radius + radius / 5
							}, {
								duration: 50
							});
						}
					});
				}, function() {
					this.animate({
						radius: radius - radius / 6, 
						shadowBlur: 0
					}, {
						duration: 50, 
						complete() {
							this.animate({
								radius: radius
							}, {
								duration: 50
							});
						}
					});
				});
			if(this._showLegend) {
				let legendRect = legendRects[i];
				legendRect
					.fillStyle(color)
					.mousehover(() => {
						this._executeEvent('mouseenter', valueCircle, {
							clientX: valueCircle._centerLeft_window, 
							clientY: valueCircle._centerTop_window, 
							order: 2
						});
						legendRect.animate({
							opacity: .8
						}, {
							duration: 50
						});
					}, () => {
						this._executeEvent('mouseleave', valueCircle, {
							clientX: valueCircle._left_window, 
							clientY: valueCircle._top_window, 
							order: 2
						});
						legendRect.animate({
							opacity: 1
						}, {
							duration: 50
						});
					});
			}
		});
		return this;
	}
}

class FanChart2 extends Chart {
	constructor(container, data, option) {
		super(container, data, option);
		this.data.data.sort((a, b) => b.value - a.value);
	}
	show() {
		if(this._showTitle) {
			this.showTitle();
		}
		if(this._showLegend) {
			this.showLegend();
		}
		this.top += this.height * 0.1;
		let texts = this.data.data.map(v => v.name);
		let values = this.data.data.map(v => v.value);
		let maxValue = Math.max(...values);
		let textSize = this.width / 40;
		let fanTipLineEndLength = this.width / 25;
		let maxSize = (this.bottom - this.top) / 2;
		let centerLeft = (this.left + this.right) / 2;
		let centerTop = (this.top + this.bottom) / 2;
		let perAngle = 360 / values.reduce((t, v) => t += v, 0);
		let startAngle = 0;
		values.forEach((v, i, a) => {
			let angle = v * perAngle;
			let radius = v / maxValue * maxSize;
			let valueFan = new ValueCircle(centerLeft - radius, centerTop - radius, radius, {}, startAngle, startAngle + angle);
			let middleAngle = Circle.toRadian((startAngle + startAngle + angle) / 2);
			let fanTipLineStartPoint = [
				centerLeft + Math.cos(middleAngle) * radius, 
				centerTop + Math.sin(middleAngle) * radius, 
			];
			let fanTipLineOffset = radius + radius / 4;
			let fanTipLineTurnPoint = [
				centerLeft + Math.cos(middleAngle) * fanTipLineOffset, 
				centerTop + Math.sin(middleAngle) * fanTipLineOffset];
			let fanTipLineEndDirection = fanTipLineTurnPoint[0] < centerLeft ? -1 : 1;
			let fanTipLineEndPoint = [
				fanTipLineTurnPoint[0] + fanTipLineEndLength * fanTipLineEndDirection, 
				fanTipLineTurnPoint[1]];
			let fanTipLine = new TipLine({}, fanTipLineStartPoint, fanTipLineTurnPoint, fanTipLineEndPoint);
			let fanTipText = new TipText(v, fanTipLineEndPoint[0], fanTipLineEndPoint[1] + textSize / 2).fontSize(textSize);
			startAngle += angle;
			if(fanTipLineEndDirection < 0) {
				fanTipText.left(`-=${this._measureText(fanTipText).width}`);
			}
			this.chartPath.push(valueFan, fanTipLine, fanTipText);
		});
		let legendRects = this.chartPath.filter(v => v instanceof LegendRect);
		let valueCircles = this.chartPath.filter(v => v instanceof ValueCircle);
		let tipLines = this.chartPath.filter(v => v instanceof TipLine);
		let tipTexts = this.chartPath.filter(v => v instanceof TipText);
		valueCircles.forEach((valueCircle, i, a) => {
			let color = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 1)`;
			let tipLine = tipLines[i];
			let tipText = tipTexts[i];
			this.draw(valueCircle.fillStyle(color));
			let radius = valueCircle._radius;
			valueCircle
				.radius(0).animate({
					radius
				}, {
					duration: 500, 
					complete: () => {
						this.draw(tipLine.strokeStyle('gray'));
						this.draw(tipText);
						tipLine.index(-1, i === a.length - 1);
					}
				}, i === a.length - 1)
				.mousehover(function() {
					this.animate({
						radius: radius + radius / 4, 
						shadowBlur: radius / 2
					}, {
						duration: 50, 
						complete() {
							this.animate({
								radius: radius + radius / 5
							}, {
								duration: 50
							});
						}
					});
				}, function() {
					this.animate({
						radius: radius - radius / 6, 
						shadowBlur: 0
					}, {
						duration: 50, 
						complete() {
							this.animate({
								radius: radius
							}, {
								duration: 50
							});
						}
					});
				});
			if(this._showLegend) {
				let legendRect = legendRects[i];
				legendRect
					.fillStyle(color)
					.mousehover(() => {
						this._executeEvent('mouseenter', valueCircle, {
							clientX: valueCircle._centerLeft_window, 
							clientY: valueCircle._centerTop_window, 
							order: 2
						});
						legendRect.animate({
							opacity: .8
						}, {
							duration: 50
						});
					}, () => {
						this._executeEvent('mouseleave', valueCircle, {
							clientX: valueCircle._left_window, 
							clientY: valueCircle._top_window, 
							order: 2
						});
						legendRect.animate({
							opacity: 1
						}, {
							duration: 50
						});
					});
			}
		});
		return this;
	}
}

class GraphChart extends Chart {
	constructor(container, data, option) {
		super(container, data, option);
	}
	show() {
		if(this._showTitle) {
			this.showTitle();
		}
		if(this._showLegend) {
			this.showLegend();
		}
		this.top += this.height * 0.1;
		let xLength = this.right - this.left;
		let yLength = this.bottom - this.top;
		let texts = this.data.data.map(v => v.name);
		let values = this.data.data.map(v => v.value);
		let textSize = this.width / 40;
		let maxValue = Math.max(...values);
		let maxSize = this.width / 20;
		values.forEach((v, i) => {
			let valueSize = v / maxValue * maxSize;
			let _left = this.left + Math.random() * (xLength - valueSize);
			let _top = this.top + Math.random() * (yLength - valueSize);
			let valueCircle = new ValueCircle(_left, _top, valueSize);
			valueCircle._id = texts[i];
			this.chartPath.push(valueCircle);
		});
		let legendRects = this.chartPath.filter(v => v instanceof LegendRect);
		let valueCircles = this.chartPath.filter(v => v instanceof ValueCircle);
		valueCircles.forEach((valueCircle, i, a) => {
			let color = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 1)`;
			this.draw(valueCircle.fillStyle(color));
			let radius = valueCircle._radius;
			valueCircle
				.radius(0).animate({
					radius
				}, {
					duration: 500, 
					complete: () => {
						if(i === a.length - 1) {
							this.data.connect.forEach(line => {
								let shape1 = this.chartPath.find(path => path._id === line[0]);
								let shape2 = this.chartPath.find(path => path._id === line[1]);
								if(shape1 && shape2) {
									this.chartPath.push(shape1.connect(shape2).strokeStyle('gray'));
								}
							});
						}
					}
				}, i === a.length - 1)
				.mousehover(function() {
					this.animate({
						radius: radius + radius / 3, 
						shadowBlur: radius / 2
					}, {
						duration: 50, 
						complete() {
							this.animate({
								radius: radius + radius / 4
							}, {
								duration: 50
							});
						}
					});
				}, function() {
					this.animate({
						radius: radius - radius / 5, 
						shadowBlur: 0
					}, {
						duration: 50, 
						complete() {
							this.animate({
								radius: radius
							}, {
								duration: 50
							});
						}
					});
				})
				.mousedrag(function(e) {
					this.offset(e.clientX - e.offsetX, e.clientY - e.offsetY);
				});
			if(this._showLegend) {
				let legendRect = legendRects[i];
				legendRect
					.fillStyle(color)
					.mousehover(() => {
						this._executeEvent('mouseenter', valueCircle, {
							clientX: valueCircle._centerLeft_window, 
							clientY: valueCircle._centerTop_window, 
							order: 2
						});
						legendRect.animate({
							opacity: .8
						}, {
							duration: 50
						});
					}, () => {
						this._executeEvent('mouseleave', valueCircle, {
							clientX: valueCircle._left_window, 
							clientY: valueCircle._top_window, 
							order: 2
						});
						legendRect.animate({
							opacity: 1
						}, {
							duration: 50
						});
					});
			}
		});
		this.showOperationBar();
		return this;
	}
	showOperationBar() {
		let textSize = this.width / 40;
		let width = this.width / 32;
		let lineWidth = width / 4;
		let isAnimating = false;
		let toRectButton = new Rect(lineWidth / 2, this._canvas.height - width - lineWidth / 2, width, width)
			.display(1).lineWidth(lineWidth).fill(false).strokeStyle('steelblue').stroke()
			.mousemove((e) => this.draw(new Text('to rect', e.clientX, e.clientY).fontSize(textSize), false))
			.click(() => {
				if(!isAnimating) {
					isAnimating = true;
					this.toRect(() => isAnimating = false);
					toRectButton.animate({
						opacity: .5
					}, {
						duration: 50
					});
					toCircleButton.animate({
						opacity: 1
					}, {
						duration: 50
					});
				}
			});
		let toCircleButton = new Circle(lineWidth / 2, this._canvas.height - width * 2 - lineWidth * 2, width / 2)
			.display(1).lineWidth(lineWidth).fill(false).strokeStyle('steelblue').stroke()
			.mousemove((e) => this.draw(new Text('to circle', e.clientX, e.clientY).fontSize(textSize), false))
			.click(() => {
				if(!isAnimating) {
					isAnimating = true;
					this.toCircle(() => isAnimating = false);
					toCircleButton.animate({
						opacity: .5
					}, {
						duration: 50
					});
					toRectButton.animate({
						opacity: 1
					}, {
						duration: 50
					});
				}
			});
		this.chartPath.push(toRectButton, toCircleButton);
		this.draw(toRectButton).draw(toCircleButton);
		return this;
	}
	toRect(complete) {
		let xLength = this.right - this.left;
		let yLength = this.bottom - this.top;
		let values = this.data.data.map(v => v.value);
		let scale = xLength / yLength;
		let valueCircles = this.chartPath.filter(v => v instanceof ValueCircle);
		let xAxialQuantity = 0;
		for(let len = valueCircles.length; xAxialQuantity * scale < len; xAxialQuantity++);
		let xGap = xLength / xAxialQuantity;
		let yGap = yLength / Math.ceil(valueCircles.length / xAxialQuantity);
		valueCircles
			.slice(0).sort((a, b) => b._radius - a._radius)
			.forEach((valueRect, i, a) => {
				let _left = this.left + xGap / 2 + i % xAxialQuantity * xGap;
				let _top = this.top + yGap / 2 + parseInt(i / xAxialQuantity) * yGap;
				valueRect.animate({
					centerLeft: _left, 
					centerTop: _top
				}, {
					duration: 500, 
					complete() {
						complete(this);
					}
				}, i === a.length - 1);
			});
		return this;
	}
	toCircle(complete) {
		let centerLeft = (this.left + this.right) / 2;
		let centerTop = (this.top + this.bottom) / 2;
		let values = this.data.data.map(v => v.value);
		let valueCircles = this.chartPath.filter(v => v instanceof ValueCircle);
		let radius = (this.bottom - this.top) / 2;
		let angleGap = 360 / values.length;
		valueCircles
			.slice(0).sort((a, b) => a._radius - b._radius)
			.forEach((valueRect, i, a) => {
				let angle = -Circle.toRadian(i * angleGap);
				let _left = centerLeft + Math.cos(angle) * radius;
				let _top = centerTop + Math.sin(angle) * radius;
				valueRect.animate({
					centerLeft: _left, 
					centerTop: _top
				}, {
					duration: 500, 
					complete() {
						complete(this);
					}
				}, i === a.length - 1);
			});
	}
}