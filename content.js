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
    const chatContainer = document.querySelector('#thread .flex.flex-col.text-sm.pb-25');
    if (!chatContainer) return;

    const observer = new MutationObserver(updatePromptReferencesList);
    observer.observe(chatContainer, {childList: true, subtree: true});
}

function init() {
    createPanel();
    updatePromptReferencesList();
    initObserver();
}

// Delay pour attendre le chargement complet du DOM
setTimeout(init, 2000);