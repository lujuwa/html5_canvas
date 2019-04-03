// 引入paint.js
<script src="paint.js"></script>

// 创建画布
let paint = new Paint(document.querySelector('div.paint'));

// 创建基本图形
let rect = new Rect(50, 50, 80, 50);
let circle = new Circle(50, 100, 40);
let polygon = new Polygon({}, [50, 230], [90, 180], [130, 230]);
let text = new Text('canvas', 50, 280);
let line = new Line(50, 280, 130, 330);
let curve = new Curve(50, 330, 130, 380);
let multiLine = new MultiLine({}, [50, 380], [50, 430], [130, 430]);
let ring = new Ring(50, 430, 40);

// 创建复合图形
let multiPath = new MultiPath()
    .addRange(
        rect.clone(), 
        circle.clone(), 
        polygon.clone(), 
        text.clone(), 
        line.clone(), 
        curve.clone(), 
        multiLine.clone(), 
        ring.clone()
    ).left('+=100');
    
// 绘制图形
paint
    .draw(rect).draw(circle).draw(polygon).draw(text).draw(line)
    .draw(curve).draw(multiLine).draw(ring).draw(multiPath);
    
// 修改样式
rect
    .strokeStyle('red')
    .fill(false)
    .stroke()
    .lineWidth(3)
    .left(60)
    .top('-=5')
    .shadowOffsetY(5)
    .shadowOffsetX(5);
circle
    .fillStyle('blue')
    .endAngle('-=200')
    .offset('-=10', '+=15')
    .shadowBlur(10);
polygon
    .color('lime')
    .shadowBlur(10);
text
    .fontSize(25)
    .shadow('3px 3px 3px gray');
line
    .lineWidth(5)
    .color('orange')
    .startPoint('-=10', '+=10')
    .endPoint('+=10', '-=20')
    .top('+=5');
curve
    .lineWidth(8)
    .color('cyan')
    .control(curve.right(), curve.top())
    .controlLeft((curve.left() + curve.right()) / 2)
    .shadow('3px 3px 3px gray');
multiLine
    .lineWidth(4)
    .offset('+=10', '-=10')
    .opacity(.6);
ring
    .angle(-50, 40)
    .fillStyle('tomato')
    .left('-=10')
    .shadowBlur(3)
    .ringWidth('-=10');
multiPath
    .color('steelblue')
    .fill(false)
    .stroke()
    .fontSize(30)
    .lineWidth(2);
    
// 动画使用
rect
    .animate({
        left: '-=20', 
        top: '-=20', 
        width: 10, 
        height: 10
    }, {
        duration: 500
    })
    .delay(500)
    .animate({
        left: rect.left(), 
        top: rect.top(), 
        width: rect.width(), 
        height: rect.height()
    });
circle
    .animate({
        endAngle: 360, 
        radius: '+=10'
    }, {
        complete() {
            this.animate({
                endAngle: 200, 
                radius: 30
            });
        }
    });
text
    .animate({
        fontSize: '+=10'
    }, {
        step() {
            this.fillStyle(`rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 1)`);
        }, 
        complete() {
            this.animate({
                fontSize: 25
            });
        }
    });
polygon
    .animate({
        top: '+=20', 
        left: '-=20'
    });
line
    .animate({
        lineWidth: '+=5'
    })
    .animate({
        lineWidth: '-=5'
    });
multiPath
    .animate({
        left: '+=50', 
        top: '+=50'
    })
    .animate({
        left: '+=50', 
        top: '-=50'
    }, {
        complete() {
            //this.fill();
        }
    });
    
// 事件绑定
rect
    .fillStyle('skyblue')
    .on('click', () => alert('clicked rect'))
    .on('mouseenter', function() {this.fill();})
    .on('mouseleave', function() {this.fill(false);});
circle
    .click(() => alert('clicked circle'))
    .mousehover(
        function() {this.radius('+=5').endAngle('+=50')}, 
        function() {this.radius('-=5').startAngle('+=50')}
    );
polygon
    .mousemove((e) => {
        paint.draw(
            new Text('polygon', e.clientX, e.clientY).fontSize(15)
        , false);
    })
    .mousedrag(function(e) {
        this.offset(e.clientX - e.offsetX, e.clientY - e.offsetY);
    });
text
    .mousehover(function() {
        this.fontSize('+=5');
    }, function() {
        this.fontSize('-=5');
    })
    .mousehover(function() {
        this.fillStyle(`rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 1)`);
    });
line
    .mousedrag(function(e) {
        this.startPoint(e.clientX, e.clientY);
    });
curve
    .mousedrag(function(e) {
        this.control(e.clientX, e.clientY);
        paint.draw(
            new Text(`(${e.clientX}, ${e.clientY})`, e.clientX, e.clientY).fontSize(15)
        , false);
    });
multiLine
    .mousehover(function() {
        this.lineWidth('+=3').shadow('5p 5px 5px yellow');
    }, function() {
        this.lineWidth('-=3').shadow('0px 0px 0px yellow');
    });
ring
    .mousehover(function() {
        this.fill(false).stroke();
    }, function() {
        this.fill().stroke(false);
    });
multiPath
    .mousedrag(function(e) {
        this.offset(e.clientX - e.offsetX, e.clientY - e.offsetY);
    });
    
// 路径类和画布样式表
paint
    .draw(rect.clone().left('+=300').addClass('green'))
    .draw(circle.clone().left('+=300').id(1))
    .draw(polygon.clone().left('+=300').addClass('green'))
    .draw(line.clone().left('+=300').addClass('bold'))
    .draw(curve.clone().left('+=300').addClass('green bold'))
    .draw(multiLine.clone().left('+=300').addClass('bold'));
paint.style
    .set('.green', {
        fillStyle: 'green', 
        strokeStyle: 'green', 
        shadowColor: 'green'
    })
    .set('.bold', {
        lineWidth: 5
    })
    .set('#1', {
        fillStyle: 'blue'
    });
    
// 画布路径筛选和操作
paint.path
    .find('#1, rect')
    .animate({
        left: '+=50'
    });
paint.path
    .find('.green')
    .animate({
        left: '+=50'
    });
paint.path
    .find('.bold')
    .animate({
        top: '+=50'
    });
    
// 图形连接
let circles = [
    circle.clone().left('+=500').radius(20).angle(0, 360), 
    circle.clone().offset('+=600', '+=100').radius(20).angle(0, 360), 
    circle.clone().offset('+=400', '+=200').radius(20).angle(0, 360)
];
paint.draw(circles[0]).draw(circles[1]).draw(circles[2]);
circles[0].connect(circles[1]);
circles[0].connect(circles[2]);
circles[1].connect(circles[2]);
paint.pathQuery
    .clear().addRange(...circles)
    .color('blue')
    .mousedrag(function(e) {
        this.offset(e.clientX - e.offsetX, e.clientY - e.offsetY);
    });
