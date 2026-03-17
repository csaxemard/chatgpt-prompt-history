function load() {
    chrome.storage.sync.get(
        { isEnabled: true, minPrompts: 5, loggingMode: 'normal' },
        (data) => {
            isEnabled.forEach(radio => {
                radio.checked = String(radio.value) === String(data.isEnabled);
            });
            minPrompts.value = data.minPrompts;
            loggingMode.value = data.loggingMode;
        }
    );
}

function save() {
    const isEnabledValue = document.querySelector('input[name="isEnabled"]:checked').value === 'true';
    chrome.storage.sync.set({
        isEnabled: isEnabledValue,
        minPrompts: Number(minPrompts.value),
        loggingMode: loggingMode.value
    });
}



// --- Main ---

const isEnabled = document.querySelectorAll('input[name="isEnabled"]');
const minPrompts = document.querySelector('#minPrompts');
const loggingMode = document.querySelector('#loggingMode');

// Save on change
isEnabled.forEach(radio => { radio.addEventListener('change', save) });
minPrompts.addEventListener('change', save);
loggingMode.addEventListener('change', save);

load();

