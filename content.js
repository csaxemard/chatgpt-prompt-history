function devLog(message, isVerbose = true) {
    if (loggingMode === "dev" && isVerbose == verboseLogging) {
        console.log(message);
    }
}

function createPanel() {
    if (document.getElementById("CPH_ext-main")) return;

    const panel = document.createElement("div");
    panel.id = "CPH_ext-main";
    // panel.innerHTML = `<div id="CPH_ext-panelOverlay"></div>`

    const list = document.createElement("div");
    list.id = "CPH_ext-promptReferencesList";
    panel.appendChild(list);

    document.body.appendChild(panel);
}

function updatePromptReferencesList() {
    devLog("mutating")
    const mainPanel = document.getElementById("CPH_ext-main");
    const list = document.getElementById("CPH_ext-promptReferencesList");
    if (!list) return;

    list.innerHTML = "";

    const promptNodes = document.querySelectorAll("[data-message-author-role='user']");    // Selector pour tous les prompts
    promptNodes.forEach((node) => {
        const reference = document.createElement("div");
        reference.className = "CPH_ext-promptReference";
        reference.textContent = node.innerText.slice(0, 100); // aperçu du prompt
        reference.title = node.innerText;

        // Scroll vers le prompt au clic
        reference.addEventListener("click", () => {
            node.scrollIntoView({ behavior: "smooth" });
        });

        list.appendChild(reference);
    });
    mainPanel.style.height = "auto";
    mainPanel.style.height = mainPanel.getBoundingClientRect().height + "px";
    mainPanel.dataset.promptsNumber = promptNodes.length;

    // Cache main si moins de 4 prompts
    if (promptNodes.length > 4) {
        mainPanel.style.opacity = 1;
    } else {
        mainPanel.style.opacity = 0;
    }
}

function initObserver() {
    // Déconnecte l"observer précédent s"il existe
    if (observer) {
        observer.disconnect();
    }

    const chatContainer = document.querySelector("#thread .flex.flex-col.text-sm.pb-25");
    if (!chatContainer) return;

    observer = new MutationObserver(updatePromptReferencesList);
    observer.observe(chatContainer, { childList: true, subtree: true });
}

function checkForUrlChange() {
    if (window.location.href !== currentUrl) {
        currentUrl = window.location.href;

        if (window.location.href !== "https://chatgpt.com/") {
            devLog(`url changed. Current : ${window.location.href}`)
            waitForThread(() => {
                initObserver();
                updatePromptReferencesList();
            })
        }
    }
}

function init() {
    createPanel();
    updatePromptReferencesList();
    initObserver();

    checkInterval = setInterval(checkForUrlChange, 5000);
}

function waitForThread(callback, maxAttempts = 10) {
    let attempts = 0;
    const check = () => {
        if (document.querySelector("#thread .flex.flex-col.text-sm.pb-25")) {
            devLog("Chat element found")
            callback();
        } else if (attempts < maxAttempts) {
            devLog(`Looking for chat element (attempt ${attempts})...`)
            attempts++;
            setTimeout(check, 1000); // Retry every 500ms
        } else {
            console.log(`CHP_ext : Chat element not found after ${maxAttempts} seconds\nChat element selector : #thread .flex.flex-col.text-sm.pb-25`);
        }
    };
    check();
}



// --- Main ---

const loggingMode = "prod"; // dev or prod
const verboseLogging = true;

let observer;
let checkInterval; // Pour le polling
let currentUrl = window.location.href;

if (window.location.href === "https://chatgpt.com/") {
    devLog("CPH : window.location.href === https://chatgpt.com/")
    init()
} else {
    devLog("CPH : window.location.href !== https://chatgpt.com/")
    waitForThread(init);
}