class Controls {
    constructor(type) {
        this.forward = false
        this.backward = false
        this.left = false
        this.right = false
        switch (type) {
            case "KEYS":
                this.#addKeyboardListener()
                break;
            case "DUMMY":
                this.forward=true
                break;
            default:
                break;
        }
    }

    #addKeyboardListener(){
        document.onkeydown=(event)=>{
            switch(event.key){
                case "ArrowUp":
                    this.forward=true
                    break
                case "ArrowDown":
                    this.backward=true
                    break
                case "ArrowLeft":
                    this.left=true
                    break
                case "ArrowRight":
                    this.right=true
            }
        }

        document.onkeyup=(event)=>{
            switch(event.key){
                case "ArrowUp":
                    this.forward=false
                    break
                case "ArrowDown":
                    this.backward=false
                    break
                case "ArrowLeft":
                    this.left=false
                    break
                case "ArrowRight":
                    this.right=false
            }
        }
    }
}