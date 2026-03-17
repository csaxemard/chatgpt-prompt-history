function logVerbose(message) {
    if (options.loggingMode === "verbose") {
        console.log(message);
    }
}

function loadOptions(callback) {
    chrome.storage.sync.get(
        { isEnabled: true, minPrompts: 5, loggingMode: "normal" },
        callback
    );
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
    logVerbose("CPH_ext : mutating")
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

    // Cache main selon nb prompts
    if (promptNodes.length >= options.minPrompts) {
        mainPanel.style.display = "initial";
        mainPanel.style.opacity = 1;
    } else {
        mainPanel.style.opacity = 0;
        setTimeout(() => mainPanel.style.display = "none", 400);
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
            logVerbose(`CPH_ext : url changed. Current : ${window.location.href}`)
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
    updateInterval = setInterval(() => { logVerbose("CPH_ext : Manual update every 10s"); updatePromptReferencesList() }, 10000);
}

function waitForThread(callback, maxAttempts = 10) {
    let attempts = 0;
    const check = () => {
        if (document.querySelector("#thread .flex.flex-col.text-sm.pb-25")) {
            logVerbose("CPH_ext : Chat element found")
            callback();
        } else if (attempts < maxAttempts) {
            logVerbose(`CPH_ext : Looking for chat element (attempt ${attempts})...`)
            attempts++;
            setTimeout(check, 1000); // Retry every seconds
        } else {
            console.log(`CHP_ext : Chat element not found after ${maxAttempts} seconds\nChat element selector : #thread .flex.flex-col.text-sm.pb-25`);
        }
    };
    check();
}



// --- Main ---

let observer;
let checkInterval;
let updateInterval;
let options;
let currentUrl = window.location.href;

loadOptions((data) => {
    options = data;
    console.log("CPH_ext : Options loaded :", options)

    if (options.isEnabled) {
        if (window.location.href === "https://chatgpt.com/") {
            logVerbose("CPH_ext : Starting at Home url")
            init()
        } else {
            logVerbose("CPH_ext : Starting at conversation url")
            waitForThread(init);
        }
    }
});
