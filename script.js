(function () {
    const methods = {
        AD: "additions",
        SB: 'substractions',
        ML: 'multiplications',
        CRB: 'cubeRoot',
        SQR: 'squareRoot',
        CB: 'Cubes',
        SQ: 'Squares'
    }
    function live(selector, event, callback, context) {
        function addEvent(el, type, handler) {
            if (el.attachEvent) el.attachEvent("on" + type, handler);
            else el.addEventListener(type, handler);
        }
        // matches polyfill
        this.Element &&
            (function (ElementPrototype) {
                ElementPrototype.matches =
                    ElementPrototype.matches ||
                    ElementPrototype.matchesSelector ||
                    ElementPrototype.webkitMatchesSelector ||
                    ElementPrototype.msMatchesSelector ||
                    function (selector) {
                        var node = this,
                            nodes = (node.parentNode || node.document).querySelectorAll(selector),
                            i = -1;
                        while (nodes[++i] && nodes[i] != node);
                        return !!nodes[i];
                    };
            })(Element.prototype);
        // live binding helper using matchesSelector
        function live(selector, event, callback, context) {
            addEvent(context || document, event, function (e) {
                var found,
                    el = e.target || e.srcElement;
                while (el && el.matches && el !== context && !(found = el.matches(selector))) el = el.parentElement;
                if (el && found) callback.call(el, e);
            });
        }
        live(selector, event, callback, context);
    }

    function init() {
        events();
    }

    function events() {
        live('.actionsList>.actionItem', 'click', function () {
            const prevSelected = this.parentElement.querySelector('.selected');
            if (prevSelected && prevSelected !== this) {
                prevSelected.classList.remove('selected');
            }
            this.classList.add('selected');
        });

        live('[data-stage-num]', 'click', function () {
            const num = this.getAttribute('data-stage-num');
            const isRange = this.getAttribute('data-stage-contain-range') || false;
            changeStage(num, isRange);
        });

        live('html body .practiceQueGrp input', 'input', function () {
            const data = {
                num1: this.getAttribute('data-num1'),
                num2: this.getAttribute('data-num2') || 'NAN',
                func: this.getAttribute('data-method'),
                value: this.value
            }

            evaluate(data, this.parentElement);
        })

        document.querySelector('.questionsSettingsForm').addEventListener('submit', function (e) {
            e.preventDefault();
            // get type
            const type = document.querySelector('.actionsList>.actionItem.selected').getAttribute('data-type');
            // get level of difficulty
            const level = document.querySelector('#difficultyQues').value;
            // get num of ques
            const numOfQues = document.querySelector('#numberofques').value;

            generateQuestions({
                level: level,
                quesType: type,
                numQuestions: numOfQues
            })
        });
    }

    function changeStage(num, isRange = false) {
        const parentElement = document.querySelector('.mainContentbox');
        parentElement.setAttribute('data-stage', num);
        parentElement.setAttribute('data-of-stage-range', isRange);
    }

    function generateQuestions(data) {
        let sequence = 1;
        let quesDigits = 2;
        if (data.quesType === methods.AD || data.quesType === methods.SB || data.quesType === methods.ML) {
            sequence = 2;
        }
        if (data.level === "easy") {
            quesDigits = 2;
        } else if (data.level === "moderate") {
            quesDigits = 4;
        } else {
            quesDigits = 5;
        }

        const questions = generateRandomNumbs(data.numQuestions, quesDigits, sequence);
        convertQuesToMarkup(questions, data.quesType, sequence);
    }

    // for add,multy,sub
    function generateRandomNumbs(numQuestions, numDigits, sequence) {
        const questions = [];
        const minNum = Math.pow(10, numDigits - 1); // Minimum number based on the number of digits
        const maxNum = Math.pow(10, numDigits) - 1; // Maximum number based on the number of digits
        for (let i = 0; i < numQuestions; i++) {
            const num1 = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;

            const question = {
                'num1': num1,
            };

            if (sequence > 1) {
                const num2 = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
                question["num2"] = num2;
            }
            questions.push(question);
        }
        return questions;
    }

    function convertQuesToMarkup(questions, type, sequence) {
        changeStage(3, false);
        let symbol = "";
        if (type == methods.AD) {
            symbol = "+";
        } else if (type == methods.SB) {
            symbol = "-";
        } else if (type == methods.ML) {
            symbol = "*";
        } else if (type == methods.SQ) {
            symbol = "2";
        } else if (type == methods.SQR) {
            symbol = "√";
        } else if (type == methods.CRB) {
            symbol = "∛";
        } else if (type == methods.CB) {
            symbol = "3";
        }

        const html = questions.reduce(function (t, ques) {
            let praciceQueHtml = `<span class="praciceQue font-600 font-md">${ques.num1} ${symbol} ${ques.num2} =</span>`;
            if (sequence < 2 && (type != methods.CB && type != methods.SQ)) {
                praciceQueHtml = `<span class="praciceQue font-600 font-md">${symbol}${ques.num1} =</span>`;
            } else if (sequence < 2 && (type == methods.CB || type == methods.SQ)) {
                praciceQueHtml = `<span class="praciceQue font-600 font-md">${ques.num1}<sup>${symbol}</sup> =</span>`;
            }
            return t += `
                        <div class="practiceQueGrp">
                            ${praciceQueHtml}
                            <input type="number" class="font-600 font-md" data-num1='${ques.num1}' data-num2='${ques.num2}' data-method='${type}'>
                        </div>
                `;
        }, '');

        document.querySelector('.practiceQues').innerHTML = html;
        document.querySelector('.practiceQueGrp:nth-child(1)')?.classList.add('active');
    }

    function evaluate(data, quesEl) {
        let result = '';
        if (data.func == methods.AD) {
            result = eval(`${data.num1} + ${data.num2}`);
        } else if (data.func == methods.SB) {
            result = eval(`${data.num1} - ${data.num2}`);
        } else if (data.func == methods.ML) {
            result = eval(`${data.num1} * ${data.num2}`);
        } else if (data.func == methods.SQ) {
            result = eval(Math.pow(data.num1, 2));
        } else if (data.func == methods.CB) {
            result = eval(Math.pow(data.num1, 3));
        } else if (data.func == methods.SQR) {
            result = eval(Math.pow(data.num1, 1 / 2));
        } else if (data.func == methods.CRB) {
            result = eval(Math.pow(data.num1, 1 / 3));
        }
        if (result == data.value) {
            quesEl.classList.remove('active');
            const nextEl = quesEl.nextElementSibling;
            if (nextEl) {
                nextEl.classList.add('active');
                nextEl.focus();
            } else {
                changeStage(1);
            }
        }
    }

    // init
    init();
})();