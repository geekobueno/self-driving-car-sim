import { Controls } from "./control";
import * as func from "./func";

export default class Car {
    constructor(x,y,width,height,controlType,maxSpeed) {
        this.x = x
        this.y = y
        this.width = width
        this.height = height

        this.speed=0
        this.acceleration=0.1
        this.maxSpeed=maxSpeed
        this.friction=0.02
        this.angle=0
        this.damage=false

        this.useBrain=controlType=="AI"
        this.controls =new Controls(controlType)
    }

    update(borders,traffic,output){
        if (!this.damage) {
            this.#moveCar()
            this.polygon=this.#createPolygon()
            this.damage=this.#assessDamage(borders,traffic)   
        }

        if (this.useBrain) {
            this.controls.forward=output[0]
            this.controls.backward=output[3]
            this.controls.left=output[1]
            this.controls.right=output[2]
        }
    }

    #createPolygon(){
        const points= []
        const rad = Math.hypot(this.width,this.height)/2
        const alpha = Math.atan2(this.width,this.height)
        points.push({
            x:this.x-Math.sin(this.angle-alpha)*rad,
            y:this.y-Math.cos(this.angle-alpha)*rad
        })
        points.push({
            x:this.x-Math.sin(this.angle+alpha)*rad,
            y:this.y-Math.cos(this.angle+alpha)*rad
        })
        points.push({
            x:this.x-Math.sin(Math.PI+this.angle-alpha)*rad,
            y:this.y-Math.cos(Math.PI+this.angle-alpha)*rad
        })
        points.push({
            x:this.x-Math.sin(Math.PI+this.angle+alpha)*rad,
            y:this.y-Math.cos(Math.PI+this.angle+alpha)*rad
        })
        return points
    }

    #assessDamage(borders,traffic){
        for (let i = 0; i < borders.length; i++) {
            if (func.polyIntersect(this.polygon,borders[i])) {
                return true
            }            
        }
        for (let i = 0; i < traffic.length; i++) {
            if (func.polyIntersect(this.polygon,traffic[i].polygon)) {
                return true
            }            
        }
    }

    #moveCar(){
        if (this.controls.forward) {
            this.speed+=this.acceleration
        }else if (this.controls.backward){
            this.speed-=this.acceleration
        }

        if (this.speed>=this.maxSpeed) {
            this.speed=this.maxSpeed
            
        }else if(this.speed<=-this.maxSpeed){
            this.speed=-this.maxSpeed/2
        }

        if (this.speed>0) {
            this.speed-=this.friction
        } else if (this.speed<0) {
            this.speed+=this.friction
        } 

        if (Math.abs(this.speed)<this.friction) {
            this.speed=0
        }
        if (this.speed!=0) {
            const flip=this.speed>0?1:-1
            if (this.controls.left) {
                this.angle+=0.03*flip
            }else if (this.controls.right){
                this.angle-=0.03*flip
            }
        }

        this.x-=Math.sin(this.angle)*this.speed
        this.y-=Math.cos(this.angle)*this.speed
    }

    draw(ctx,color){
        if (this.damage) {
            ctx.fillStyle="grey"
        } else {
            ctx.fillStyle=color
        }
        ctx.beginPath()
        ctx.moveTo(this.polygon[0].x,this.polygon[0].y)
        for (let i = 1; i < this.polygon.length; i++) {
            ctx.lineTo(this.polygon[i].x,this.polygon[i].y)            
        }
        ctx.fill()
    }
}