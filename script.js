/**
 * Calculator — чистый JavaScript
 * Этап 2: базовая логика вычислений
 */

// ── Состояние ──────────────────────────────────────────────────────────────
const state = {
  current: '0',
  previous: null,
  operator: null,
  waitingForSecond: false,
  justCalculated: false,
};

// ── Элементы DOM ───────────────────────────────────────────────────────────
const resultEl     = document.getElementById('result');
const expressionEl = document.getElementById('expression');

// ── Утилиты ────────────────────────────────────────────────────────────────
function formatNumber(value) {
  const num = parseFloat(value);
  if (!isFinite(num)) return value;
  return parseFloat(num.toPrecision(10)).toString();
}

function updateDisplay() {
  const text = formatNumber(state.current);
  resultEl.textContent = text;

  resultEl.classList.remove('small', 'xsmall');
  if (text.length > 9) resultEl.classList.add('xsmall');
  else if (text.length > 6) resultEl.classList.add('small');
}

function setExpression(text) {
  expressionEl.textContent = text;
}

// ── Ввод цифр ──────────────────────────────────────────────────────────────
function inputDigit(digit) {
  if (state.waitingForSecond) {
    state.current = digit;
    state.waitingForSecond = false;
  } else if (state.justCalculated) {
    state.current = digit;
    state.justCalculated = false;
    state.operator = null;
    state.previous = null;
    setExpression('');
  } else {
    if (state.current === '0' && digit !== '.') {
      state.current = digit;
    } else {
      if (state.current.length >= 12) return;
      state.current += digit;
    }
  }
  updateDisplay();
}

// ── Ввод точки ─────────────────────────────────────────────────────────────
function inputDot() {
  if (state.waitingForSecond) {
    state.current = '0.';
    state.waitingForSecond = false;
    updateDisplay();
    return;
  }
  if (state.current.includes('.')) return;
  state.current += '.';
  updateDisplay();
}

// ── Выбор оператора ────────────────────────────────────────────────────────
function chooseOperator(op) {
  document.querySelectorAll('.btn--op').forEach(b => b.classList.remove('active'));
  const btn = document.querySelector(`[data-value="${op}"]`);
  if (btn) btn.classList.add('active');

  const symbols = { '+': '+', '-': '−', '*': '×', '/': '÷' };

  if (state.operator && !state.waitingForSecond) {
    const result = calculate(parseFloat(state.previous), parseFloat(state.current), state.operator);
    if (result === null) return;
    state.current = formatNumber(result);
    updateDisplay();
    setExpression(`${state.current} ${symbols[op]}`);
    state.previous = state.current;
  } else {
    state.previous = state.current;
    setExpression(`${state.current} ${symbols[op]}`);
  }

  state.operator = op;
  state.waitingForSecond = true;
  state.justCalculated = false;
}

// ── Вычисление ─────────────────────────────────────────────────────────────
function calculate(a, b, op) {
  switch (op) {
    case '+': return a + b;
    case '-': return a - b;
    case '*': return a * b;
    case '/': return a / b;
    default:  return b;
  }
}

function resetOperators() {
  state.operator = null;
  state.previous = null;
  state.waitingForSecond = false;
  document.querySelectorAll('.btn--op').forEach(b => b.classList.remove('active'));
}

// ── Равно ──────────────────────────────────────────────────────────────────
function handleEqual() {
  if (!state.operator || state.waitingForSecond) return;

  const a = parseFloat(state.previous);
  const b = parseFloat(state.current);
  const symbols = { '+': '+', '-': '−', '*': '×', '/': '÷' };

  const expression = `${formatNumber(a)} ${symbols[state.operator]} ${formatNumber(b)}`;
  const result = calculate(a, b, state.operator);
  if (result === null) return;

  const resultStr = formatNumber(result);

  setExpression(`${expression} =`);
  state.current = resultStr;
  updateDisplay();

  state.justCalculated = true;
  resetOperators();
}

// ── Обработка кликов по кнопкам ───────────────────────────────────────────
document.querySelector('.buttons').addEventListener('click', (e) => {
  const btn = e.target.closest('.btn');
  if (!btn) return;

  const action = btn.dataset.action;
  const value  = btn.dataset.value;

  switch (action) {
    case 'digit':    inputDigit(value);     break;
    case 'dot':      inputDot();            break;
    case 'operator': chooseOperator(value); break;
    case 'equal':    handleEqual();         break;
  }
});

// ── Клавиатурная поддержка ────────────────────────────────────────────────
document.addEventListener('keydown', (e) => {
  if (e.key >= '0' && e.key <= '9') inputDigit(e.key);
  else if (e.key === '.')  inputDot();
  else if (e.key === '+')  chooseOperator('+');
  else if (e.key === '-')  chooseOperator('-');
  else if (e.key === '*')  chooseOperator('*');
  else if (e.key === '/') { e.preventDefault(); chooseOperator('/'); }
  else if (e.key === 'Enter' || e.key === '=') handleEqual();
});

// ── Инициализация ─────────────────────────────────────────────────────────
updateDisplay();
