const selects = document.querySelectorAll("select");
let form = document.querySelector("form");
const enviar = document.getElementById("enviar");
const lifeAcount = document.getElementById("lifeAcount");
const timerDisplay = document.getElementById('timerDisplay');
const boxLoader = document.querySelector(".boxLoader");
let heart = document.getElementById("heart");
let start = document.getElementById("start");

start.addEventListener("click", (ev) => {
  ev.preventDefault();

  start.textContent = "LOADING..."

  setTimeout(() => {
    start.classList.toggle("runPlay");
  }, 1000);

  setTimeout(() => {
    form.classList.add("renderForm");
  }, 1100);
})

const respostasCorretas = {
  questaoA: "The last of Us",
  questaoB: "Frango no Pote",
  questaoC: "Jorge e Matheus: O que é que Tem",
  questaoD: "Colar",
  questaoE: "Amor",
  questaoF: "Quarto 03",
  questaoG: "Vermelho",
  questaoH: "O dia em que fez minha sobrancelha",
  questaoI: "Conversando",
  questaoJ: "Nosso primeiro encontro"
};

let tentativas = 2;
let intervalId;

setInterval(function () {
  boxLoader.style.display = "none"
}, 1000 * 9);

function setLocalStorage(key, value) {
  localStorage.setItem(key, value);
}

function getLocalStorage(key) {
  return localStorage.getItem(key);
}

function clearLocalStorage(key) {
  localStorage.removeItem(key);
}

function setCookie(name, value, days) {
  const d = new Date();
  d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = "expires=" + d.toUTCString();
  document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

function getCookie(name) {
  const cname = name + "=";
  const decodedCookie = decodeURIComponent(document.cookie);
  const ca = decodedCookie.split(';');
  for(let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(cname) == 0) {
      return c.substring(cname.length, c.length);
    }
  }
  return "";
}

function clearCookie(name) {
  setCookie(name, "", -1);
}

function contagemRegressiva(segundos) {
  clearInterval(intervalId);
  timerDisplay.style.visibility = 'visible';
  const endTime = Date.now() + segundos * 1000;
  setLocalStorage('endTime', endTime);

  intervalId = setInterval(() => {
    const currentTime = Date.now();
    const remainingTime = Math.floor((endTime - currentTime) / 1000);

    if (remainingTime <= 0) {
      clearInterval(intervalId);
      clearLocalStorage('endTime');
      heart.className = "bi bi-heart-fill";
      enviar.disabled = false;
      timerDisplay.style.visibility = 'hidden';
      enviar.textContent = 'CONCLUIR';

      tentativas = 2;
      lifeAcount.textContent = tentativas;
      setCookie('tentativas', tentativas, 1);
      return;
    }

    timerDisplay.textContent = `Novas tentativas em ${remainingTime} segundos, favor aguarde!`;
    heart.className = "bi bi-heartbreak-fill";
    enviar.disabled = true;
    start.style.background = "green";
    start.textContent = "CONTINUAR JOGANDO";
    enviar.textContent = 'AGUARDE...';
  }, 1000);
}

function calcularScore() {
  let score = 0;

  selects.forEach(select => {
    if (select.value === respostasCorretas[select.id]) {
      score += 10;
    }
  });
  return score;
}

function criarRelatorioRespostas() {
  let relatorio = "RELATÓRIO DE RESPOSTAS:\n";
  selects.forEach((select, index) => {
    relatorio += `${index + 1}) ${select.value}\n`;
  });
  return relatorio;
}

function verificarTentativas() {
  const score = calcularScore();
  const relatorio = criarRelatorioRespostas();

  let confirme = confirm(`Tem certeza que deseja Salvar essas informações?
Resumo de suas respostas:

${relatorio}
`);

  if (confirme === true) {
    if (score < 90) {
      tentativas--;
      navigator.vibrate(100);
      lifeAcount.textContent = tentativas;
      setCookie('tentativas', tentativas, 1); 
      alert(`Seus Resultados:
         
Acertos: ${score}%

😰 Mais sorte na próxima vez`);

      if (tentativas === 0) {
        setTimeout(function () {
          tentativas = 2;
          lifeAcount.textContent = tentativas;
          setCookie('tentativas', tentativas, 1); 
          navigator.vibrate(1000);
        }, 1000 * 120);
        contagemRegressiva(120);
      }

    } else {
      alert(`Parabéns! Você acertou ${score}% das questões.`);

      const premio = prompt(`Parabéns por ter chegado até aqui
Escolha um dos premios abaixo:

A) 🎁 1 BomBom CS
B) 🎁 Irmos lanchar onde foi nosso primeiro encontro
`);

      form.method = "POST";
      form.action = "https://api.staticforms.xyz/submit";

      const textarea = document.createElement("textarea");
      textarea.name = "message";
      textarea.value = `Pontuação: ${score}%\r\n${relatorio}\r\nPrêmio selecionado: ${premio}`;
      form.appendChild(textarea);
      form.submit();
      form.removeChild(textarea);
    }
  }
}

enviar.addEventListener("click", (ev) => {
  ev.preventDefault();
  verificarTentativas();
});

window.onload = function () {
  const endTime = getLocalStorage('endTime');
  if (endTime) {
    const remainingTime = Math.floor((endTime - Date.now()) / 1000);
    if (remainingTime > 0) {
      contagemRegressiva(remainingTime);
    } else {
      clearLocalStorage('endTime');
      tentativas = 2; 
      lifeAcount.textContent = tentativas;
      setCookie('tentativas', tentativas, 1);
    }
  }

  const savedTentativas = getCookie('tentativas');
  if (savedTentativas) {
    tentativas = parseInt(savedTentativas, 10);
    lifeAcount.textContent = tentativas;
  } else {
    setCookie('tentativas', tentativas, 1); 
  }
};