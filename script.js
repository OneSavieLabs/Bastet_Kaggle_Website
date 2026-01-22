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
    // 設定目標時間：2026/04/01 00:00:00 UTC+8
    const targetDate = new Date('2026-04-01T00:00:00+08:00');
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
