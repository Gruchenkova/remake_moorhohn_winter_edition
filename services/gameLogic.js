import loadImages from './load.js';
export let point
// export {point};
let gameLogic = {
    playGame: function () {
        loadImages.loadImg();
        //вызываем resources.load со всеми изображениями для загрузки, 
        //и затем вызываем resources.onReady для создания callback на событие загрузки всех данных
        //Загруженные изображения хранятся в кеше в resourcesCache, и когда все изображения буду загружены, будут вызваны все callback'и
        resources.load([
            './new/allBackground.png',
            './new/bigRoosterRight.png',
            './new/bigRooster-1.png',
            './new/bigRoosterDied.png',
            './new/mediumRooster-1.png',
            './new/mediumRoosterRight.png',
            './new/mediumRoosedDied-2.png',
            './new/smallRooster-1.png',
            './new/smallRoostedDied-2.png',
            './new/patron.png',
            './new/+15.png',
            './new/+25.png',
            './new/+20.png',
            './new/bigPetux-1.png',
            './new/bird.png',
            './new/+30.png',
        ]);
        resources.onReady(init);

        let body = document.getElementById("body");
        let canvas = document.getElementById('canvas');
        let ctx = canvas.getContext("2d");
        document.body.style.cursor = "url('./new/aim.png'), auto";

        var canvasSnow = document.getElementById("canvasSnow");
        var ctxSnow = canvasSnow.getContext("2d");

        let canvasBackground = document.getElementById('canvasBackground');
        let ctxBackground = canvasBackground.getContext('2d');

        let canvasBullet = document.getElementById('bullets');
        let ctxBullets = canvasBullet.getContext('2d');
        canvasBullet.setAttribute('width', '490');
        canvasBullet.setAttribute('height', '67');

        //глобальные переменные

        let bigRosteresArr = []//архив больших петухов
        let frame = 0;
        let holder = []; //массив всех патронов
        point = 0;
        //аудио
        let startAudio = new Howl({
            src: ['./audio/moorhuhnwinter_dat-0000000061.mp3'],
            volume: 0.1,
            html5: true,
            loop: true,
        })
        let fireAudio = new Howl({
            src: ['./audio/fire.mp3'],
            volume: 0.8,
            html5: true,
        });

        let rechargeAudio = new Howl({
            src: ['./audio/recharge.mp3'],
            volume: 0.8,
            html5: true,
        });

        let killAudio = new Howl({
            src: ['./audio/diedBigPetux.mp3'],
            volume: 0.8,
            html5: true,
        });

        let misfireAudio = new Howl({
            src: ['./audio/misfire.mp3'],
            volume: 0.8,
            html5: true,
        });


        //функция которая отображает очки на экране
        function drawAllPoints() {
            ctx.font = "30px Comic Sans MS";
            ctx.fillStyle = "#FFFFFF";
            ctx.fillText(point, 20, 50);
        }

        let timer; // пока пустая переменная
        let x = 90; // стартовое значение обратного отсчета
        let div = document.getElementById('page_container')
        let timerCanvas = document.createElement('canvas');
        let timerCtx = timerCanvas.getContext('2d')
        div.append(timerCanvas);
        timerCanvas.id = "timerCanvas";
        timerCanvas.width = 100;
        timerCanvas.height = 50;
        timerCtx.font = "30px Comic Sans MS";
        timerCtx.fillStyle = "#FFFFFF";

        // функция обратного отсчета
        function showTimer() {
            timerCtx.clearRect(0, 0, 100, 50);
            timerCtx.fillText(x, 0, 30);
            x--;
            if (x < 0) {
                startAudio.stop();
                clearTimeout(timer); // таймер остановится на нуле
                window.location.href = '/#/savescore'; //открываем ввод данных для сохранения результата;
            }
            else {
                timer = setTimeout(showTimer, 1000);
            }
        }

        let newPosY
        //пересчитывает зазмер канваса с элементами, чтобы отобразолось на всё видовое окно
        (function () {
            // resize the canvas to fill browser window dynamically
            window.addEventListener('resize', resizeCanvas, false);

            function resizeCanvas() {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
                canvasBackground.width = window.innerWidth;
                canvasBackground.height = window.innerHeight;
            }
            resizeCanvas();
        })();


        //----------------снег---------------//
        //размеры canvasSnow
        var W = window.innerWidth;
        var H = window.innerHeight;
        canvasSnow.width = W;
        canvasSnow.height = H;

        //снежинки
        var mp = 10;
        var particles = [];
        for (var i = 0; i < mp; i++) {
            particles.push({
                x: Math.random() * W, //x-coordinate
                y: Math.random() * H, //y-coordinate
                r: Math.random() * 3 + 1, //radius
                d: Math.random() * mp //плотность
            })
        }

        //рисуем снег
        function drawSnow() {
            countSnow++;
            ctxSnow.clearRect(0, 0, W, H);

            ctxSnow.fillStyle = "rgba(255, 255, 255, 0.8)";
            ctxSnow.beginPath();
            for (var i = 0; i < mp; i++) {
                var p = particles[i];
                ctxSnow.moveTo(p.x, p.y);
                ctxSnow.arc(p.x, p.y, p.r, 0, Math.PI * 2, true);
            }
            ctxSnow.fill();
            updatSnow();
        }

        //Функция для перемещения снежинок
        //угол будет постоянно увеличивающимся. К нему будут применены функции Sin и Cos для создания вертикальных и горизонтальных движений снежинок.
        var angle = 0;

        function updatSnow() {
            angle += 0.001;
            for (var i = 0; i < mp; i++) {
                var p = particles[i];
                //Обновление координат X и Y
                //добавим 1 к функции cos, чтобы предотвратить отрицательные значения, которые приведут к движению хлопьев вверх.
                //Каждая снежинка имеет свою плотность, с помощью которой можно сделать нисходящее движение разным для каждой снежинки.
                //сделаем его более случайным, добавив радиус
                p.y += Math.cos(angle + p.d) + 1 + p.r / 2;
                p.x += Math.sin(angle) * 2;

                //запуск снежинок обратно сверху, когда они выходят
                //позволим снежинкам попадать слева и справа.
                if (p.x > W + 5 || p.x < -5 || p.y > H) {
                    if (i % 3 > 0) //66.67% снежинок
                    {
                        particles[i] = {
                            x: Math.random() * W,
                            y: -10,
                            r: p.r,
                            d: p.d
                        };
                    } else {
                        //Если снежинки выходят справа
                        if (Math.sin(angle) > 0) {
                            //запускаем слева
                            particles[i] = {
                                x: -5,
                                y: Math.random() * H,
                                r: p.r,
                                d: p.d
                            };
                        } else {
                            //запускаем справа
                            particles[i] = {
                                x: W + 5,
                                y: Math.random() * H,
                                r: p.r,
                                d: p.d
                            };
                        }
                    }
                }
            }
            //анимируем
            requestAnimationFrame(drawSnow)
        }

        //controls
        let countSnow = 0;
        drawSnow();
        //рандоминайзер
        function getRandomInt(min, max) {
            min = Math.ceil(min);
            max = Math.floor(max);
            return Math.floor(Math.random() * (max - min)) + min; //Максимум не включается, минимум включается
        }

        //куры
        class BigRoster {//создадим класс спрайтов
            constructor(options) {
                this.ctx = ctx;//контекст для рисования;
                this.image = options.image;//само изображение с фреймами.
                this.frameIndex = 0;//индекс активного фрейма;
                this.tickCount = 0;//количество обновлений, произошедших после первого вывода текущего фрейма
                this.ticksPerFrame = options.ticksPerFrame;//количество обновлений, которые должны произойти до смены фреймов.
                this.numberOfFrames = options.numberOfFrames;//количество фреймов в спрайте
                this.width = options.width;//ширина изображения;
                this.height = options.height;//высота изображения;
                this.x = options.x;
                this.y = options.y;
                this.speed = options.speed;
                this.speedY = options.speedY;
                this.cost = options.cost;
                this.direction = options.direction;
                this.start();
            }

            update() {
                this.x = this.x + this.speed;
                this.y += this.speedY;
                if (this.x > canvas.width && this.direction === true) {
                    this.x = getRandomInt(-10000 - frame, -5000)
                }
                if (this.x < -1000 && this.direction === false) {
                    this.x = getRandomInt(5000, 10000)
                }
                this.tickCount++;
                if (this.tickCount > this.ticksPerFrame) {
                    this.tickCount = 0;
                    if (this.frameIndex < this.numberOfFrames - 1) {
                        this.frameIndex++;
                    } else {
                        this.frameIndex = 0;
                    }
                }
            }
            render() {

                this.ctx.clearRect(this.x, this.y, this.width, this.height / this.numberOfFrames);
                drawAllPoints();
                this.ctx.drawImage(
                    resources.get(this.image),//исходное изображение-спрайт
                    0,//x-координата верхнего левого угла нужного фрейма на спрайте
                    this.frameIndex * this.height / this.numberOfFrames,//y-координата верхнего левого угла нужного фрейма на спрайте
                    this.width,//ширина фрейма
                    this.height / this.numberOfFrames,//высота фрейма
                    this.x,//x-координата точки на холсте,где начинается отрисовка фрейма
                    this.y,//y-координата точки на холсте,где начинается отрисовка фрейма
                    this.width,//ширина отрисованного на холсте фрейма
                    this.height / this.numberOfFrames //высота отрисованного на холсте фрейма
                )
            }
            start() {
                let loop = () => {
                    this.update();
                    this.render();

                    window.requestAnimationFrame(loop);
                }
                window.requestAnimationFrame(loop);
            }
        }

        //рисуем кур и добавляем их в массив
        function handelRosteres() {
            for (let i = 0; i < bigRosteresArr.length; i++) {
                bigRosteresArr[i].update();
                bigRosteresArr[i].render();
            }
            if (frame === 1) {
                bigRosteresArr.push(
                    new BigRoster({
                        image: './new/bigRoosterRight.png',
                        ticksPerFrame: 2,
                        numberOfFrames: 20,
                        width: 104,
                        height: 2480,
                        x: 0 - frame,
                        y: getRandomInt(0, canvas.height - 125),
                        speed: Math.random() * 0.2 + 0.4,
                        cost: 15,
                        direction: true,
                        speedY: Math.random() * 0.2,
                    }))
            }
            let lastEl = bigRosteresArr[bigRosteresArr.length - 1];
            if (frame % 100 === 0 && newPosY < lastEl.y + lastEl.height || newPosY > lastEl.y + lastEl.height) {
                bigRosteresArr.push(
                    new BigRoster({
                        image: './new/mediumRoosterRight.png',
                        ticksPerFrame: 2,
                        numberOfFrames: 20,
                        width: 64,
                        height: 1240,
                        x: 0 - frame,
                        y: newPosY,
                        speed: Math.random() * 0.2 + 0.4,
                        cost: 20,
                        direction: true,
                        speedY: Math.random() * 0.2,
                    }))
            }
            if (frame % 200 === 0 && newPosY < lastEl.y + lastEl.height || newPosY > lastEl.y + lastEl.height) {
                bigRosteresArr.push(
                    new BigRoster({
                        image: './new/bigRoosterRight.png',
                        ticksPerFrame: 2,
                        numberOfFrames: 20,
                        width: 104,
                        height: 2480,
                        x: 0 - frame,
                        y: newPosY,
                        speed: Math.random() * 0.2 + 0.4,
                        cost: 15,
                        direction: true,
                        speedY: Math.random() * 0.2,
                    }))
            }
            if (frame % 300 === 0 && newPosY < lastEl.y + lastEl.height || newPosY > lastEl.y + lastEl.height) {
                bigRosteresArr.push(
                    new BigRoster({
                        image: './new/bigRooster-1.png',
                        ticksPerFrame: 2,
                        numberOfFrames: 20,
                        width: 124,
                        height: 2480,
                        x: canvas.width,
                        y: newPosY,
                        speed: -1 * (Math.random() * 0.1 + 1),
                        cost: 15,
                        direction: false,
                        speedY: (Math.random() * 0.2 + 0.2) * -1,
                    })
                )
            }
            if (frame % 400 === 0 && newPosY < lastEl.y + lastEl.height || newPosY > lastEl.y + lastEl.height) {
                bigRosteresArr.push(
                    new BigRoster({
                        image: './new/bigRooster-1.png',
                        ticksPerFrame: 2,
                        numberOfFrames: 20,
                        width: 124,
                        height: 2480,
                        x: canvas.width,
                        y: newPosY,
                        speed: -1 * (Math.random() * 0.1 + 1),
                        cost: 15,
                        direction: false,
                        speedY: (Math.random() * 0.2 + 0.4),
                    })
                )
            }
            if (frame % 500 === 0 && newPosY < lastEl.y + lastEl.height || newPosY > lastEl.y + lastEl.height) {
                bigRosteresArr.push(
                    new BigRoster({
                        image: './new/smallRooster-1.png',
                        ticksPerFrame: 2,
                        numberOfFrames: 20,
                        width: 30,
                        height: 619,
                        x: canvas.width,
                        y: getRandomInt(0, canvas.height / 2),
                        speed: -1 * (Math.random() * 0.1 + 0.4),
                        cost: 25,
                        direction: false,
                        speedY: Math.random() * 0.2,
                    })
                )
            }
            // if (frame === 1){
            //     bigRosteresArr.push(
            //         new BigRoster({
            //             image: './new/bigPetux-1.png',
            //             ticksPerFrame: 70,
            //             numberOfFrames: 11,
            //             width: 350,
            //             height: 3900,
            //             x: 300,
            //             y: canvas.height - 350,
            //             speed: 0,
            //             cost: 50,
            //             direction: false,
            //             speedY: 0,
            //         })
            //     )
            // }
            if (frame === 1) {
                bigRosteresArr.push(
                    new BigRoster({
                        image: './new/bird.png',
                        ticksPerFrame: 10,
                        numberOfFrames: 5,
                        width: 46,
                        height: 215,
                        x: 400,
                        y: canvas.height - 50,
                        speed: 0,
                        cost: 30,
                        direction: false,
                        speedY: 0,
                    })
                )
            }
        }

        //создаем спрайт мертвого петуха
        class diedBigRooster {
            constructor(options) {
                this.ctx = ctx;
                this.image = options.image;
                this.x = options.x;
                this.y = options.y;
                this.width = options.width;
                this.height = options.height;
                this.speed = Math.random() * 1 + 2;
                this.start()
            }
            update() {
                this.y += this.speed;
            }
            draw() {
                this.ctx.clearRect(this.x, this.y, this.width, this.height);
                this.ctx.drawImage(
                    resources.get(this.image),//исходное изображение-спрайт
                    this.x,//x-координата точки на холсте,где начинается отрисовка фрейма
                    this.y,//y-координата точки на холсте,где начинается отрисовка фрейма
                    this.width,//ширина фрейма
                    this.height,//высота фрейма
                )
            }
            start() {
                let loop = () => {
                    this.update();
                    this.draw();

                    window.requestAnimationFrame(loop);
                }
                window.requestAnimationFrame(loop);
            }
        }

        //создаем спрайт патроны 
        class Bullet {
            constructor(x, y) {
                this.ctx = canvasBullet.getContext('2d');//контекст для рисования;
                this.image = './new/patron.png'//само изображение с фреймами.
                this.x = x;
                this.y = y;
                this.width = 49;
                this.height = 67;

            }
            draw() {
                this.ctx.drawImage(
                    resources.get(this.image),//исходное изображение-спрайт
                    this.x,//x-координата точки на холсте,где начинается отрисовка фрейма
                    this.y,//y-координата точки на холсте,где начинается отрисовка фрейма
                    this.width,//ширина фрейма
                    this.height,//высота фрейма

                )
            }
        }

        //функция для заполнения обоймы
        function reload() {
            for (let i = 0; i < 10; i++) {
                holder.push(new Bullet(0 + 49 * i, 0))
            }
            drawBullets()
        }

        //нарисовать патроны
        function drawBullets() {
            for (let a = 0; a < holder.length; a++) {
                holder[a].draw();
            }
        }

        //обработка событий
        canvas.addEventListener('click', function fire(event) {
            if (holder.length != 0) {//проверка наличие патронов
                fireAudio.play()
                holder.shift();
                ctxBullets.clearRect(0, 0, canvasBullet.width, canvasBullet.height);
                drawBullets()
                killRooster(event)
            } else {
                misfireAudio.play()
            }
        })
        //перезарядка обоймы
        document.addEventListener("contextmenu", function (e) {
            e.preventDefault();
            if (holder.length === 0) {
                rechargeAudio.play();
                reload();
            }
        })


        //убить петуха
        function killRooster(event) {
            // Получить координаты и размеры холста
            let canvasCoordinate = canvas.getBoundingClientRect();
            // Преобразовать и масштабировать координаты события мыши в координаты холста
            let newCoordX = (event.clientX - canvasCoordinate.left) * (canvas.width / canvasCoordinate.width);
            let newCoordY = (event.clientY - canvasCoordinate.top) * (canvas.height / canvasCoordinate.height);
            //проверка на попадание
            for (let a = 0; a < bigRosteresArr.length; a++) {
                let elemX = bigRosteresArr[a].x;
                let elemY = bigRosteresArr[a].y;
                let elemCost = bigRosteresArr[a].cost;
                let elemXandWidth = bigRosteresArr[a].x + bigRosteresArr[a].width;
                let elemYandHeight = bigRosteresArr[a].y + bigRosteresArr[a].height / bigRosteresArr[a].numberOfFrames;
                let diedAnomation;
                if (newCoordX > elemX && newCoordX < elemXandWidth && newCoordY > elemY && newCoordY < elemYandHeight && elemCost === 20 && bigRosteresArr[a].direction === true) {
                    point += bigRosteresArr[a].cost;
                    killAudio.play()
                    bigRosteresArr[a].x = getRandomInt(-5000 - frame, 2000);
                    diedAnomation = new diedBigRooster({
                        image: './new/mediumRoosedDied-2.png',
                        x: elemX,
                        y: elemY,
                        width: 64,
                        height: 50,
                    });
                    ctx.clearRect(0, 0, canvasCoordinate.width, canvasCoordinate.height);
                    diedAnomation.update();
                    diedAnomation.draw();
                    showPoints(elemCost, elemX, elemY)
                }
                if (newCoordX - 20 > elemX && newCoordX + 20 < elemXandWidth && newCoordY - 20 > elemY && newCoordY + 20 < elemYandHeight && elemCost === 15 && bigRosteresArr[a].direction === true) {
                    point += bigRosteresArr[a].cost;
                    killAudio.play()
                    bigRosteresArr[a].x = getRandomInt(-5000 - frame, 2000);
                    diedAnomation = new diedBigRooster({
                        image: './new/bigRoosterDied.png',
                        x: elemX,
                        y: elemY,
                        width: 100,
                        height: 100,
                    });
                    ctx.clearRect(0, 0, canvasCoordinate.width, canvasCoordinate.height);
                    diedAnomation.update();
                    diedAnomation.draw();
                    showPoints(elemCost, elemX, elemY)

                }
                if (newCoordX - 20 > elemX && newCoordX + 20 < elemXandWidth && newCoordY - 20 > elemY && newCoordY + 20 < elemYandHeight && elemCost === 15 && bigRosteresArr[a].direction === false) {
                    killAudio.play()
                    point += bigRosteresArr[a].cost;
                    bigRosteresArr[a].x = getRandomInt(2000, 5000);
                    diedAnomation = new diedBigRooster({
                        image: './new/bigRoosterDied.png',
                        x: elemX,
                        y: elemY,
                        width: 100,
                        height: 100,
                    });
                    ctx.clearRect(0, 0, canvasCoordinate.width, canvasCoordinate.height);
                    diedAnomation.update();
                    diedAnomation.draw();
                    showPoints(elemCost, elemX, elemY);
                }
                if (newCoordX + 10 > elemX && newCoordX - 10 < elemXandWidth && newCoordY + 10 > elemY && newCoordY - 10 < elemYandHeight && elemCost === 25) {
                    killAudio.play();
                    point += bigRosteresArr[a].cost;
                    bigRosteresArr[a].x = getRandomInt(2000, 5000);
                    diedAnomation = new diedBigRooster({
                        image: './new/smallRoostedDied-2.png',
                        x: elemX,
                        y: elemY,
                        width: 40,
                        height: 40,
                    })
                    ctx.clearRect(0, 0, canvasCoordinate.width, canvasCoordinate.height);
                    diedAnomation.update();
                    diedAnomation.draw();
                    showPoints(elemCost, elemX, elemY);
                }
                if (newCoordX + 10 > elemX && newCoordX - 10 < elemXandWidth && newCoordY + 10 > elemY && newCoordY - 10 < elemYandHeight && elemCost === 30) {
                    killAudio.play();
                    point += bigRosteresArr[a].cost;
                    bigRosteresArr[a].x = getRandomInt(2000, 5000);
                    diedAnomation = new diedBigRooster({
                        image: './new/smallRoostedDied-2.png',
                        x: elemX,
                        y: elemY,
                        width: 40,
                        height: 40,
                    })
                    ctx.clearRect(0, 0, canvasCoordinate.width, canvasCoordinate.height);
                    diedAnomation.update();
                    diedAnomation.draw();
                    showPoints(elemCost, elemX, elemY);
                }
            }
        }

        function animate() {
            newPosY = getRandomInt(0, canvas.height - 125);
            frame++;
            handelRosteres();
            requestAnimationFrame(animate)
        }

        // показать очки
        class pointsShowImage {
            constructor(options) {
                this.ctx = ctx;
                this.image = options.image;
                this.x = options.x;
                this.y = options.y;
                this.width = 67;
                this.height = 30;
                this.speed = Math.random() * 1 + 2;
                this.start()
            }
            update() {
                if (this.y < canvas.width) {
                    this.y = this.y - this.speed;
                } else {
                    cancelAnimationFrame(tickPoints);
                    cancelAnimationFrame(tickPoints2)
                }
            }
            draw() {
                this.ctx.clearRect(this.x, this.y, this.width, this.height);
                this.ctx.drawImage(
                    resources.get(this.image),//исходное изображение-спрайт
                    this.x,//x-координата точки на холсте,где начинается отрисовка фрейма
                    this.y,//y-координата точки на холсте,где начинается отрисовка фрейма
                    this.width,//ширина фрейма
                    this.height,//высота фрейма
                )
            }
            start() {
                let loop = () => {
                    this.update();
                    this.draw();

                    tickPoints = window.requestAnimationFrame(loop);
                }
                tickPoints2 = window.requestAnimationFrame(loop);
            }
        }
        let tickPoints;
        let tickPoints2;
        let newBigRoosterPoints;
        // функция чтобы отобразить очки при попадании в зависимости от петуха
        function showPoints(thisPoints, elemX, elemY) {
            let points = thisPoints;
            if (points === 15) {
                newBigRoosterPoints = new pointsShowImage({
                    image: './new/+15.png',
                    x: elemX + 15,
                    y: elemY - 15,
                })
                newBigRoosterPoints.update();
                newBigRoosterPoints.draw();
            }
            if (points === 25) {
                newBigRoosterPoints = new pointsShowImage({
                    image: './new/+25.png',
                    x: elemX + 15,
                    y: elemY - 15,
                })
                newBigRoosterPoints.update();
                newBigRoosterPoints.draw();
            }
            if (points === 20) {
                newBigRoosterPoints = new pointsShowImage({
                    image: './new/+20.png',
                    x: elemX + 15,
                    y: elemY - 15,
                })
                newBigRoosterPoints.update();
                newBigRoosterPoints.draw();
            }
            if (points === 30) {
                newBigRoosterPoints = new pointsShowImage({
                    image: './new/+30.png',
                    x: elemX + 15,
                    y: elemY - 15,
                })
                newBigRoosterPoints.update();
                newBigRoosterPoints.draw();
            }
        }

        //--------ФОН--------//
        let left = -150;
        var mouseX = 0;

        body.addEventListener("mousemove", setMousePosition, false);//отслеживает событие мышки

        function setMousePosition(e) {
            mouseX = e.clientX;//координата мышки
            if (left > 0) {
                left = 0
            }
            if (left < -250) {
                left = -250
            }
            if (mouseX > 900 && left <= 0 && left >= -250) {
                move("right")
            } if (mouseX < 200 && left >= -250 && left <= 0) {
                move("left")
            }
        }


        function move(direction) {//перерисовываем background в зависимости от движения мышки
            switch (direction) {
                case "left":
                    left += 5;
                    break;
                case "right":
                    left -= 5;
                    break;
            }
            draw(left);
        }

        function draw(left) {
            ctxBackground.drawImage(resources.get('./new/allBackground.png'), left, 0, canvasBackground.width + 250, canvasBackground.height,);
        }
        //событие на кнопку назад отменяет звук
        addEventListener("popstate", function (e) {
            startAudio.stop();
        }, false);

        function init() {
            startAudio.play();
            draw(left);
            showTimer();
            reload();
            animate();
        }
    }
}
export default gameLogic;