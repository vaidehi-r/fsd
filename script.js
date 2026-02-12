const display = document.getElementById("display");
const buttons = document.querySelectorAll("button");

let current = "0";
let prev = null;
let op = null;
let startNew = false;

function update() {
  display.textContent = current;
}

function compute(a, operator, b) {
  a = Number(a);
  b = Number(b);

  if (operator === "+") return a + b;
  if (operator === "-") return a - b;
  if (operator === "*") return a * b;
  if (operator === "/") return b === 0 ? "Error" : a / b;

  return b;
}

buttons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const val = btn.dataset.val;
    const operator = btn.dataset.op;
    const action = btn.dataset.action;

    // CLEAR
    if (action === "clear") {
      current = "0";
      prev = null;
      op = null;
      startNew = false;
      update();
      return;
    }

    // EQUALS
    if (action === "equals") {
      if (prev !== null && op !== null) {
        const result = compute(prev, op, current);
        current = String(result);
        prev = null;
        op = null;
        startNew = true;
        update();
      }
      return;
    }

    // OPERATOR
    if (operator) {
      if (current === "Error") return;

      if (prev === null) {
        prev = current;
      } else if (op !== null && !startNew) {
        prev = String(compute(prev, op, current));
      }

      op = operator;
      startNew = true;
      return;
    }

    // NUMBER
    if (val !== undefined) {
      if (current === "Error") current = "0";

      if (startNew) {
        current = val;
        startNew = false;
      } else {
        current = current === "0" ? val : current + val;
      }

      update();
    }
  });
});

update();
