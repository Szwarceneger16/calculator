
class createDisplay {
    #screen
    #hasComma
    #value

    constructor(elementName) {
        if (elementName === undefined) throw "empty elemnt name";
        this.#screen = document.getElementById(elementName);
        this.#hasComma = false;
    }

    #setInputText () {
        this.#screen.value = this.#value;
    }

    addNumber(ee) {
        if(ee !== undefined && /^\d$/.test(ee)) {
            if(number !== ',') {
                this.#value += ee;
                this.#setInputText();
                return true;
            }
            else if (this.#hasComma === false) {
                this.#hasComma = true;
                this.#value += ee;
                this.#setInputText();
                return true;
            }
            else {
                return false;
            }
        }else {
            return false;
        }
    }

    c() {
        this.#value = this.#value.substring(0,-1);
        this.#screen.value = this.#value;
    }

    ce() {
        this.#screen.value = '';
        this.#value = '';
        this.#hasComma = false;
    }
}

const numberButtons = document.getElementsByClassName("btn-number");
document.getElementById("ce").addEventListener("click", function () {
    display.ce();
})
const display = new createDisplay("screen");

for (const numberButton of numberButtons) {
    numberButton.addEventListener("click", function () {
            display.addNubmer(numberButton.innerHTML);
    });
}

