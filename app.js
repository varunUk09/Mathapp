(function () {
    const METHODS = {
        AD: "+",
        SB: '-',
        ML: '*',
        CRB: 'cbrt',
        SQR: 'sqrt',
        CB: 'cb',
        SQ: 'sq'
    }
    const DATA = {
        'KEYAD': {
            num: 2,
            for: METHODS.AD,
            frmData: ['ques', 'level']
        },
        'KEYSB': {
            num: 2,
            for: METHODS.SB,
            frmData: ['ques', 'level']
        },
        'KEYML': {
            num: 2,
            for: METHODS.ML,
            frmData: ['ques', 'level']
        },
        'KEYCRB': {
            num: 2,
            for: METHODS.CRB,
            frmData: ['ques', 'level']
        },
        'KEYSQR': {
            num: 2,
            for: METHODS.SQR,
            frmData: ['ques', 'level']
        },
        'KEYCB': {
            num: 2,
            for: METHODS.CB,
            frmData: ['ques', 'level', 'range']
        },
        'KEYSQ': {
            num: 2,
            for: METHODS.SQ,
            frmData: ['ques', 'level', 'range']
        },
        'HTMLs': {
            'inputHTML': {
                ques: `
                <div class="fieldGroup" data-ques-nums="">
                    <label for="numberofques" class="font-600 font-md">1. Number of questions?</label>
                    <input type="number" min="1" max="100" id="numberofques" class="font-400 font-md styledField" required="true" name="numberofques">
                </div>
                `,
                level: `
                <div class="fieldGroup" data-ques-levels="">
                    <label for="difficultyQues" class="font-600 font-md">2. Difficulty</label>
                        <select class="font-400 font-md styledField" id="difficultyQues">
                            <option value="easy">Easy</option>
                            <option value="moderate">Moderate</option>
                            <option value="difficult">Difficult</option>
                        </select>

                </div>
                `,
                range: `
                <div class="fieldGroup" data-ques-range="">
                    <label class="font-600 font-md">3. Provide range (From - To)</label>
                    <input type="number" min="1" max="100" id="rangeFrom" class="font-400 font-md styledField" required="true">
                    <input type="number" min="1" max="100" id="rangeTo" class="font-400 font-md styledField" required="true">
                </div>
                `
            },

        },
        questionsGenerated: ''
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

    // stage 2 forms generator
    function generateForms(key) {
        const stepNavigationHTML = `<div class="fieldGroup">
                                <div class="stepNavigation">
                                    <button class="changeStep" data-go-to-step="1" type="button">
                                        <img src="./images/backicon.svg">
                                    </button>
                                </div>
                            </div>`;
        const submitCtaHTML = `<div class="fieldGroup">
                                <input type="submit" id="submitQuesSettings" class="font-600 font-md primaryCta" value="Start">
                            </div>`;
        let fieldsHTML = DATA[key].frmData.reduce((t, crr) => {
            return t += DATA.HTMLs.inputHTML[crr];
        }, '');

        const formHTML = `
        ${stepNavigationHTML}
        ${fieldsHTML}
        ${submitCtaHTML}
        `;

        update({ STAGEFRM: formHTML });

    }
    var stopwatch = new Stopwatch();
    function init() {
        events();
    }

    function events() {
        live('[data-action-cta]', 'click', function () {
            const prevSelected = this.parentElement.querySelector('.selected');
            if (prevSelected && prevSelected !== this) {
                prevSelected.classList.remove('selected');
            }
            this.classList.add('selected');
            const key = this.getAttribute('data-action-cta');
            const data = DATA[key];
            const num = data.num;
            generateForms(key);
            changeStage(num);
        });

        live('.practiceQues input[type="number"]', 'input', function () {
            const activeEl = document.querySelector('.practiceQues .practiceQueGrp.active');
            if (activeEl) {
                const index = activeEl.getAttribute('data-index');
                const data = DATA.questionsGenerated[index];
                data.value = this.value;
                checkAnswer(data, activeEl);
            }
        });

        live('[data-go-to-step]', 'click', function () {
            const stepNum = this.getAttribute('data-go-to-step');
            if (stepNum == '1') {
                reset({ 'PQUESLST': true, ANSBX: true, RQSTFRM: true, GENQUES: true });
            }
            changeStage(stepNum);
        });

        document.querySelector('.questionsSettingsForm').addEventListener('submit', function (e) {
            e.preventDefault();
            const selectedActionCta = document.querySelector('.actionsList>.actionItem.selected');
            const selectedActionCtaKey = selectedActionCta.getAttribute('data-action-cta');
            // get type
            const type = DATA[selectedActionCtaKey].for;
            // get level of difficulty
            const level = document.querySelector('#difficultyQues').value;
            // get num of ques
            const numOfQues = document.querySelector('#numberofques').value;

            const data = {
                level: level,
                quesType: type,
                numQuestions: numOfQues
            }

            if (document.querySelector('html body .mainContentbox #rangeFrom')) {
                // get range
                const range1 = document.querySelector('#rangeFrom').value;
                const range2 = document.querySelector('#rangeTo').value;
                data['range'] = {
                    range1: range1,
                    range2: range2
                }
            }

            reset({ 'ANSBX': true, 'PRACTICEDIVCLS': true });

            generateQuestions(data);
        });
    }

    function changeStage(num) {
        const parentElement = document.querySelector('.mainContentbox');
        parentElement.setAttribute('data-stage', num);
    }

    function generateQuestions(data) {
        let sequence = 1;
        let quesDigits = 2;
        if (data.quesType === METHODS.AD || data.quesType === METHODS.SB || data.quesType === METHODS.ML) {
            sequence = 2;
        }
        if (data.level === "easy") {
            quesDigits = 2;
        } else if (data.level === "moderate") {
            quesDigits = 4;
        } else {
            quesDigits = 5;
        }

        const quesData = {
            numQuestions: data.numQuestions,
            quesDigits: quesDigits,
            sequence: sequence,
            type: data.quesType
        }

        if (data.range) {
            quesData['minRange'] = data.range.range1;
            quesData['maxRange'] = data.range.range2;
        }

        const questions = generateRandomNumbs(quesData);
        DATA.questionsGenerated = questions;
        convertQuesToMarkup(questions, data.quesType, sequence);
    }

    // for add,multy,sub
    function generateRandomNumbs(data) {
        const questions = [];
        let minNum = data.minRange || Math.pow(10, data.quesDigits - 1); // Minimum number based on the number of digits
        let maxNum = data.maxRange || Math.pow(10, data.quesDigits) - 1; // Maximum number based on the number of digits
        for (let i = 0; i < data.numQuestions; i++) {
            const num1 = Math.floor(Math.random() * (maxNum - minNum + 1)) + Number(minNum);
            let num2 = '';
            const question = {
                'num1': num1,
                'func': data.type
            };
            if (data.sequence > 1) {
                num2 = Math.floor(Math.random() * (maxNum - minNum + 1)) + Number(minNum);
                question["num2"] = num2;
            }

            // evaluating
            let result = '-';
            if (data.type == METHODS.AD) {
                result = eval(`${num1} + ${num2}`);
            } else if (data.type == METHODS.SB) {
                result = eval(`${num1} - ${num2}`);
            } else if (data.type == METHODS.ML) {
                result = eval(`${num1} * ${num2}`);
            } else if (data.type == METHODS.SQ) {
                result = Number(eval(Math.pow(num1, 2)).toFixed(2));
            } else if (data.type == METHODS.CB) {
                result = Number(eval(Math.pow(num1, 3)).toFixed(2))
            } else if (data.type == METHODS.SQR) {
                result = Number(eval(Math.pow(num1, 1 / 2)).toFixed(2));
            } else if (data.type == METHODS.CRB) {
                result = Number(eval(Math.pow(num1, 1 / 3)).toFixed(2));
            }
            question.result = result;

            questions.push(question);
        }
        console.log(questions);
        return questions;
    }

    function checkAnswer(data, quesEl) {
        const ansInputBox = document.querySelector('.practiceQues input[type="number"]');
        if (data.result == data.value) {
            quesEl.classList.remove('active');
            const nextEl = quesEl.nextElementSibling;
            if (nextEl) {
                nextEl.classList.add('active');
                update({ QUESCOUNT: true });
                reset({ 'ANSBX': true });
                ansInputBox.focus();
            } else {
                document.querySelector('html body .practiceQues').classList.add('showReplay');
                reset({ 'PQUESLST': true, ANSBX: true, RQSTFRM: true, GENQUES: true, TIMER: true });
            }
        }
    }

    function convertQuesToMarkup(questions, type, sequence) {
        changeStage(3);
        const html = questions.reduce(function (t, ques, index) {
            let praciceQueHtml = `<span class="praciceQue font-600 font-md">
                ${formatNumToString({
                num1: ques.num1,
                num2: ques.num2,
                sequence: sequence,
                type: type
            })}
            </span>`;
            return t += `
                        <div class="practiceQueGrp" data-index='${index}'>
                            ${praciceQueHtml}
                        </div>
                `;
        }, '');
        update({ QUESCOUNT: true });
        update({ PQUESLST: html });
        document.querySelector('.practiceQueGrp:nth-child(1)')?.classList.add('active');
        // Start the stopwatch
        stopwatch.start();
        // Log the elapsed time every second until the stopwatch is stopped
        DATA.quesTimer = setInterval(function () {
            const timerEl = document.querySelector('html body .practiceQues>.info>.timer');
            if (timerEl) {
                timerEl.innerHTML = formatTime(stopwatch.getTime());
            }
        }, 1);

    }

    function reset(what) {
        // practice questions ?
        if (what.PQUESLST) {
            document.querySelector('html body .practiceQuesList').innerHTML = '';
        }

        // answer box ?
        if (what.ANSBX) {
            document.querySelector('html body .practiceQues input').value = '';
        }

        // requirement form ?
        if (what.RQSTFRM) {
            document.querySelector('html body .questionsSettingsForm').innerHTML = '';
        }

        // generated Ques ?
        if (what.GENQUES) {
            DATA.questionsGenerated = '';
        }

        // remove show replay class from stage 3 ?
        if (what.PRACTICEDIVCLS) {
            document.querySelector('html body .practiceQues').classList.remove('showReplay');
        }

        // ques timer reset ?
        if (what.TIMER) {
            if (DATA.quesTimer) {
                clearInterval(DATA.quesTimer);
                stopwatch.stop();
                stopwatch.reset();
            }
        }
    }

    function update(what) {
        // questions list ?
        if (what.PQUESLST) {
            document.querySelector('html body .practiceQuesList').innerHTML = what.PQUESLST;
        }

        // Stage 2 form html ?
        if (what.STAGEFRM) {
            const formElement = document.querySelector('html body .questionsSettingsForm');
            formElement.innerHTML = what.STAGEFRM;
        }

        // ques count
        if (what.QUESCOUNT) {
            let length = DATA.questionsGenerated.length;
            if (length < 10) {
                length = `0${length}`;
            }
            const activeQues = findActiveIndex();
            document.querySelector('html body .practiceQues>.info>.count').innerHTML = activeQues + '/' + length;
        }
    }

    // This function converts numbers in string as per the action like if action is addition so it will convert two numbers to like this 2 + 2
    function formatNumToString(data) {
        let symbol = "";
        if (data.type == METHODS.AD) {
            symbol = "+";
        } else if (data.type == METHODS.SB) {
            symbol = "-";
        } else if (data.type == METHODS.ML) {
            symbol = "*";
        } else if (data.type == METHODS.SQ) {
            symbol = "2";
        } else if (data.type == METHODS.SQR) {
            symbol = "√";
        } else if (data.type == METHODS.CRB) {
            symbol = "∛";
        } else if (data.type == METHODS.CB) {
            symbol = "3";
        }
        let formatedNums = `${data.num1} ${symbol} ${data.num2} = `;
        if (data.sequence < 2 && (data.type != METHODS.CB && data.type != METHODS.SQ)) {
            formatedNums = `${symbol}${data.num1} = `;
        } else if (data.sequence < 2 && (data.type == METHODS.CB || data.type == METHODS.SQ)) {
            formatedNums = `${data.num1}<sup>${symbol}</sup> = `;
        }
        return formatedNums;
    }

    function findActiveIndex() {
        // Get all list items
        const listItems = document.querySelectorAll('html body .practiceQuesList > .practiceQueGrp');
        const activeEl = document.querySelector('html body .practiceQuesList > .practiceQueGrp.active');
        let activeIndex = '01';
        // Get the index of the active element
        if (activeEl) {
            activeIndex = Array.from(listItems).indexOf(document.querySelector('html body .practiceQuesList > .practiceQueGrp.active')) + 1;
            if (activeIndex < 10) {
                activeIndex = `0${activeIndex}`;
            }
        }

        return activeIndex;
    }

    function Stopwatch() {
        var startTime,
            stopTime,
            running = false,
            duration = 0;

        this.start = function () {
            if (!running) {
                running = true;
                startTime = new Date();
            }
        };

        this.stop = function () {
            if (running) {
                running = false;
                stopTime = new Date();
                duration += stopTime - startTime;
            }
        };

        this.reset = function () {
            startTime = null;
            stopTime = null;
            running = false;
            duration = 0;
        };

        this.getTime = function () {
            if (running) {
                return duration + (new Date() - startTime);
            } else {
                return duration;
            }
        };
    }

    function formatTime(milliseconds) {
        var hours = Math.floor(milliseconds / (1000 * 60 * 60));
        var minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
        var millisecondsPart = milliseconds % 1000;

        // Add leading zeros if necessary
        hours = (hours < 10) ? "0" + hours : hours;
        minutes = (minutes < 10) ? "0" + minutes : minutes;
        seconds = (seconds < 10) ? "0" + seconds : seconds;
        millisecondsPart = (millisecondsPart < 100) ? (millisecondsPart < 10) ? "00" + millisecondsPart : "0" + millisecondsPart : millisecondsPart;

        return hours + ":" + minutes + ":" + seconds + ":" + millisecondsPart;
    }


    // init
    init();

    // PWA
    if ("serviceWorker" in navigator) {
        navigator.serviceWorker
            .register("/serviceWorker.js")
            .then(res => console.log("service worker registered"))
            .catch(err => console.log("service worker not registered", err));
    }
})();