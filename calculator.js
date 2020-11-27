'use strict';
var __DEBUG = true;

const createCalculator = function() {
    const CalculatorInner = function(root) {
        const Expression = function() {
            this.operationStack = [];

            this.count = 0;
            this.lastOp = null;
            this.addOperation = function(num, op) { // number and kind of operation
                switch (op) {
                    case "\u00F7":// division
                        op = 50;
                    break;
                    case "\u00D7": // multiplication
                        op = 51;
                    break;
                    case ')':
                    case "=":
                        op = null;
                    break;
                    case "-":
                        op = 30;
                    break;
                    case "+":
                        op = 31;
                    break;
                    case "^":
                        op = 80;
                    break;
                    // square possible by exponentiation
                    default:
                        throw "not recognized operation";
                }
                
                this.operationStack.push({
                    id: this.count,
                    number: num,
                    operation: this.lastOp,
                    dest: (this.count === 0 ? null : this.count-1)
                })
                if (op == null) return this.execute(); 
                this.lastOp = op;  
                this.count++;
                return null;
            }

            this.execute = function() {
                this.operationStack.sort( (a,b) => {
                    if ( a.operation - b.operation < -2) return -1;
                    else if ( a.operation - b.operation > 2 ) return 1;
                    else {
                        if ( a.id < b.id ) return 1;
                        else if ( a.id > b.id ) return -1; 
                        else throw "big error";
                    }
                })

                while(this.operationStack.length != 1) {
                    if (__DEBUG) console.log(JSON.parse(JSON.stringify(this.operationStack)));
                    const srcElement = this.operationStack.pop();
                    const destElement = this.operationStack.find( el => el.id === srcElement.dest);

                    destElement.id = srcElement.id;
                    switch (srcElement.operation) {
                        case 50:// division
                            if (__DEBUG) console.log(destElement.number,srcElement.number,"/");
                            destElement.number /= srcElement.number;
                        break;
                        case 51: // multiplication
                        if (__DEBUG) console.log(destElement.number,srcElement.number,"*")   
                            destElement.number *= srcElement.number;   
                        break;
                        case 30: // subtraction
                        if (__DEBUG) console.log(destElement.number,srcElement.number,"-");
                            destElement.number -= srcElement.number;
                        break;
                        case 31: // addition
                        if (__DEBUG) console.log(destElement.number,srcElement.number,"+");
                            destElement.number += srcElement.number;
                        break;
                        case 80: // exponation
                        if (__DEBUG) console.log(destElement.number,srcElement.number,"exp");
                            destElement.number = Math.pow(destElement.number,srcElement.number);
                        break;
                    }
                    
                }
                return this.operationStack[0].number;
            }
        }

        if (root === undefined) throw "empty element name";
        if (!(root instanceof HTMLElement)) throw "it doesn't html element";
        this.historyTable = root.querySelector("table");
        this.screenReference = root.getElementsByClassName("calculator-screen")[0];
        this.expressionStack = [new Expression];
        this.operationStack = [];
        this.expected = "digit";

        // VALUE GATHERING SECTION
        this.value = "";
        this.comma = false;
        this.addDigit = function(ee) {
            if (this.expected !== "digit" && this.expected !== "all") throw "digit wasn't expected";
            const parsed = parseFloat(ee);
            if (parsed == NaN) throw 'error during digit parse';
            
            //this.textarea.value += ee;
            this.updateHistory(ee);
            this.value += ee;
            this.expected = "all";
            this.updateScreen();
        }

        this.setComma = function() {
            if (this.expected !== "digit" && this.expected !== "all") throw "digit wasn't expected";
            if (this.comma) return;
            //this.textarea.value += ',';
            this.updateHistory(".");
            this.value += ".";
            this.updateScreen();
        }

        // OPERATION SECTION
        this.previousResult = null;
        this.addOperation = function(op) {
            if ( op === '(') { 
                this.expressionStack.push(new Expression);
                this.updateHistory(op);
                return;
            } 
            if (this.expected !== "operation" && this.expected !== "all") throw "operation wasn't expected";
            let val;
            if (this.previousResult === null) {
                val = parseFloat(this.value);
                if (val == NaN) throw 'number parsing error';
            } else {
                val = this.previousResult;
                this.previousResult = null;
            }

            //this.textarea.value += op;
            this.updateHistory(op);
            this.value = '';
            this.comma = false;

            let result = this.expressionStack[this.expressionStack.length - 1].addOperation(val,op);
            if ( op === ')' && result != undefined) {
                this.expressionStack.pop();
                this.previousResult = result;
                
            } else if ( op === '=' && result != undefined) {
                this.expected = "digit";
                while (this.expressionStack.length != 1) {
                    this.expressionStack.pop();
                    result = this.expressionStack[this.expressionStack.length - 1].addOperation(result,this.operationStack.pop());
                }
                this.screenReference.value = result;
                this.expressionStack = [new Expression];
                this.updateHistory(result);
                this.updateHistory("newStack");
            } else {
                this.expected = "digit";
            }
            
            
        }

        // CALCULATOR CONTROL SECTION
        this.updateScreen = function(arg) {
            if (!arg) {
                this.screenReference.value = this.value;
            }else if (typeof arg === "string") {
                const prevValue = this.screenReference.value;
                
                this.screenReference.value = arg;
                setTimeout( () => { 
                    
                    this.screenReference.value = prevValue;
                } , 2000);      
            }
            
        }

        this.updateHistory = function(arg) {
            const tdElement = this.historyTable.querySelectorAll("td");
            
            //console.log(tdElement)
            if (arg === "ce") tdElement[tdElement.length - 1].innerText = " ";
            else if (arg === "c") {
                tdElement[tdElement.length - 1].innerText = tdElement[tdElement.length - 1].innerText.slice(0,-1);
            }
            else if (arg === "newStack") {
                let tr = document.createElement("tr");
                let td = document.createElement("td");
                //td.appendChild(document.createTextNode("0"));
                tr.appendChild(td);
                this.historyTable.firstElementChild.appendChild(tr);
                //td.innerHT = " ";
            }
            else tdElement[tdElement.length - 1].innerText += arg;

            this.historyTable.scrollTop = this.historyTable.scrollHeight;
        }
    
        this.c = function() {
            this.value = this.value.slice(0,-1);
            this.updateScreen();
            this.updateHistory("c");
        }
    
        this.ce = function() {
            //this.textarea.value = '';
            this.updateHistory("ce");
            this.screenReference.value = ' ';
            this.value = ' ';
            this.comma = false;
            this.expressionStack = [new Expression];
            this.operationStack = [];
        } 
    }

    return function(calcualtorRoot) {
        const retVal = new CalculatorInner(calcualtorRoot);
        for (const numberButton of calcualtorRoot.getElementsByClassName("btn-number")) {
            numberButton.addEventListener("click", function () {
                try {
                    retVal.addDigit(numberButton.innerText);
                } catch (error) {
                    retVal.updateScreen(error);
                }
                
            });
        }
        for (const numberButton of calcualtorRoot.getElementsByClassName("btn-operation")) {
            numberButton.addEventListener("click", function () {
                try {
                    retVal.addOperation(numberButton.innerText);
                } catch (error) {
                    retVal.updateScreen(error);
                } 
            });
        }
        calcualtorRoot.querySelector("#btn-c").addEventListener("click", function() {
            retVal.c();
        });
        calcualtorRoot.querySelector("#btn-ce").addEventListener("click", function() {
            retVal.ce();
        });
        calcualtorRoot.querySelector("#btn-comma").addEventListener("click", function() {
            try {
                retVal.setComma();
            } catch (error) {
                retVal.updateScreen(error);
            }
        });
        
        return retVal;
    }
}();

const calculator = createCalculator(document.getElementById('calculator1'));

window.addEventListener('DOMContentLoaded', (event) => {

    
});


