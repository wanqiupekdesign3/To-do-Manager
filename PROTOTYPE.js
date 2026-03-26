
const inputBox = document.getElementById("input-box");
const listContainer = document.getElementById("list-container");
const display = document.getElementById("display");

function addTask() {
    if(inputBox.value === "") {
        alert("Write something");
        return;
    }
    
        let li = document.createElement("li");

        let taskText = document.createElement("span")
        taskText.className = "task-text"
        taskText.innerText = inputBox.value;

        let progress = document.createElement("input")
        progress.type = "range";
        progress.min = 0;
        progress.max = 100;
        progress.value = 0;

        let percent = document.createElement("span");
        percent.innerText = "0%";

        progress.oninput = function () {  
          percent.innerText = progress.value + "%";
          saveData();
        };
        
    let deleteBtn = document.createElement("span");
    deleteBtn.innerHTML = "\u00d7";
    deleteBtn.className = "delete";
    

    li.appendChild(taskText);
    li.appendChild(progress);
    li.appendChild(percent);
    li.appendChild(deleteBtn);

    listContainer.appendChild(li);

    inputBox.value = "";
    saveData();
}
listContainer.addEventListener("click", function(e) {
    if(e.target.className === "delete") {
        e.target.parentElement.remove();
        saveData();
    }
  });
function clearTask() 
{
  localStorage.removeItem("data");
  listContainer.innerHTML = "";
}
function saveData() {
  const tasks = [];
  document.querySelectorAll("#list-container li").forEach(li => {
    const text = li.querySelector(".task-text").innerText;
    const progress = li.querySelector("input[type='range']").value;
    tasks.push({ text, progress });
  });
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function loadData() {
  const data = localStorage.getItem("tasks");
  if (!data) return;

  const tasks = JSON.parse(data);
  listContainer.innerHTML = "";

  tasks.forEach(task => {
    let li = document.createElement("li");

    let taskText = document.createElement("span");
    taskText.className = "task-text";
    taskText.innerText = task.text;

    let progress = document.createElement("input");
    progress.type = "range";
    progress.min = 0;
    progress.max = 100;
    progress.value = task.progress;

    let percent = document.createElement("span");
    percent.innerText = task.progress + "%";

    progress.oninput = function () {
      percent.innerText = progress.value + "%";
      saveData();
    };

    let deleteBtn = document.createElement("span");
    deleteBtn.innerHTML = "\u00d7";
    deleteBtn.className = "delete";

    li.append(taskText, progress, percent, deleteBtn);
    listContainer.appendChild(li);
  });
}
loadData();

function appendToDisplay(input) {
    display.value += input;
}

function clearDisplay(){
    display.value = "";
}

function calculateResult() {
    try {
         display.value = eval(display.value);
    }
    catch(error) {
        display.value = "Error";
    }

}
function fmt(num){
  if (!isFinite(num)) return "MYR 0.00";
  return "MYR " + Number(num).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function clamp(v, min, max){ return Math.min(Math.max(v, min), max); }

const els = {
  income: null,
  expense: null,
  update: null,
  reset: null,
  progress: null,
  fill: null,
  status: null,
  remainingText: null,
  statIncome: null,
  statSpent: null,
  statRemain: null,
};

function cacheElements(){
  els.income = document.getElementById('income');
  els.expense = document.getElementById('expense');
  els.update = document.getElementById('updateBtn');
  els.reset = document.getElementById('resetBtn');
  els.progress = document.getElementById('progress');
  els.fill = document.getElementById('fill');
  els.status = document.getElementById('statusText');
  els.remainingText = document.getElementById('remainingText');
  els.statIncome = document.getElementById('statIncome');
  els.statSpent  = document.getElementById('statSpent');
  els.statRemain = document.getElementById('statRemain');
}

function getValues(){
  const income = parseFloat(els.income.value);
  const expense = parseFloat(els.expense.value);
  return {
    income: isFinite(income) && income >= 0 ? income : 0,
    expense: isFinite(expense) && expense >= 0 ? expense : 0
  };
}

function updateBar(){
  const { income, expense } = getValues();

  // Compute stats
  const spent = expense;
  const remaining = income - spent;
  // Percent of income used; if income is 0, treat any spend as 100%+
  const percentUsed = income > 0 ? (spent / income) * 100 : (spent > 0 ? 100 : 0);

  // Apply width (cap visually at 100%)
  const width = clamp(percentUsed, 0, 100).toFixed(2) + "%";
  els.fill.style.width = width;

  // Status text + ARIA
  const percentText = percentUsed.toFixed(1).replace(/\.0$/, '');
  els.status.textContent = `${percentText}% of income used`;
  els.progress.setAttribute('aria-valuenow', clamp(percentUsed, 0, 100).toFixed(0));

  // Remaining label
  els.remainingText.textContent = `Remaining: ${fmt(Math.max(0, remaining))}`;

  // Stats
  els.statIncome.textContent = fmt(income);
  els.statSpent.textContent  = fmt(spent);
  els.statRemain.textContent = remaining >= 0 ? fmt(remaining) : `-${fmt(Math.abs(remaining))}`;

  // Color states: ok (<=70%), warn (70–100%), bad (>100%)
  els.progress.classList.remove('ok', 'warn', 'bad');
  if (percentUsed <= 70) els.progress.classList.add('ok');
  else if (percentUsed <= 100) els.progress.classList.add('warn');
  else els.progress.classList.add('bad');
}

function resetAll(){
  els.income.value = '';
  els.expense.value = '';
  updateBar();
  // Return focus to the first input for faster re-entry
  els.income.focus();
}

function wireUp(){
  els.update.addEventListener('click', updateBar);
  els.reset.addEventListener('click', resetAll);


 

  updateBar();
}

document.addEventListener('DOMContentLoaded', () => {
  cacheElements();
  wireUp();
});
