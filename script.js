/**
 * Calculator
 * Совместим с текущим index.html
 */

const state = {
    current: "0",
    previous: null,
    operator: null,
    waitingForSecond: false,
    justCalculated: false,
    history: []
};

const resultEl = document.getElementById("result");
const expressionEl = document.getElementById("expression");

const keypad = document.getElementById("keypad");

const historyPanel = document.getElementById("historyPanel");
const historyList = document.getElementById("historyList");
const historyToggle = document.getElementById("historyToggle");
const historyClear = document.getElementById("historyClear");

function format(value) {
    if (value === "Ошибка") return value;

    const number = Number(value);

    if (!Number.isFinite(number))
        return "Ошибка";

    return parseFloat(number.toPrecision(12)).toString();
}

function updateDisplay() {
    resultEl.textContent = format(state.current);
}

function updateExpression(text = "") {
    expressionEl.textContent = text;
}

function clearOperatorHighlight() {
    document
        .querySelectorAll(".key--operator")
        .forEach(btn => btn.classList.remove("active"));
}

function highlightOperator(op) {
    clearOperatorHighlight();

    const btn = document.querySelector(
        `.key--operator[data-value="${op}"]`
    );

    if (btn)
        btn.classList.add("active");
}

function inputDigit(digit) {

    if (state.justCalculated) {

        state.current = digit;

        state.previous = null;
        state.operator = null;
        state.waitingForSecond = false;
        state.justCalculated = false;

        updateExpression("");
        updateDisplay();

        return;
    }

    if (state.waitingForSecond) {

        state.current = digit;
        state.waitingForSecond = false;

        updateDisplay();

        return;
    }

    if (state.current === "0") {

        state.current = digit;

    } else {

        if (state.current.length >= 15)
            return;

        state.current += digit;
    }

    updateDisplay();
}

function inputDecimal() {

    if (state.waitingForSecond) {

        state.current = "0.";
        state.waitingForSecond = false;

        updateDisplay();

        return;
    }

    if (state.current.includes("."))
        return;

    state.current += ".";

    updateDisplay();
}

function calculate(a, b, op) {

    switch (op) {

        case "+":
            return a + b;

        case "-":
            return a - b;

        case "*":
            return a * b;

        case "/":

            if (b === 0)
                return "Ошибка";

            return a / b;
    }

    return b;
}

function chooseOperator(op) {

    highlightOperator(op);

    if (
        state.operator &&
        !state.waitingForSecond
    ) {

        const result = calculate(
            Number(state.previous),
            Number(state.current),
            state.operator
        );

        if (result === "Ошибка") {

            state.current = "Ошибка";

            updateExpression("Деление на 0");
            updateDisplay();

            state.previous = null;
            state.operator = null;
            state.waitingForSecond = false;

            clearOperatorHighlight();

            return;
        }

        state.current = format(result);
        state.previous = state.current;

    } else {

        state.previous = state.current;
    }

    const symbols = {
        "+": "+",
        "-": "−",
        "*": "×",
        "/": "÷"
    };

    updateExpression(
        `${state.previous} ${symbols[op]}`
    );

    state.operator = op;
    state.waitingForSecond = true;
    state.justCalculated = false;

    updateDisplay();
}

function handleEqual() {

    if (
        !state.operator ||
        state.waitingForSecond
    )
        return;

    const symbols = {
        "+": "+",
        "-": "−",
        "*": "×",
        "/": "÷"
    };

    const expression =
        `${format(state.previous)} ${symbols[state.operator]} ${format(state.current)}`;

    const result = calculate(
        Number(state.previous),
        Number(state.current),
        state.operator
    );

    if (result === "Ошибка") {

        state.current = "Ошибка";

        updateExpression("Деление на 0");

        updateDisplay();

        state.previous = null;
        state.operator = null;
        state.waitingForSecond = false;

        clearOperatorHighlight();

        return;
    }

    state.current = format(result);

    state.history.unshift(
        `${expression} = ${state.current}`
    );

    renderHistory();

    updateExpression(expression + " =");

    state.previous = null;
    state.operator = null;
    state.waitingForSecond = false;
    state.justCalculated = true;

    clearOperatorHighlight();

    updateDisplay();
}

function clearAll() {

    state.current = "0";
    state.previous = null;
    state.operator = null;

    state.waitingForSecond = false;
    state.justCalculated = false;

    clearOperatorHighlight();

    updateExpression("");
    updateDisplay();
}
function backspace() {

    if (
        state.waitingForSecond ||
        state.justCalculated
    )
        return;

    if (
        state.current === "Ошибка" ||
        state.current.length === 1
    ) {

        state.current = "0";

    } else {

        state.current =
            state.current.slice(0, -1);

        if (state.current === "-")
            state.current = "0";
    }

    updateDisplay();
}

function handlePercent() {

    if (state.current === "Ошибка")
        return;

    if (
        state.previous &&
        state.operator
    ) {

        state.current = format(
            Number(state.previous) *
            Number(state.current) /
            100
        );

    } else {

        state.current = format(
            Number(state.current) / 100
        );
    }

    updateDisplay();
}

function renderHistory() {

    if (state.history.length === 0) {

        historyList.innerHTML =
            '<li class="history__empty">Пока пусто</li>';

        return;
    }

    historyList.innerHTML =
        state.history
            .map(item => `<li>${item}</li>`)
            .join("");
}

historyToggle.addEventListener("click", () => {

    historyPanel.classList.toggle("is-open");

    renderHistory();
});

historyClear.addEventListener("click", () => {

    state.history = [];

    renderHistory();
});

keypad.addEventListener("click", e => {

    const button = e.target.closest(".key");

    if (!button)
        return;

    const action = button.dataset.action;
    const value = button.dataset.value;

    switch (action) {

        case "digit":
            inputDigit(value);
            break;

        case "decimal":
            inputDecimal();
            break;

        case "operator":
            chooseOperator(value);
            break;

        case "equals":
            handleEqual();
            break;

        case "clear":
            clearAll();
            break;

        case "backspace":
            backspace();
            break;

        case "percent":
            handlePercent();
            break;
    }
});

document.addEventListener("keydown", e => {

    if (
        e.key >= "0" &&
        e.key <= "9"
    ) {

        inputDigit(e.key);
        return;
    }

    switch (e.key) {

        case ".":

        case ",":
            inputDecimal();
            break;

        case "+":
            chooseOperator("+");
            break;

        case "-":
            chooseOperator("-");
            break;

        case "*":
            chooseOperator("*");
            break;

        case "/":
            e.preventDefault();
            chooseOperator("/");
            break;

        case "Enter":

        case "=":
            handleEqual();
            break;

        case "Backspace":
            e.preventDefault();
            backspace();
            break;

        case "Escape":
            clearAll();
            break;

        case "%":
            handlePercent();
            break;
    }
});

updateDisplay();
renderHistory();