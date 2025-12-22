// Dialog 管理器
const DialogManager = {
    el: document.getElementById('app-dialog'),
    titleEl: document.getElementById('dialog-title'),
    msgEl: document.getElementById('dialog-message'),
    iconArea: document.getElementById('dialog-icon-area'),
    btn: document.getElementById('dialog-btn'),
    backdropEl: null,
    isClosing: false, // 防止重复触发关闭

    init() {
        if(!this.el) return;
        
        // 动态创建遮罩层并插入到body
        this.backdropEl = document.createElement('div');
        this.backdropEl.className = 'dialog-backdrop';
        document.body.appendChild(this.backdropEl);

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
                // 隐藏遮罩
                this.backdropEl.classList.remove('active');
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
            // 触发烟花动画
            this.triggerFireworks();
        }
        
        this.iconArea.innerHTML = iconHtml;
        this.el.show();
        // 手动激活遮罩
        this.backdropEl.classList.add('active');
    },

    close() {
        if (this.isClosing || !this.el.open) return;
        
        this.isClosing = true;
        // 添加 class 触发 CSS 中的 dialog-hide 和 backdrop-hide 动画
        this.el.classList.add('closing');
        
        // 动画结束后，上面的 animationend 监听器会负责调用 el.close()
        this.backdropEl.classList.remove('active');
    },

    triggerFireworks() {
        const duration = 15 * 1000;
        const animationEnd = Date.now() + duration;
        const colors = ['#ff0000', '#ffd700', '#ff4500', '#ff8c00', '#ee2c2c'];

        const interval = setInterval(function() {
            const timeLeft = animationEnd - Date.now();
            if (timeLeft <= 0) return clearInterval(interval);

            const particleCount = 100 * (timeLeft / duration);
            
            // 核心修改：设置 zIndex 必须大于 CSS 中 dialog 的 999
            // 大多数 confetti 库默认是 100，所以这里必须显式指定
            const fireworkOptions = {
                particleCount: particleCount,
                startVelocity: 35,
                spread: 360,
                ticks: 80,
                origin: { x: Math.random(), y: Math.random() * 0.5 },
                colors: colors,
                shapes: ['star', 'circle'],
                gravity: 0.8,
                scalar: 0.7,
                drift: 0,
                zIndex: 2000 // <--- 关键！必须大于 dialog 的 z-index (999)
            };

            confetti({ ...fireworkOptions });
            confetti({ 
                ...fireworkOptions, 
                particleCount: particleCount / 2, 
                scalar: 1.2, 
                shapes: ['circle'] 
            });

        }, 300);
    }
};

DialogManager.init();

/* ================== 1. 时区检测逻辑 ================== */
function checkTimezone() {
    // 获取本地时间与UTC的分钟差 (中国是 UTC+8，即 -480 分钟)
    const offset = new Date().getTimezoneOffset();
    const targetOffset = -480; 
    const storedTz = Cookie.get('userTimezone');

    // 初始化选择框状态
    const tzSelect = document.getElementById('timezone-select');
    if (tzSelect && storedTz) {
        tzSelect.value = storedTz;
    }

    const isShown = Cookie.get('timezoneDialogShown');
    // 如果偏差超过 1 分钟（考虑到部分浏览器的微小差异）
    if (!isShown && Math.abs(offset - targetOffset) > 1) {
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        // 使用 setTimeout 稍微延迟弹出，避免页面刚加载就闪现，体验更好
        setTimeout(() => {
            DialogManager.open(
                'timezone',
                I18N.dialog.timezone.title,
                t(I18N.dialog.timezone.content, { tz: timeZone }),
            );
            Cookie.set('timezoneDialogShown', true)
        }, 500+Math.random()*500);
    }
}

/* ================== 2. 模拟倒计时结束逻辑 ================== */
// 请将此函数放入你原有的倒计时 update 循环中
// 当 totalSeconds <= 0 时调用
let hasCelebrated = false; // 防止重复弹窗

function triggerNewYear() {
    if (hasCelebrated) return;
    hasCelebrated = true;
    
    DialogManager.open(
        'celebrate',
        I18N.dialog.celebrate.title,
        I18N.dialog.celebrate.content
    );
}

  