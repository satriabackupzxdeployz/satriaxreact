window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    setTimeout(() => {
        preloader.style.opacity = '0';
        setTimeout(() => {
            preloader.style.visibility = 'hidden';
            document.body.style.overflow = 'auto';
        }, 600);
    }, 1200);
});

function formatEmojis(emojiInput) {
    if (!emojiInput || emojiInput.trim() === '') return '';
    
    let emojis = emojiInput.trim();
    emojis = emojis.replace(/\s+/g, '');
    
    const emojiRegex = /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu;
    const emojiMatches = emojis.match(emojiRegex);
    
    if (!emojiMatches) return '';
    
    if (emojiMatches.length === 1) {
        return emojiMatches[0];
    } else {
        const cleanEmojis = emojiMatches.join(',').replace(/,+/g, ',');
        return cleanEmojis;
    }
}

function validateAndFormatEmojis(emojiInput) {
    const formatted = formatEmojis(emojiInput);
    const emojiHint = document.getElementById('emojiHint');
    
    if (!emojiInput || emojiInput.trim() === '') {
        emojiHint.textContent = 'Masukkan minimal satu emoji';
        emojiHint.style.color = '#ff4b2b';
        return { valid: false, formatted: '' };
    }
    
    const emojiRegex = /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu;
    const hasEmoji = emojiRegex.test(emojiInput);
    
    if (!hasEmoji) {
        emojiHint.textContent = 'Input harus mengandung emoji yang valid';
        emojiHint.style.color = '#ff4b2b';
        return { valid: false, formatted: '' };
    }
    
    emojiHint.textContent = 'Format emoji valid. Sistem siap mengirim.';
    emojiHint.style.color = '#2ecc71';
    
    return { valid: true, formatted: formatted };
}

async function reactToWhatsAppPost(postUrl, emojis, count) {
    const emojiValidation = validateAndFormatEmojis(emojis);
    if (!emojiValidation.valid) {
        return { success: false, error: "Format emoji tidak valid" };
    }
    
    const formattedEmojis = emojiValidation.formatted;
    
    try {
        const response = await fetch('/api', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                url: postUrl,
                emojis: formattedEmojis,
                count: parseInt(count) || 1000
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            return { success: true, data };
        } else {
            return { success: false, error: data.error || 'Unknown error' };
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function handleReaction() {
    const urlInput = document.getElementById('postUrl');
    const emojiInput = document.getElementById('emojis');
    const countInput = document.getElementById('reactionCount');
    const resultDiv = document.getElementById('result');
    const btn = document.getElementById('btnReact');
    const btnText = btn.querySelector('.btn-text');
    const btnLoader = btn.querySelector('.loader-container');
    const statusText = btn.querySelector('.loading-status');

    const url = urlInput.value.trim();
    let emojis = emojiInput.value.trim();
    const count = countInput ? countInput.value.trim() : 1000;

    if (!url) {
        showMsg("❌ ERROR: Harap masukkan URL channel WhatsApp", false);
        urlInput.focus();
        return;
    }

    if (!emojis) {
        showMsg("❌ ERROR: Harap masukkan minimal satu emoji", false);
        emojiInput.focus();
        return;
    }

    const emojiValidation = validateAndFormatEmojis(emojis);
    if (!emojiValidation.valid) {
        showMsg("❌ ERROR: Format emoji tidak valid. Pastikan memasukkan emoji yang benar", false);
        emojiInput.focus();
        return;
    }

    emojiInput.value = emojiValidation.formatted;
    emojis = emojiValidation.formatted;

    btn.disabled = true;
    btnText.classList.add('hidden');
    btnLoader.classList.remove('hidden');
    resultDiv.classList.add('hidden');
    
    statusText.innerText = `MENGIRIM ${count} REACT...`;

    const res = await reactToWhatsAppPost(url, emojis, count);

    btn.disabled = false;
    btnText.classList.remove('hidden');
    btnLoader.classList.add('hidden');

    if (res.success) {
        showMsg(`✅ BERHASIL!\n\n${res.data.message || 'Reaction berhasil dikirim'}\nTarget: ${url.substring(0, 30)}...`, true);
    } else {
        showMsg(`❌ GAGAL: ${res.error}\n\nCoba periksa:\n1. Format URL sudah benar\n2. Koneksi internet stabil\n3. Channel masih aktif`, false);
    }
}

function showMsg(msg, isSuccess) {
    const resultDiv = document.getElementById('result');
    resultDiv.classList.remove('hidden', 'success', 'error');
    resultDiv.classList.add(isSuccess ? 'success' : 'error');
    resultDiv.innerText = msg;
}

document.addEventListener('DOMContentLoaded', function() {
    const btnReact = document.getElementById('btnReact');
    const emojiInput = document.getElementById('emojis');
    const urlInput = document.getElementById('postUrl');
    const countInput = document.getElementById('reactionCount');
    const emojiHint = document.getElementById('emojiHint');
    
    btnReact.addEventListener('click', handleReaction);
    
    emojiInput.addEventListener('input', function() {
        const value = this.value.trim();
        if (value) {
            const validation = validateAndFormatEmojis(value);
            if (!validation.valid) {
                emojiHint.style.color = '#ff4b2b';
            } else {
                emojiHint.textContent = 'Format emoji valid. Sistem siap mengirim.';
                emojiHint.style.color = '#2ecc71';
            }
        } else {
            emojiHint.textContent = 'Sistem akan otomatis menambahkan koma jika diperlukan';
            emojiHint.style.color = '#ffcc00';
        }
    });
    
    urlInput.addEventListener('input', function() {
        const value = this.value.trim();
    });
    
    emojiInput.addEventListener('focus', function() {
        this.setAttribute('placeholder', '');
    });
    
    urlInput.addEventListener('focus', function() {
        this.setAttribute('placeholder', '');
    });
    
    if (countInput) {
        countInput.addEventListener('focus', function() {
            this.setAttribute('placeholder', '');
        });
    }
    
    emojiInput.value = '';
    urlInput.value = '';
    if (countInput) countInput.value = '1000';
});