const Cookie = {
    set: (name, value, days = 7, path = '/') => {
        const d = new Date();
        d.setTime(d.getTime() + days*24*60*60*1000);
        document.cookie = `${name}=${value}; expires=${d.toUTCString()}; path=${path}`;
    },
    get: (name) => {
        const raw = Cookie.getRaw(name);

        if (!raw) return null; 
        if (raw === 'true') return true;
        if (raw === 'false') return false;
        if (!isNaN(raw)) {
        return raw.includes('.') ? parseFloat(raw) : parseInt(raw, 10);
        }
        return raw;
    },
    getRaw: (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length !== 2) return null;
        return parts.pop().split(';').shift();
    },
    remove: (name, path = '/') => {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}`;
    }
};

// Dialog 管理器
const DialogManager = {
    el: document.getElementById('app-dialog'),
    titleEl: document.getElementById('dialog-title'),
    msgEl: document.getElementById('dialog-message'),
    iconArea: document.getElementById('dialog-icon-area'),
    btn: document.getElementById('dialog-btn'),
    isClosing: false, // 防止重复触发关闭

    init() {
        if(!this.el) return;
        
        // 按钮点击关闭
        this.btn.addEventListener('click', () => this.close());
        
        // 点击遮罩层关闭
        this.el.addEventListener('click', (e) => {
            const rect = this.el.getBoundingClientRect();
            // 只有当点击发生在 rect 外部时才关闭
            if (e.clientX < rect.left || e.clientX > rect.right || 
                e.clientY < rect.top || e.clientY > rect.bottom) {
                this.close();
            }
        });

        // 监听动画结束事件，用于清理类名和真正关闭 dialog
        this.el.addEventListener('animationend', (e) => {
            // 只有当是退场动画结束时，才执行关闭逻辑
            if (this.el.classList.contains('closing')) {
                this.el.close();
                this.el.classList.remove('closing');
                this.isClosing = false;
            }
        });
    },

    open(type, title, message) {
        if(!this.el) return;
        // 如果正在关闭中，强制重置状态
        if (this.isClosing) {
            this.el.classList.remove('closing');
            this.isClosing = false;
        }

        this.titleEl.innerText = title;
        this.msgEl.innerHTML = message;
        
        this.iconArea.className = 'dialog-icon-container';
        let iconHtml = '';
        
        if (type === 'timezone') {
            iconHtml = '<i class="fas fa-globe-asia"></i>';
            this.iconArea.classList.add('icon-warn');
            this.btn.innerText = "OK";
        } else if (type === 'celebrate') {
            iconHtml = '<i class="fas fa-glass-cheers"></i>';
            this.iconArea.classList.add('icon-celebrate');
            this.btn.innerText = "Happy New Year!";
        }
        
        this.iconArea.innerHTML = iconHtml;
        this.el.showModal();
    },

    close() {
        if (this.isClosing || !this.el.open) return;
        
        this.isClosing = true;
        // 添加 class 触发 CSS 中的 dialog-hide 和 backdrop-hide 动画
        this.el.classList.add('closing');
        
        // 动画结束后，上面的 animationend 监听器会负责调用 el.close()
    }
};

DialogManager.init();

/* ================== 1. 时区检测逻辑 ================== */
function checkTimezone() {
    // 获取本地时间与UTC的分钟差 (中国是 UTC+8，即 -480 分钟)
    const offset = new Date().getTimezoneOffset();
    const targetOffset = -480; 
    const isShown = Cookie.get('timezoneDialogShown');

    // 如果偏差超过 1 分钟（考虑到部分浏览器的微小差异）
    if (!isShown && Math.abs(offset - targetOffset) > 1) {
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        // 使用 setTimeout 稍微延迟弹出，避免页面刚加载就闪现，体验更好
        setTimeout(() => {
            DialogManager.open(
                'timezone',
                'Timezone Difference Detected',
                `Your current system time zone <b>(<span style="color:#ffbc00">${timeZone}</span>)</b> does not appear to be China Standard Time (UTC+8).<br>The page countdown will be synchronized according to <b>Beijing time.</b><br>This message will not be displayed again.`,
            );
            Cookie.set('timezoneDialogShown', true)
        }, 500+Math.random()*500);
    }
}

// 页面加载后立即检测
checkTimezone();

/* ================== 2. 模拟倒计时结束逻辑 ================== */
// 请将此函数放入你原有的倒计时 update 循环中
// 当 totalSeconds <= 0 时调用
let hasCelebrated = false; // 防止重复弹窗

function triggerNewYear() {
    if (hasCelebrated) return;
    hasCelebrated = true;

    // TODO: 礼花音效或动画
    
    DialogManager.open(
        'celebrate',
        '2026 已至！',
        '钟声敲响，旧岁已过。<br>愿你在新的一年里，代码无 Bug，人生无 Error！<br><b>新年快乐！</b>'
    );
}

  