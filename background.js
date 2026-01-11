// AI周报生成器浏览器扩展 - 后台脚本（最小化版本）

// 扩展安装时的初始化
chrome.runtime.onInstalled.addListener(function(details) {
    if (details.reason === 'install') {
        // 扩展首次安装
        console.log('AI周报生成器扩展已安装');
        
        // 初始化默认设置
        chrome.storage.local.set({
            reportHistory: []
        }, function() {
            console.log('默认设置已初始化');
        });
    } else if (details.reason === 'update') {
        // 扩展更新
        console.log('AI周报生成器扩展已更新到版本', chrome.runtime.getManifest().version);
    }
});

// 监听来自popup的消息
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    switch (request.action) {
        case 'getHistory':
            chrome.storage.local.get(['reportHistory'], function(result) {
                sendResponse({ 
                    success: true, 
                    history: result.reportHistory || [] 
                });
            });
            return true;
            
        case 'clearHistory':
            chrome.storage.local.set({ reportHistory: [] }, function() {
                sendResponse({ success: true });
            });
            return true;
    }
});

console.log('AI周报生成器后台脚本已启动');
