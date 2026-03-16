function createPanel() {
    if (document.getElementById('CPH_ext-main')) return;

    const panel = document.createElement('div');
    panel.id = 'CPH_ext-main';

    const list = document.createElement('div');
    list.id = 'CPH_ext-promptReferencesList';
    panel.appendChild(list);

    document.body.appendChild(panel);
}

function updatePromptReferencesList() {
    console.log("mutating")
    const mainPanel = document.getElementById('CPH_ext-main');
    const list = document.getElementById('CPH_ext-promptReferencesList');
    if (!list) return;

    list.innerHTML = '';

    const promptNodes = document.querySelectorAll('[data-message-author-role="user"]');    // Selector pour tous les prompts
    promptNodes.forEach((node, index) => {
        const reference = document.createElement('div');
        reference.className = 'CPH_ext-promptReference';
        reference.textContent = node.innerText.slice(0, 100); // aperçu du prompt

        // Scroll vers le prompt au clic
        reference.addEventListener('click', () => {
            node.scrollIntoView({behavior: 'smooth'});
        });

        list.appendChild(reference);
    });
    mainPanel.dataset.promptsNumber = promptNodes.length;

    // Cache main si moins de 4 prompts
    if (promptNodes.length > 4) {
        mainPanel.style.opacity = 1;
    } else {
        mainPanel.style.opacity = 0;
    }
}

function initObserver() {
    // Déconnecte l'observer précédent s'il existe
    if (observer) {
        observer.disconnect();
    }

    const chatContainer = document.querySelector('#thread');
    if (!chatContainer) return;

    observer = new MutationObserver(updatePromptReferencesList);
    observer.observe(chatContainer, {childList: true, subtree: true});
}

function checkForUrlChange() {
    if (window.location.href !== currentUrl) {
        currentUrl = window.location.href;
        initObserver();
        updatePromptReferencesList();
    }
}

function init() {
    createPanel();
    updatePromptReferencesList();
    initObserver();

    // Polling toutes les 5 secondes pour vérifier le changement d'URL
    checkInterval = setInterval(checkForUrlChange, 5000);
}



let observer; // Variable globale pour l'observer
let checkInterval; // Pour le polling
let currentUrl = window.location.href; // URL actuelle

setTimeout(init, 2000);   // Delay pour attendre le chargement complet du DOM