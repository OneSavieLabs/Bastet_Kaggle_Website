// 語言切換
let currentLang = 'en';

function switchLanguage() {
    currentLang = currentLang === 'zh' ? 'en' : 'zh';
    const elements = document.querySelectorAll('[data-zh][data-en]');
    
    elements.forEach(element => {
        const text = currentLang === 'zh' ? element.getAttribute('data-zh') : element.getAttribute('data-en');
        if (element.tagName === 'P' && element.id === 'countdown') {
            // 特殊處理倒數計時器
            return;
        }
        element.innerHTML = text;
    });
    
    // 更新按鈕文字
    document.getElementById('langToggle').textContent = currentLang === 'zh' ? 'EN' : '中';
    
    // 更新倒數計時器
    updateCountdown();
}

// 倒數計時器
function updateCountdown() {
    // 設定目標時間：2026/07/01 00:00:00 UTC+8
    const targetDate = new Date('2026-07-01T00:00:00+08:00');
    const now = new Date();
    const difference = targetDate - now;

    if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        
        // 補零顯示
        document.getElementById('days').textContent = String(days).padStart(2, '0');
        document.getElementById('hours').textContent = String(hours).padStart(2, '0');
        document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
        document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
    } else {
        const finishedText = currentLang === 'zh' ? '比賽已經開始！' : 'Competition Started!';
        document.getElementById('countdown').innerHTML = finishedText;
    }
}

// 初始化頁面為英文
window.addEventListener('DOMContentLoaded', () => {
    const elements = document.querySelectorAll('[data-zh][data-en]');
    elements.forEach(element => {
        const text = element.getAttribute('data-en');
        if (element.tagName === 'P' && element.id === 'countdown') {
            return;
        }
        element.innerHTML = text;
    });
    document.getElementById('langToggle').textContent = '中';
});

// 初始執行
updateCountdown();
// 每秒更新一次
setInterval(updateCountdown, 1000);

// 語言切換按鈕事件
document.getElementById('langToggle').addEventListener('click', switchLanguage);

// 平滑滾動
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// 滾動時導航欄效果
window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    if (window.scrollY > 100) {
        header.style.background = 'rgba(0, 0, 0, 0.95)';
    } else {
        header.style.background = '#000';
    }
});

// 貓咪腳印滾動動畫
function handlePawPrints() {
    const pawPrints = document.querySelectorAll('.cat-paw-print');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                // 每個腳印出現時有不同的延遲，模擬貓咪走路
                const pawNumber = entry.target.classList.contains('paw-1') ? 1 :
                                 entry.target.classList.contains('paw-2') ? 2 : 3;
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, pawNumber * 400);
            } else {
                // 離開視野時移除 visible class，滾回來可以再次觸發
                entry.target.classList.remove('visible');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '-50px'
    });
    
    pawPrints.forEach(paw => observer.observe(paw));
}

// 頁面載入完成後初始化腳印動畫
window.addEventListener('DOMContentLoaded', handlePawPrints);

// ========================================
// 浮动通知订阅框功能
// ========================================
// Google 表单配置
const GOOGLE_FORM_CONFIG = {
    url: 'https://docs.google.com/forms/d/e/1FAIpQLSf2sDcHE_le1BbWMnOXNHPvcw-X6ehZU-bW5vdkeXozR8I0VA/formResponse',
    emailEntryId: 'entry.1600260525'
};

// 初始化订阅框
window.addEventListener('DOMContentLoaded', () => {
    const notifyTrigger = document.getElementById('notifyTrigger');
    const notifyModal = document.getElementById('notifyModal');
    const closeNotify = document.getElementById('closeNotify');
    const notifyForm = document.getElementById('notifyForm');
    const emailInput = document.getElementById('emailInput');
    
    // 時間檢測：記錄表單打開時間
    let formOpenTime = null;
    
    // 打开订阅框
    notifyTrigger.addEventListener('click', () => {
        notifyModal.classList.add('active');
        formOpenTime = Date.now(); // 記錄打開時間
    });
    
    // 关闭订阅框
    closeNotify.addEventListener('click', () => {
        notifyModal.classList.remove('active');
        formOpenTime = null; // 重置時間
    });
    
    // 点击背景关闭
    notifyModal.addEventListener('click', (e) => {
        if (e.target === notifyModal) {
            notifyModal.classList.remove('active');
            formOpenTime = null; // 重置時間
        }
    });
    
    // 表單提交處理
    notifyForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // 時間檢測：檢查是否太快提交（至少1秒，防止機器人但不影響複製貼上）
        const timeSpent = Date.now() - formOpenTime;
        if (timeSpent < 1000) {
            const warningMsg = currentLang === 'zh' ? 
                '請花點時間閱讀後再提交 🐱' : 
                'Please take a moment to read before submitting 🐱';
            alert(warningMsg);
            return;
        }
        
        const email = emailInput.value;
        const submitButton = notifyForm.querySelector('.notify-submit');
        const originalText = submitButton.textContent;
        
        // 顯示加載
        submitButton.textContent = currentLang === 'zh' ? '提交中...' : 'Submitting...';
        submitButton.disabled = true;
        
        try {
            // 準備資料
            const formData = new FormData();
            formData.append(GOOGLE_FORM_CONFIG.emailEntryId, email);
            
            // 提交表单
            await fetch(GOOGLE_FORM_CONFIG.url, {
                method: 'POST',
                body: formData,
                mode: 'no-cors'
            });
            
            // 顯示成功
            const modalContent = document.querySelector('.notify-modal-content');
            const successMessage = currentLang === 'zh' ? 
                '<div class="notify-success"><h3>訂閱成功！</h3><p>我們會在比賽開始時通知您 😺</p></div>' :
                '<div class="notify-success"><h3>Successfully Subscribed!</h3><p>We\'ll notify you when the competition begins 😺</p></div>';
            
            modalContent.innerHTML = successMessage;
            
            // 3秒後關閉重置
            setTimeout(() => {
                notifyModal.classList.remove('active');
                location.reload();
            }, 3000);
            
        } catch (error) {
            console.error('Error:', error);
            const errorMsg = currentLang === 'zh' ? '提交失败，请稍后再试' : 'Submission failed, please try again';
            alert(errorMsg);
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        }
    });
});
