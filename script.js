/**
 * Calculator — чистый JavaScript
 * Этапы 2 и 3: базовая логика + доп. функции, обработка ошибок, история.
 */

// ── Состояние ──────────────────────────────────────────────────────────────
const state = {
  current: '0',       // текущее число на дисплее
  previous: null,     // предыдущее число
  operator: null,     // текущий оператор
  waitingForSecond: false, // ждём ввода второго операнда
  justCalculated: false,   // только что нажали «=»
  history: [],        // история вычислений
};

// ── Элементы DOM ───────────────────────────────────────────────────────────
const resultEl      = document.getElementById('result');
const expressionEl  = document.getElementById('expression');
const historyEl     = document.getElementById('history');
const historyToggle = document.getElementById('historyToggle');

// ── Утилиты ────────────────────────────────────────────────────────────────
function formatNumber(value) {
  const num = parseFloat(value);
  if (!isFinite(num)) return value; // «Ошибка» и т.п.
  // Ограничиваем длину, убираем лишние нули после запятой
  const str = parseFloat(num.toPrecision(10)).toString();
  return str;
}

function updateDisplay() {
  const text = formatNumber(state.current);
  resultEl.textContent = text;

  // Адаптивный размер шрифта
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
    // После «=» начинаем новое число
    state.current = digit;
    state.justCalculated = false;
    state.operator = null;
    state.previous = null;
    setExpression('');
  } else {
    if (state.current === '0' && digit !== '.') {
      state.current = digit;
    } else {
      if (state.current.length >= 12) return; // лимит символов
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
  if (state.current.includes('.')) return; // не допускаем вторую точку
  state.current += '.';
  updateDisplay();
}

// ── Выбор оператора ────────────────────────────────────────────────────────
function chooseOperator(op) {
  // Подсветить активный оператор
  document.querySelectorAll('.btn--op').forEach(b => b.classList.remove('active'));
  const btn = document.querySelector(`[data-value="${op}"]`);
  if (btn) btn.classList.add('active');

  const symbols = { '+': '+', '-': '−', '*': '×', '/': '÷' };

  if (state.operator && !state.waitingForSecond) {
    // Промежуточное вычисление при цепочке операций
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
    case '/':
      if (b === 0) {
        state.current = 'Ошибка';
        updateDisplay();
        setExpression('Деление на 0');
        resetOperators();
        return null;
      }
      return a / b;
    default: return b;
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
  if (result === null) return; // ошибка уже показана

  const resultStr = formatNumber(result);

  // Сохранить в историю
  addToHistory(expression, resultStr);

  setExpression(`${expression} =`);
  state.current = resultStr;
  updateDisplay();

  state.justCalculated = true;
  resetOperators();
}

// ── Очистка ────────────────────────────────────────────────────────────────
function clearAll() {
  state.current = '0';
  state.previous = null;
  state.operator = null;
  state.waitingForSecond = false;
  state.justCalculated = false;
  setExpression('');
  updateDisplay();
  resetOperators();
}

// ── Backspace ──────────────────────────────────────────────────────────────
function backspace() {
  if (state.justCalculated || state.waitingForSecond) return;
  if (state.current.length === 1 || state.current === 'Ошибка') {
    state.current = '0';
  } else {
    state.current = state.current.slice(0, -1);
    if (state.current === '-') state.current = '0';
  }
  updateDisplay();
}

// ── Смена знака ────────────────────────────────────────────────────────────
function toggleSign() {
  if (state.current === '0' || state.current === 'Ошибка') return;
  state.current = state.current.startsWith('-')
    ? state.current.slice(1)
    : '-' + state.current;
  updateDisplay();
}

// ── Процент ────────────────────────────────────────────────────────────────
function handlePercent() {
  const val = parseFloat(state.current);
  if (isNaN(val)) return;
  if (state.previous && state.operator) {
    // X% от предыдущего числа
    state.current = formatNumber((parseFloat(state.previous) * val) / 100);
  } else {
    state.current = formatNumber(val / 100);
  }
  updateDisplay();
}

// ── История ────────────────────────────────────────────────────────────────
function addToHistory(expression, result) {
  state.history.push({ expression, result });
  renderHistory();
}

function renderHistory() {
  if (state.history.length === 0) {
    historyEl.innerHTML = '<div class="history__inner"><p class="history__empty">Пусто</p></div>';
    return;
  }
  const items = state.history.map(
    ({ expression, result }) =>
      `<div class="history__item"><span>${expression}</span> = ${result}</div>`
  ).join('');
  historyEl.innerHTML = `<div class="history__inner">${items}</div>`;
}

historyToggle.addEventListener('click', () => {
  historyToggle.classList.toggle('open');
  historyEl.classList.toggle('open');
  if (historyEl.classList.contains('open') && state.history.length === 0) {
    renderHistory();
  }
});

// ── Обработка кликов по кнопкам ───────────────────────────────────────────
document.querySelector('.buttons').addEventListener('click', (e) => {
  const btn = e.target.closest('.btn');
  if (!btn) return;

  const action = btn.dataset.action;
  const value  = btn.dataset.value;

  switch (action) {
    case 'digit':    inputDigit(value); break;
    case 'dot':      inputDot();        break;
    case 'operator': chooseOperator(value); break;
    case 'equal':    handleEqual();     break;
    case 'clear':    clearAll();        break;
    case 'sign':     toggleSign();      break;
    case 'percent':  handlePercent();   break;
  }
});

// ── Клавиатурная поддержка ────────────────────────────────────────────────
document.addEventListener('keydown', (e) => {
  if (e.key >= '0' && e.key <= '9') inputDigit(e.key);
  else if (e.key === '.')  inputDot();
  else if (e.key === '+')  chooseOperator('+');
  else if (e.key === '-')  chooseOperator('-');
  else if (e.key === '*')  chooseOperator('*');
  else if (e.key === '/')  { e.preventDefault(); chooseOperator('/'); }
  else if (e.key === 'Enter' || e.key === '=') handleEqual();
  else if (e.key === 'Backspace') backspace();
  else if (e.key === 'Escape')    clearAll();
  else if (e.key === '%')         handlePercent();
});

// ── Инициализация ─────────────────────────────────────────────────────────
updateDisplay();
