// AI周报生成器浏览器扩展 - 主逻辑（多语言版本）

document.addEventListener('DOMContentLoaded', function() {
    // 元素引用
    const completedWorkTextarea = document.getElementById('completed-work');
    const problemsTextarea = document.getElementById('problems');
    const plansTextarea = document.getElementById('plans');
    const styleSelect = document.getElementById('style-select');
    const styleDescription = document.getElementById('style-description');
    const generateBtn = document.getElementById('generate-btn');
    const demoBtn = document.getElementById('demo-btn');
    const clearBtn = document.getElementById('clear-btn');
    const loadingSection = document.getElementById('loading-section');
    const resultSection = document.getElementById('result-section');
    const reportContent = document.getElementById('report-content');
    const reportStyle = document.getElementById('report-style');
    const copyBtn = document.getElementById('copy-btn');
    const downloadBtn = document.getElementById('download-btn');
    const regenerateBtn = document.getElementById('regenerate-btn');
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notification-text');
    const historyStatusIcon = document.getElementById('history-status-icon');
    const historyStatusText = document.getElementById('history-status-text');
    const openWebBtn = document.getElementById('open-web');
    const settingsBtn = document.getElementById('settings');
    const helpBtn = document.getElementById('help');
    
    // 语言切换元素
    const langZhBtn = document.getElementById('lang-zh');
    const langEnBtn = document.getElementById('lang-en');
    
    // 文本元素引用
    const appTitle = document.getElementById('app-title');
    const appSubtitle = document.getElementById('app-subtitle');
    const completedWorkLabel = document.getElementById('completed-work-label');
    const completedWorkHint = document.getElementById('completed-work-hint');
    const problemsLabel = document.getElementById('problems-label');
    const plansLabel = document.getElementById('plans-label');
    const styleLabel = document.getElementById('style-label');
    const generateBtnText = document.getElementById('generate-btn-text');
    const demoBtnText = document.getElementById('demo-btn-text');
    const clearBtnText = document.getElementById('clear-btn-text');
    const loadingText = document.getElementById('loading-text');
    const resultTitle = document.getElementById('result-title');
    const copyBtnText = document.getElementById('copy-btn-text');
    const downloadBtnText = document.getElementById('download-btn-text');
    const regenerateBtnText = document.getElementById('regenerate-btn-text');
    const localStatusText = document.getElementById('local-status-text');

    // 当前语言和翻译数据
    let currentLanguage = 'zh-CN';
    let translations = {};
    let styleDescriptions = {};

    // 存储当前生成的报告数据
    let currentReport = {
        content: '',
        style: '',
        timestamp: ''
    };

    // 初始化 - 确保DOM完全加载
    setTimeout(init, 100);

    function init() {
        // 加载语言文件
        loadLanguage('zh-CN');
        
        // 事件监听器
        styleSelect.addEventListener('change', updateStyleDescription);
        generateBtn.addEventListener('click', generateReport);
        demoBtn.addEventListener('click', showDemo);
        clearBtn.addEventListener('click', clearForm);
        copyBtn.addEventListener('click', copyReport);
        downloadBtn.addEventListener('click', downloadReport);
        regenerateBtn.addEventListener('click', regenerateReport);
        openWebBtn.addEventListener('click', openWebVersion);
        settingsBtn.addEventListener('click', showSettings);
        helpBtn.addEventListener('click', showHelp);
        
        // 语言切换事件
        langZhBtn.addEventListener('click', () => switchLanguage('zh-CN'));
        langEnBtn.addEventListener('click', () => switchLanguage('en-US'));
        
        // 自动调整文本区域高度
        setupTextareaAutoResize();
        
        // 键盘快捷键
        setupKeyboardShortcuts();
        
        // 确保容器正确渲染
        ensureContainerRendering();
        
        // 更新历史记录计数
        updateHistoryCount();
        
        // 初始化AI状态显示
        setTimeout(() => {
            if (window.aiService) {
                updateAIStatus();
            }
        }, 500);
    }

    // 语言相关函数
    async function loadLanguage(langCode) {
        try {
            const response = await fetch(`locales/${langCode}.json`);
            translations = await response.json();
            currentLanguage = langCode;
            
            // 更新界面文本
            updateUIText();
            
            // 更新风格描述映射
            updateStyleDescriptions();
            
            // 更新语言按钮状态
            updateLanguageButtons();
            
            // 更新演示数据占位符
            updatePlaceholders();
            
            // 保存语言偏好
            saveLanguagePreference(langCode);
        } catch (error) {
            console.error(`Failed to load language ${langCode}:`, error);
        }
    }
    
    function switchLanguage(langCode) {
        if (langCode !== currentLanguage) {
            loadLanguage(langCode);
        }
    }
    
    function updateUIText() {
        // 应用标题和副标题
        appTitle.textContent = translations.app.title;
        appSubtitle.textContent = translations.app.subtitle;
        document.title = translations.app.title;
        
        // 输入标签和提示
        completedWorkLabel.textContent = translations.inputs.completedWork.label;
        completedWorkHint.textContent = translations.inputs.completedWork.hint;
        problemsLabel.textContent = translations.inputs.problems.label;
        plansLabel.textContent = translations.inputs.plans.label;
        styleLabel.textContent = translations.inputs.style.label;
        
        // 按钮文本
        generateBtnText.textContent = translations.buttons.generate;
        demoBtnText.textContent = translations.buttons.demo;
        clearBtnText.textContent = translations.buttons.clear;
        copyBtnText.textContent = translations.buttons.copy;
        downloadBtnText.textContent = translations.buttons.download;
        regenerateBtnText.textContent = translations.buttons.regenerate;
        
        // 其他文本
        loadingText.textContent = translations.loading.text;
        resultTitle.textContent = translations.results.title;
        localStatusText.textContent = translations.status.local;
        
        // 更新选择框选项
        updateSelectOptions();
        
        // 更新风格描述
        updateStyleDescription();
    }
    
    function updateSelectOptions() {
        const options = translations.inputs.style.options;
        styleSelect.innerHTML = '';
        
        for (const [key, value] of Object.entries(options)) {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = value;
            styleSelect.appendChild(option);
        }
        
        // 恢复之前的选择
        if (currentReport.style) {
            styleSelect.value = currentReport.style;
        }
    }
    
    function updateStyleDescriptions() {
        styleDescriptions = translations.inputs.style.descriptions;
    }
    
    function updateStyleDescription() {
        const selectedStyle = styleSelect.value;
        styleDescription.textContent = styleDescriptions[selectedStyle] || '';
    }
    
    function updatePlaceholders() {
        completedWorkTextarea.placeholder = translations.inputs.completedWork.placeholder;
        problemsTextarea.placeholder = translations.inputs.problems.placeholder;
        plansTextarea.placeholder = translations.inputs.plans.placeholder;
    }
    
    function updateLanguageButtons() {
        // 移除所有active类
        langZhBtn.classList.remove('active');
        langEnBtn.classList.remove('active');
        
        // 添加当前语言的active类
        if (currentLanguage === 'zh-CN') {
            langZhBtn.classList.add('active');
        } else if (currentLanguage === 'en-US') {
            langEnBtn.classList.add('active');
        }
    }
    
    function saveLanguagePreference(langCode) {
        chrome.storage.local.set({ preferredLanguage: langCode }, function() {
            console.log(`Language preference saved: ${langCode}`);
        });
    }
    
    function loadLanguagePreference() {
        chrome.storage.local.get(['preferredLanguage'], function(result) {
            const preferredLang = result.preferredLanguage || 'zh-CN';
            if (preferredLang !== currentLanguage) {
                loadLanguage(preferredLang);
            }
        });
    }

    function parseTextarea(textarea) {
        const text = textarea.value.trim();
        if (!text) return [];
        
        return text.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .map(line => line.replace(/^-\s*/, '')); // 移除开头的"- "
    }

    function updateHistoryCount() {
        chrome.storage.local.get(['reportHistory'], function(result) {
            const history = result.reportHistory || [];
            const countText = translations.status.historyFormat.replace('{count}', history.length);
            historyStatusText.textContent = countText;
        });
    }

    function saveToHistory(report) {
        chrome.storage.local.get(['reportHistory'], function(result) {
            const history = result.reportHistory || [];
            history.unshift({
                content: report.content,
                style: report.style,
                timestamp: new Date().toISOString()
            });
            
            // 只保留最近50条记录
            if (history.length > 50) {
                history.pop();
            }
            
            chrome.storage.local.set({ reportHistory: history }, function() {
                updateHistoryCount();
            });
        });
    }

    function generateReport() {
        const completed = parseTextarea(completedWorkTextarea);
        const problems = parseTextarea(problemsTextarea);
        const plans = parseTextarea(plansTextarea);
        const style = styleSelect.value;

        // 验证输入
        if (completed.length === 0) {
            showNotification(translations.notifications.validation, 'warning');
            completedWorkTextarea.focus();
            return;
        }

        // 显示加载状态
        showLoading();

        // 使用AI服务生成周报
        setTimeout(async () => {
            try {
                let result;
                
                // 检查是否启用了AI模式
                if (window.aiService && aiService.getMode() === 'ai') {
                    // 使用AI服务生成
                    result = await aiService.generateWeeklyReport(completed, problems, plans, style, currentLanguage);
                    showNotification(translations.notifications.aiGenerateSuccess, 'success');
                } else {
                    // 使用本地模板生成
                    const localResult = generateWeeklyReport(completed, problems, plans, style, currentLanguage);
                    result = {
                        content: localResult.content,
                        style: localResult.style,
                        timestamp: localResult.generated_at,
                        mode: 'local'
                    };
                    showNotification(translations.notifications.generateSuccess, 'success');
                }
                
                // 保存报告数据
                currentReport = {
                    content: result.content,
                    style: result.style || result.mode,
                    timestamp: result.generated_at || result.timestamp,
                    mode: result.mode || 'local'
                };
                
                // 保存到历史记录
                saveToHistory(currentReport);
                
                // 显示结果
                displayReport(currentReport.content, currentReport.style);
            } catch (error) {
                const errorMsg = translations.notifications.generateFailed.replace('{error}', error.message);
                showNotification(errorMsg, 'error');
                hideLoading();
            }
        }, 800); // 模拟AI思考时间
    }

    function showLoading() {
        // 隐藏输入区域
        document.querySelector('.input-section').style.display = 'none';
        document.querySelector('.status-section').style.display = 'none';
        if (resultSection.style.display === 'block') {
            resultSection.style.display = 'none';
        }
        
        // 显示加载区域
        loadingSection.style.display = 'block';
        
        // 强制浏览器重新计算布局
        setTimeout(() => {
            document.body.style.height = document.body.scrollHeight + 'px';
        }, 10);
    }

    function hideLoading() {
        // 显示输入区域和状态区域
        document.querySelector('.input-section').style.display = 'block';
        document.querySelector('.status-section').style.display = 'flex';
        
        // 隐藏加载区域
        loadingSection.style.display = 'none';
        
        // 恢复body高度
        document.body.style.height = '';
        
        // 强制浏览器重新计算布局
        setTimeout(() => {
            document.body.style.height = document.body.scrollHeight + 'px';
        }, 10);
    }

    function displayReport(report, style) {
        // 隐藏加载区域
        hideLoading();
        
        // 更新报告内容
        reportContent.textContent = report;
        const styleText = translations.results.styleFormat.replace('{style}', style);
        reportStyle.textContent = styleText;
        
        // 显示结果区域
        resultSection.style.display = 'block';
        
        // 滚动到结果区域
        reportContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function showDemo() {
        // 填充演示数据
        completedWorkTextarea.value = translations.inputs.completedWork.placeholder;
        problemsTextarea.value = translations.inputs.problems.placeholder;
        plansTextarea.value = translations.inputs.plans.placeholder;
        styleSelect.value = 'internet';
        updateStyleDescription();
        
        showNotification(translations.notifications.demoLoaded, 'info');
        
        // 自动调整文本区域高度
        autoResizeTextarea(completedWorkTextarea);
        autoResizeTextarea(problemsTextarea);
        autoResizeTextarea(plansTextarea);
    }

    function clearForm() {
        if (confirm(translations.confirmations.clearForm)) {
            completedWorkTextarea.value = '';
            problemsTextarea.value = '';
            plansTextarea.value = '';
            styleSelect.value = 'internet';
            updateStyleDescription();
            
            // 隐藏结果区域
            resultSection.style.display = 'none';
            
            showNotification(translations.notifications.formCleared, 'info');
            
            // 聚焦到第一个输入框
            completedWorkTextarea.focus();
            
            // 自动调整文本区域高度
            autoResizeTextarea(completedWorkTextarea);
            autoResizeTextarea(problemsTextarea);
            autoResizeTextarea(plansTextarea);
        }
    }

    function copyReport() {
        const reportText = reportContent.textContent;
        
        if (!reportText || reportText.trim() === '') {
            showNotification(translations.notifications.noContent, 'warning');
            return;
        }
        
        // 使用现代剪贴板API
        navigator.clipboard.writeText(reportText)
            .then(() => {
                showNotification(translations.notifications.copied, 'success');
            })
            .catch(err => {
                // 降级方案
                const textArea = document.createElement('textarea');
                textArea.value = reportText;
                document.body.appendChild(textArea);
                textArea.select();
                try {
                    document.execCommand('copy');
                    showNotification(translations.notifications.copied, 'success');
                } catch (err) {
                    showNotification(translations.notifications.copyFailed, 'error');
                }
                document.body.removeChild(textArea);
            });
    }

    function downloadReport() {
        const reportText = reportContent.textContent;
        
        if (!reportText || reportText.trim() === '') {
            showNotification(translations.notifications.noDownload, 'warning');
            return;
        }
        
        // 创建下载链接
        const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        
        // 生成文件名（根据语言）
        const now = new Date();
        let filename;
        if (currentLanguage === 'zh-CN') {
            filename = `周报_${now.getFullYear()}年${now.getMonth()+1}月${now.getDate()}日_${now.getHours()}时${now.getMinutes()}分.txt`;
        } else {
            filename = `WeeklyReport_${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()}_${now.getHours()}-${now.getMinutes()}.txt`;
        }
        a.download = filename;
        
        // 触发下载
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showNotification(translations.notifications.downloading, 'success');
    }

    function regenerateReport() {
        // 重新生成报告
        generateReport();
    }

    function openWebVersion() {
        // 打开https://github.com/cleao2/ai_week页面或项目主页
        chrome.tabs.create({ url: 'https://https://github.com/cleao2/ai_week.com/example/ai-weekly-report' });
    }

    function showSettings() {
        // 检查是否已经存在模态框，如果存在则先移除
        const existingModal = document.querySelector('.modal-overlay');
        if (existingModal) {
            existingModal.remove();
        }
        
        // AI设置面板
        const aiStatus = window.aiService ? aiService.getMode() : 'local';
        const aiConfig = window.aiService ? aiService.config : { apiKey: '', provider: 'deepseek' };
        
        const settingsHtml = `
            <div class="settings-panel" id="ai-settings-panel">
                <h3><i class="fas fa-brain"></i> ${translations.ai.title}</h3>
                <p class="settings-description">${translations.ai.description}</p>
                
                <div class="setting-item">
                    <label for="ai-provider">${translations.ai.provider}</label>
                    <select id="ai-provider" class="settings-select">
                        <option value="openrouter" ${aiConfig.provider === 'openrouter' ? 'selected' : ''}>${translations.ai.providers.openrouter}</option>
                        <option value="together" ${aiConfig.provider === 'together' ? 'selected' : ''}>${translations.ai.providers.together}</option>
                        <option value="huggingface" ${aiConfig.provider === 'huggingface' ? 'selected' : ''}>${translations.ai.providers.huggingface}</option>
                        <option value="deepseek" ${aiConfig.provider === 'deepseek' ? 'selected' : ''}>${translations.ai.providers.deepseek}</option>
                        <option value="openai" ${aiConfig.provider === 'openai' ? 'selected' : ''}>${translations.ai.providers.openai}</option>
                        <option value="qwen" ${aiConfig.provider === 'qwen' ? 'selected' : ''}>${translations.ai.providers.qwen}</option>
                        <option value="spark" ${aiConfig.provider === 'spark' ? 'selected' : ''}>${translations.ai.providers.spark}</option>
                    </select>
                </div>
                
                <div class="setting-item">
                    <label for="ai-api-key">${translations.ai.apiKey}</label>
                    <input type="password" id="ai-api-key" class="settings-input" 
                           placeholder="输入API密钥" value="${aiConfig.apiKey || ''}">
                    <div class="settings-hint" id="ai-provider-hint">
                        ${translations.ai.help.deepseek}
                    </div>
                </div>
                
                <div class="setting-item">
                    <label>${translations.ai.status.connected}</label>
                    <div class="status-indicator">
                        <span id="ai-connection-status" class="status-badge ${aiStatus === 'ai' ? 'status-connected' : 'status-disconnected'}">
                            ${aiStatus === 'ai' ? translations.ai.status.connected : translations.ai.status.disconnected}
                        </span>
                        <button id="test-connection-btn" class="btn-small">${translations.ai.testConnection}</button>
                    </div>
                </div>
                
                <div class="setting-buttons">
                    <button id="ai-save-btn" class="btn-primary">${translations.ai.save}</button>
                    <button id="ai-cancel-btn" class="btn-outline">${translations.ai.cancel}</button>
                    ${aiStatus === 'ai' ? 
                        `<button id="ai-disable-btn" class="btn-warning">${translations.ai.disable}</button>` : 
                        `<button id="ai-enable-btn" class="btn-success">${translations.ai.enable}</button>`
                    }
                </div>
            </div>
        `;
        
        // 创建模态框
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                ${settingsHtml}
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // 事件监听器
        const providerSelect = document.getElementById('ai-provider');
        const apiKeyInput = document.getElementById('ai-api-key');
        const testConnectionBtn = document.getElementById('test-connection-btn');
        const saveBtn = document.getElementById('ai-save-btn');
        const cancelBtn = document.getElementById('ai-cancel-btn');
        const enableBtn = document.getElementById('ai-enable-btn');
        const disableBtn = document.getElementById('ai-disable-btn');
        const providerHint = document.getElementById('ai-provider-hint');
        
        // 更新提供商提示
        function updateProviderHint() {
            const provider = providerSelect.value;
                const hints = {
                    'openrouter': translations.ai.help.openrouter,
                    'together': translations.ai.help.together,
                    'huggingface': translations.ai.help.huggingface,
                    'deepseek': translations.ai.help.deepseek,
                    'openai': translations.ai.help.openai,
                    'qwen': translations.ai.help.qwen,
                    'spark': translations.ai.help.spark
                };
            providerHint.textContent = hints[provider] || '';
        }
        
        providerSelect.addEventListener('change', updateProviderHint);
        updateProviderHint();
        
        // 测试连接
        testConnectionBtn.addEventListener('click', async () => {
            if (!apiKeyInput.value.trim()) {
                showNotification('请输入API密钥', 'warning');
                return;
            }
            
            testConnectionBtn.disabled = true;
            testConnectionBtn.textContent = translations.ai.status.testing;
            
            try {
                // 临时设置API密钥进行测试
                const tempService = new SimpleAIService();
                await tempService.setApiKey(apiKeyInput.value.trim());
                await tempService.setProvider(providerSelect.value);
                
                const result = await tempService.testConnection();
                
                if (result.success) {
                    showNotification(translations.notifications.aiConnected, 'success');
                    document.getElementById('ai-connection-status').textContent = translations.ai.status.connected;
                    document.getElementById('ai-connection-status').className = 'status-badge status-connected';
                } else {
                    showNotification(translations.notifications.aiConnectionFailed.replace('{error}', result.error), 'error');
                }
            } catch (error) {
                showNotification(translations.notifications.aiConnectionFailed.replace('{error}', error.message), 'error');
            } finally {
                testConnectionBtn.disabled = false;
                testConnectionBtn.textContent = translations.ai.testConnection;
            }
        });
        
        // 保存设置
        saveBtn.addEventListener('click', async () => {
            const apiKey = apiKeyInput.value.trim();
            const provider = providerSelect.value;
            
            if (apiKey && window.aiService) {
                await aiService.setApiKey(apiKey);
                await aiService.setProvider(provider);
                showNotification(translations.notifications.aiApiKeySaved, 'success');
                updateAIStatus();
                // 保存后关闭模态框
                modal.remove();
            } else if (!apiKey) {
                showNotification('请输入API密钥', 'warning');
            }
        });
        
        // 启用AI模式
        if (enableBtn) {
            enableBtn.addEventListener('click', async () => {
                const apiKey = apiKeyInput.value.trim();
                if (!apiKey) {
                    if (confirm(translations.confirmations.enableAI)) {
                        apiKeyInput.focus();
                        return;
                    }
                }
                
                if (window.aiService) {
                    await aiService.setApiKey(apiKey || aiConfig.apiKey);
                    await aiService.setProvider(providerSelect.value);
                    showNotification(translations.notifications.aiModeEnabled, 'success');
                    updateAIStatus();
                    modal.remove();
                }
            });
        }
        
        // 禁用AI模式
        if (disableBtn) {
            disableBtn.addEventListener('click', async () => {
                if (confirm(translations.confirmations.disableAI)) {
                    if (window.aiService) {
                        await aiService.setApiKey('');
                        showNotification(translations.notifications.aiModeDisabled, 'info');
                        updateAIStatus();
                        modal.remove();
                    }
                }
            });
        }
        
        // 取消
        cancelBtn.addEventListener('click', () => {
            modal.remove();
        });
        
        // 点击模态框外部关闭
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
        // 添加ESC键关闭功能
        const handleEscKey = (e) => {
            if (e.key === 'Escape') {
                modal.remove();
                document.removeEventListener('keydown', handleEscKey);
            }
        };
        document.addEventListener('keydown', handleEscKey);
        
        // 模态框移除时清理事件监听器
        const originalRemove = modal.remove;
        modal.remove = function() {
            document.removeEventListener('keydown', handleEscKey);
            return originalRemove.call(this);
        };
    }
    
    function updateAIStatus() {
        if (!window.aiService) return;
        
        const aiStatusItem = document.getElementById('ai-status-item');
        const localStatusItem = document.getElementById('local-status-item');
        const aiStatusText = document.getElementById('ai-status-text');
        const localStatusText = document.getElementById('local-status-text');
        
        const mode = aiService.getMode();
        
        if (mode === 'ai') {
            aiStatusItem.style.display = 'flex';
            localStatusItem.style.display = 'none';
            if (aiStatusText) aiStatusText.textContent = translations.status.aiMode;
        } else {
            aiStatusItem.style.display = 'none';
            localStatusItem.style.display = 'flex';
            if (localStatusText) localStatusText.textContent = translations.status.localMode;
        }
    }

    function showHelp() {
        const helpText = `
AI周报生成器浏览器扩展使用说明：

1. 填写本周完成的工作（必填）
2. 可选填写遇到的问题和下周计划
3. 选择适合的行业风格
4. 点击"生成周报"按钮
5. 复制或下载生成的周报

快捷键：
- Ctrl+Enter: 生成周报
- Ctrl+D: 填充演示数据
- Ctrl+Shift+C: 清空表单

特点：
- 完全本地运行，无需网络连接
- 支持5种行业风格
- 自动保存历史记录
- 支持右键菜单快速生成
        `;
        
        alert(helpText);
    }

    function showNotification(message, type = 'info') {
        // 设置通知内容和样式
        notificationText.textContent = message;
        
        // 根据类型设置颜色
        notification.className = 'notification';
        switch (type) {
            case 'success':
                notification.style.backgroundColor = '#28a745';
                break;
            case 'error':
                notification.style.backgroundColor = '#dc3545';
                break;
            case 'warning':
                notification.style.backgroundColor = '#ffc107';
                notification.style.color = '#212529';
                break;
            case 'info':
            default:
                notification.style.backgroundColor = '#17a2b8';
                break;
        }
        
        // 显示通知
        notification.classList.add('show');
        
        // 3秒后自动隐藏
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

    function setupTextareaAutoResize() {
        function autoResizeTextarea(textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = (textarea.scrollHeight) + 'px';
        }
        
        const textareas = document.querySelectorAll('textarea');
        textareas.forEach(textarea => {
            textarea.addEventListener('input', function() {
                autoResizeTextarea(this);
            });
            
            // 初始化高度
            autoResizeTextarea(textarea);
        });
    }

    function ensureContainerRendering() {
        // 确保容器正确渲染
        setTimeout(() => {
            const container = document.querySelector('.container');
            if (container) {
                // 强制浏览器重新计算布局
                container.style.display = 'none';
                container.offsetHeight; // 触发重排
                container.style.display = 'flex';
                
                // 确保body有正确的高度
                document.body.style.minHeight = '100vh';
                document.body.style.height = 'auto';
                
                // 如果内容高度小于最小高度，设置最小高度
                const contentHeight = container.scrollHeight;
                const minHeight = 550; // 最小高度
                if (contentHeight < minHeight) {
                    container.style.minHeight = minHeight + 'px';
                }
            }
        }, 50);
    }

    function setupKeyboardShortcuts() {
        document.addEventListener('keydown', function(e) {
            // Ctrl+Enter 生成报告
            if (e.ctrlKey && e.key === 'Enter') {
                e.preventDefault();
                generateReport();
            }
            
            // Ctrl+D 填充演示数据
            if (e.ctrlKey && e.key === 'd') {
                e.preventDefault();
                showDemo();
            }
            
            // Ctrl+Shift+C 清空表单
            if (e.ctrlKey && e.shiftKey && e.key === 'C') {
                e.preventDefault();
                clearForm();
            }
        });
        
        // 显示键盘快捷键提示
        console.log('AI周报生成器扩展 - 键盘快捷键:');
        console.log('Ctrl+Enter - 生成周报');
        console.log('Ctrl+D - 填充演示数据');
        console.log('Ctrl+Shift+C - 清空表单');
    }
});
