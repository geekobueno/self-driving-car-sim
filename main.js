const carCanvas = document.getElementById("carCanvas")
carCanvas.width = 300
const networkCanvas = document.getElementById("networkCanvas")
networkCanvas.width = 500

const carCtx = carCanvas.getContext("2d")
const networkCtx = networkCanvas.getContext("2d")

const road = new Road(carCanvas.width/2,carCanvas.width*0.9)

let outputs=[]
const cars = generateCars(200)
let bestCar=cars[0]

const sensors=[]
for (let i = 0; i < cars.length; i++) {
     sensors[i]= new Sensor(cars[i])
}
const brains=[]
for (let i = 0; i < cars.length; i++) {
    brains.push(new NeuralNetwork(
        [sensors[i].rayCount,6,4]
    ))
}
let bestCarBrain=brains[cars.indexOf(bestCar)]

const traffic=[
    new Car(road.getLaneCenter(1),300,30,50,"DUMMY",3),
    new Car(road.getLaneCenter(0),-100,30,50,"DUMMY",3),
    new Car(road.getLaneCenter(2),-100,30,50,"DUMMY",3),
    new Car(road.getLaneCenter(3),-300,30,50,"DUMMY",3),
    new Car(road.getLaneCenter(1),-900,30,50,"DUMMY",3),
    new Car(road.getLaneCenter(0),-500,30,50,"DUMMY",3),
    new Car(road.getLaneCenter(2),-800,30,50,"DUMMY",3),
    new Car(road.getLaneCenter(3),-1000,30,50,"DUMMY",3)
]

if (localStorage.getItem("bestBrain")) {
    for (let i = 0; i < cars.length; i++) {
        brains[i]=JSON.parse(
            localStorage.getItem("bestBrain")
        )
        if (i!=0) {
            NeuralNetwork.mutate(brains[i],0.1)
        }
    }
}

animateCar()

function save() {
    localStorage.setItem("bestBrain",
        JSON.stringify(bestCarBrain)
    )
}

function discard() {
    localStorage.removeItem("bestBrain")
}

function generateCars(N) {
    const cars=[]
    for (let i = 0; i < N; i++) {
        cars.push(new Car(road.getLaneCenter(1),800,30,50,"AI"))        
    }
    return cars
}

function animateCar(time){
    for (let i = 0; i < cars.length; i++) {
        outputs[i]=(NeuralNetwork.feedForward(sensors[i].offsets,brains[i]))        
    }

    for (let i = 0; i < traffic.length; i++) {
        traffic[i].update(road.borders,[])        
    }

    for (let i = 0; i < cars.length; i++) {
        sensors[i].update(road.borders,traffic)
    }

    for (let i = 0; i < cars.length; i++) {
        cars[i].update(road.borders,traffic,outputs[i])
    }

    bestCar=cars.find(
        c=>c.y==Math.min(
            ...cars.map(c=>c.y)
        )
    )
    bestCarBrain=brains[cars.indexOf(bestCar)]

    carCanvas.height = window.innerHeight
    networkCanvas.height = window.innerHeight
    carCtx.save()
    carCtx.translate(0,-bestCar.y+carCanvas.height*0.9)
    road.draw(carCtx)

    for (let i = 0; i < traffic.length; i++) {
        traffic[i].draw(carCtx,"blue")       
    }

    carCtx.globalAlpha=0.2
    for (let i = 0; i < cars.length; i++) {
        cars[i].draw(carCtx,"red")
    }
    carCtx.globalAlpha=1
    bestCar.draw(carCtx,"red")
    sensors[cars.indexOf(bestCar)].draw(carCtx)

    let lastTrafficPosition=traffic[traffic.length-1].y
    if (bestCar.y<lastTrafficPosition) {
        traffic.push(
            new Car(bestCar.x,
            -Math.random()*1000+bestCar.y-200,30,50,"DUMMY",3),
            new Car(road.getLaneCenter(Math.floor(Math.random()*3)),
            -Math.random()*1000+lastTrafficPosition-200,30,50,"DUMMY",3),
            new Car(road.getLaneCenter(Math.floor(Math.random()*3)),
            -Math.random()*1000+lastTrafficPosition-200,30,50,"DUMMY",3),
            new Car(road.getLaneCenter(Math.floor(Math.random()*3)),
            -Math.random()*1000+lastTrafficPosition-200,30,50,"DUMMY",3),
            new Car(road.getLaneCenter(Math.floor(Math.random()*3)),
            -Math.random()*1000+lastTrafficPosition-200,30,50,"DUMMY",3)
        )
    }

    carCtx.restore()

    if (bestCar.damage) {
        save()
    }
    networkCtx.lineDashOffset=-time/50
    Visualizer.drawNetwork(networkCtx,bestCarBrain)
    requestAnimationFrame(animateCar)
}