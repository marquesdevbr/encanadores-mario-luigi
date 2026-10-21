/*
 * Irmãos Encanadores Mario & Luigi — scripts
 * 1. Abrir e fechar o formulário de orçamento (elemento <dialog>)
 * 2. Enviar o formulário sem sair da página (com tratamento de erro)
 * 3. Controle do vídeo de fundo (pausa manual e prefers-reduced-motion)
 */

/* ---------- 1. Formulário (dialog) ---------- */
const dialogo = document.querySelector("#formulario");
const formulario = document.querySelector("#form-orcamento");
const statusForm = document.querySelector("#form-status");
const botaoEnviar = document.querySelector("#botao-enviar");

function mostrarForm() {
  if (!dialogo) return;
  limparStatus();
  if (typeof dialogo.showModal === "function") {
    dialogo.showModal();
  } else {
    // Navegadores antigos sem suporte a <dialog>
    dialogo.setAttribute("open", "");
  }
  document.querySelector("#campo-nome")?.focus();
}

function esconderForm() {
  if (!dialogo) return;
  if (typeof dialogo.close === "function") {
    dialogo.close();
  } else {
    dialogo.removeAttribute("open");
  }
}

function limparStatus() {
  statusForm.textContent = "";
  statusForm.className = "form-status";
}

document.querySelectorAll("[data-abrir-form]").forEach((botao) => {
  botao.addEventListener("click", mostrarForm);
});

document.querySelectorAll("[data-fechar-form]").forEach((botao) => {
  botao.addEventListener("click", esconderForm);
});

// Clique fora da caixa (no fundo escurecido) fecha o formulário
dialogo?.addEventListener("click", (evento) => {
  if (evento.target === dialogo) esconderForm();
});

/* ---------- 2. Envio do formulário ---------- */
formulario?.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  limparStatus();
  botaoEnviar.disabled = true;
  botaoEnviar.textContent = "Enviando...";

  try {
    const resposta = await fetch(formulario.action, {
      method: "POST",
      body: new FormData(formulario),
      headers: { Accept: "application/json" },
    });
    const dados = await resposta.json().catch(() => ({}));

    if (!resposta.ok || (dados.code && dados.code !== 200)) {
      throw new Error(dados.message || `Erro ${resposta.status}`);
    }

    statusForm.textContent = "Pedido enviado! (Demonstração: ninguém vai responder de verdade.)";
    statusForm.classList.add("sucesso");
    formulario.reset();
  } catch (erro) {
    console.error("Falha ao enviar o formulário:", erro);
    statusForm.textContent =
      "Não foi possível enviar agora. Verifique sua conexão e tente novamente.";
    statusForm.classList.add("erro");
  } finally {
    botaoEnviar.disabled = false;
    botaoEnviar.textContent = "Enviar pedido";
  }
});

/* ---------- 3. Vídeo de fundo ---------- */
const video = document.querySelector("#video-fundo");
const botaoVideo = document.querySelector("#botao-video");
const prefereMenosMovimento = window.matchMedia("(prefers-reduced-motion: reduce)");

function atualizarBotaoVideo() {
  const pausado = video.paused;
  botaoVideo.textContent = pausado ? "Reproduzir vídeo de fundo" : "Pausar vídeo de fundo";
  botaoVideo.setAttribute("aria-pressed", String(pausado));
}

if (video && botaoVideo) {
  if (prefereMenosMovimento.matches) {
    video.removeAttribute("autoplay");
    video.pause();
  }

  botaoVideo.addEventListener("click", () => {
    if (video.paused) {
      video.play().catch((erro) => console.warn("Não foi possível reproduzir o vídeo:", erro));
    } else {
      video.pause();
    }
  });

  video.addEventListener("play", atualizarBotaoVideo);
  video.addEventListener("pause", atualizarBotaoVideo);
  atualizarBotaoVideo();
} else {
  botaoVideo?.remove();
}
