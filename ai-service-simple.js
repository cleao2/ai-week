// 简化的AI服务 - 开源免费AI API集成
// 支持渐进式增强：本地模板 + AI API

class SimpleAIService {
    constructor() {
        this.mode = 'local'; // 'local' 或 'ai'
        this.aiProvider = null;
        this.config = {
            apiKey: '',
            provider: 'deepseek', // 默认使用DeepSeek，因为测试成功且免费
            enableCache: true
        };
        this.cache = new Map();
        this.init();
    }
    
    async init() {
        // 从存储加载配置
        await this.loadConfig();
    }
    
    async loadConfig() {
        return new Promise((resolve) => {
            chrome.storage.local.get(['aiServiceConfig'], (result) => {
                if (result.aiServiceConfig) {
                    // 只覆盖存在的配置项，保留默认值
                    const savedConfig = result.aiServiceConfig;
                    this.config.apiKey = savedConfig.apiKey || this.config.apiKey;
                    this.config.provider = savedConfig.provider || this.config.provider;
                    this.config.enableCache = savedConfig.enableCache !== undefined ? savedConfig.enableCache : this.config.enableCache;
                    this.mode = this.config.apiKey ? 'ai' : 'local';
                }
                resolve();
            });
        });
    }
    
    async saveConfig() {
        return new Promise((resolve) => {
            chrome.storage.local.set({ aiServiceConfig: this.config }, () => {
                resolve();
            });
        });
    }
    
    async setApiKey(apiKey) {
        this.config.apiKey = apiKey;
        this.mode = apiKey ? 'ai' : 'local';
        await this.saveConfig();
    }
    
    async setProvider(provider) {
        this.config.provider = provider;
        await this.saveConfig();
    }
    
    async generateWeeklyReport(completed, problems, plans, styleKey, language = 'zh-CN') {
        const cacheKey = this.getCacheKey(completed, problems, plans, styleKey, language);
        
        // 检查缓存
        if (this.config.enableCache && this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }
        
        // 根据模式选择生成方式
        let result;
        if (this.mode === 'ai' && this.config.apiKey) {
            try {
                result = await this.generateWithAI(completed, problems, plans, styleKey, language);
            } catch (error) {
                console.warn('AI生成失败，降级到本地模板:', error);
                result = this.generateWithLocalTemplate(completed, problems, plans, styleKey, language);
            }
        } else {
            result = this.generateWithLocalTemplate(completed, problems, plans, styleKey, language);
        }
        
        // 缓存结果
        if (this.config.enableCache) {
            this.cache.set(cacheKey, result);
        }
        
        return result;
    }
    
    async generateWithAI(completed, problems, plans, styleKey, language) {
        const prompt = this.buildPrompt(completed, problems, plans, styleKey, language);
        const provider = this.config.provider;
        
        let apiUrl, headers, body;
        
        switch (provider) {
            case 'openrouter':
                apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
                headers = {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.config.apiKey}`,
                    'HTTP-Referer': 'https://github.com/cleao2/ai_week',
                    'X-Title': 'AI Weekly Report Generator'
                };
                body = {
                    model: 'openai/gpt-3.5-turbo',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are a professional weekly report generator. Generate detailed, professional weekly reports based on user input.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    max_tokens: 2000,
                    temperature: 0.7
                };
                break;
                
            case 'together':
                apiUrl = 'https://api.together.xyz/v1/chat/completions';
                headers = {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.config.apiKey}`
                };
                body = {
                    model: 'meta-llama/Llama-3-70b-chat-hf',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are a professional weekly report generator. Generate detailed, professional weekly reports based on user input.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    max_tokens: 2000,
                    temperature: 0.7
                };
                break;
                
            case 'huggingface':
                apiUrl = 'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2';
                headers = {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.config.apiKey}`
                };
                body = {
                    inputs: prompt,
                    parameters: {
                        max_length: 2000,
                        temperature: 0.7,
                        top_p: 0.9
                    }
                };
                break;
                
            case 'deepseek':
                apiUrl = 'https://api.deepseek.com/chat/completions';
                headers = {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.config.apiKey}`
                };
                body = {
                    model: 'deepseek-chat',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are a professional weekly report generator. Generate detailed, professional weekly reports based on user input.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    max_tokens: 2000,
                    temperature: 0.7,
                    stream: false
                };
                break;
                
            case 'openai':
                apiUrl = 'https://api.openai.com/v1/chat/completions';
                headers = {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.config.apiKey}`
                };
                body = {
                    model: 'gpt-3.5-turbo',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are a professional weekly report generator. Generate detailed, professional weekly reports based on user input.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    max_tokens: 2000,
                    temperature: 0.7
                };
                break;
                
                case 'qwen':
                    apiUrl = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';
                    headers = {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.config.apiKey}`
                    };
                    body = {
                        model: 'qwen-turbo',
                        messages: [
                            {
                                role: 'system',
                                content: 'You are a professional weekly report generator. Generate detailed, professional weekly reports based on user input.'
                            },
                            {
                                role: 'user',
                                content: prompt
                            }
                        ],
                        max_tokens: 2000,
                        temperature: 0.7
                    };
                    break;
                    
                case 'spark':
                    apiUrl = 'https://api-spark.xfyun.cn/v3.5/chat';
                    headers = {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.config.apiKey}`
                    };
                    body = {
                        model: 'generalv3.5',
                        messages: [
                            {
                                role: 'system',
                                content: 'You are a professional weekly report generator. Generate detailed, professional weekly reports based on user input.'
                            },
                            {
                                role: 'user',
                                content: prompt
                            }
                        ],
                        max_tokens: 2000,
                        temperature: 0.7
                    };
                    break;
                    
                default:
                    throw new Error(`不支持的AI提供商: ${provider}`);
        }
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(body)
        });
        
        if (!response.ok) {
            throw new Error(`AI API错误: ${response.status}`);
        }
        
        const data = await response.json();
        
        // 解析不同提供商的响应格式
        let content;
        if (provider === 'huggingface') {
            content = data[0]?.generated_text || data.generated_text || '';
        } else {
            content = data.choices[0]?.message?.content || '';
        }
        
        if (!content) {
            throw new Error('AI响应内容为空');
        }
        
        return {
            content: content,
            mode: 'ai',
            provider: provider,
            generated_at: new Date().toLocaleString()
        };
    }
    
    generateWithLocalTemplate(completed, problems, plans, styleKey, language) {
        // 使用现有的本地生成器
        const result = generateWeeklyReport(completed, problems, plans, styleKey, language);
        return {
            content: result.content,
            mode: 'local',
            provider: 'template',
            generated_at: result.generated_at
        };
    }
    
    buildPrompt(completed, problems, plans, styleKey, language) {
        const styleInfo = this.getStyleInfo(styleKey, language);
        
        if (language === 'zh-CN') {
            return `请生成一份周报，要求如下：

行业风格：${styleInfo.name}
风格特点：${styleInfo.tone}

本周完成的工作：
${completed.map((item, i) => `${i + 1}. ${item}`).join('\n')}

${problems && problems.length > 0 ? `遇到的问题：
${problems.map((item, i) => `${i + 1}. ${item}`).join('\n')}` : ''}

${plans && plans.length > 0 ? `下周计划：
${plans.map((item, i) => `${i + 1}. ${item}`).join('\n')}` : ''}

请按照以下结构生成周报：
1. 【${styleInfo.structure[0]}】
2. 【${styleInfo.structure[1]}】
3. 【${styleInfo.structure[2]}】

要求：
1. 使用${styleInfo.name}的专业术语和表达方式
2. 语言风格：${styleInfo.tone}
3. 内容详实、专业、有深度
4. 适当使用行业关键词：${styleInfo.keywords.join('、')}
5. 生成完整的周报内容，包括标题和日期`;
        } else {
            return `Please generate a weekly work report with the following requirements:

Industry Style: ${styleInfo.name}
Style Characteristics: ${styleInfo.tone}

Work Completed This Week:
${completed.map((item, i) => `${i + 1}. ${item}`).join('\n')}

${problems && problems.length > 0 ? `Problems Encountered:
${problems.map((item, i) => `${i + 1}. ${item}`).join('\n')}` : ''}

${plans && plans.length > 0 ? `Next Week Plans:
${plans.map((item, i) => `${i + 1}. ${item}`).join('\n')}` : ''}

Please structure the report as follows:
1. 【${styleInfo.structure[0]}】
2. 【${styleInfo.structure[1]}】
3. 【${styleInfo.structure[2]}】

Requirements:
1. Use professional terminology and expressions of ${styleInfo.name}
2. Language style: ${styleInfo.tone}
3. Content should be detailed, professional, and in-depth
4. Appropriately use industry keywords: ${styleInfo.keywords.join(', ')}
5. Generate complete weekly report content, including title and date`;
        }
    }
    
    getStyleInfo(styleKey, language) {
        // 简化的风格信息
        const styles = {
            "internet": {
                "zh-CN": {
                    "name": "互联网风格",
                    "keywords": ["数据驱动", "敏捷迭代", "技术术语", "用户体验", "性能优化"],
                    "structure": ["核心成果", "问题与解决", "下周重点"],
                    "tone": "专业、技术导向、结果驱动"
                },
                "en-US": {
                    "name": "Internet Style",
                    "keywords": ["data-driven", "agile iteration", "technical terms", "user experience", "performance optimization"],
                    "structure": ["Key Achievements", "Problems & Solutions", "Next Week Focus"],
                    "tone": "Professional, technology-oriented, results-driven"
                }
            },
            "stateOwned": {
                "zh-CN": {
                    "name": "国企风格",
                    "keywords": ["稳步推进", "贯彻落实", "提高认识", "加强领导", "统筹协调"],
                    "structure": ["工作完成情况", "存在问题", "下一步打算"],
                    "tone": "正式、稳重、政策导向"
                },
                "en-US": {
                    "name": "State-Owned Enterprise Style",
                    "keywords": ["steady progress", "implementation", "awareness improvement", "leadership strengthening", "coordination"],
                    "structure": ["Work Completion", "Existing Problems", "Next Steps"],
                    "tone": "Formal, steady, policy-oriented"
                }
            },
            "foreign": {
                "zh-CN": {
                    "name": "外企风格",
                    "keywords": ["OKR完成情况", "stakeholder沟通", "alignment", "deliverable", "KPI"],
                    "structure": ["主要成就", "挑战与解决方案", "下周计划"],
                    "tone": "国际化、目标导向、协作"
                },
                "en-US": {
                    "name": "Foreign Company Style",
                    "keywords": ["OKR completion", "stakeholder communication", "alignment", "deliverables", "KPI"],
                    "structure": ["Key Achievements", "Challenges & Solutions", "Next Week Plan"],
                    "tone": "International, goal-oriented, collaborative"
                }
            }
        };
        
        const styleInfo = styles[styleKey] || styles["internet"];
        return styleInfo[language] || styleInfo['zh-CN'];
    }
    
    getCacheKey(completed, problems, plans, styleKey, language) {
        return JSON.stringify({
            completed,
            problems,
            plans,
            styleKey,
            language,
            timestamp: Math.floor(Date.now() / 3600000)
        });
    }
    
    clearCache() {
        this.cache.clear();
    }
    
    async testConnection() {
        if (!this.config.apiKey) {
            return { success: false, error: 'API密钥未配置' };
        }
        
        try {
            // 使用更简单的测试提示，避免复杂的提示构建
            const testPrompt = '请回复"连接成功"';
            const provider = this.config.provider;
            
            let apiUrl, headers, body;
            
            // 根据提供商构建测试请求
            switch (provider) {
                case 'openrouter':
                    apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
                    headers = {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.config.apiKey}`,
                        'HTTP-Referer': 'https://github.com/cleao2/ai_week',
                        'X-Title': 'AI Weekly Report Generator'
                    };
                    body = {
                        model: 'openai/gpt-3.5-turbo',
                        messages: [
                            {
                                role: 'system',
                                content: '你是一个测试助手。当用户发送测试消息时，回复"连接成功"。'
                            },
                            {
                                role: 'user',
                                content: testPrompt
                            }
                        ],
                        max_tokens: 50,
                        temperature: 0.1
                    };
                    break;
                    
                case 'together':
                    apiUrl = 'https://api.together.xyz/v1/chat/completions';
                    headers = {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.config.apiKey}`
                    };
                    body = {
                        model: 'meta-llama/Llama-3-8b-chat-hf',
                        messages: [
                            {
                                role: 'system',
                                content: '你是一个测试助手。当用户发送测试消息时，回复"连接成功"。'
                            },
                            {
                                role: 'user',
                                content: testPrompt
                            }
                        ],
                        max_tokens: 50,
                        temperature: 0.1
                    };
                    break;
                    
                case 'huggingface':
                    apiUrl = 'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2';
                    headers = {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.config.apiKey}`
                    };
                    body = {
                        inputs: testPrompt,
                        parameters: {
                            max_length: 50,
                            temperature: 0.1,
                            top_p: 0.9
                        }
                    };
                    break;
                    
                case 'deepseek':
                    // 根据DeepSeek官方文档，支持两种URL格式
                    const deepseekBaseUrls = [
                        'https://api.deepseek.com',
                        'https://api.deepseek.com/v1'
                    ];
                    
                    headers = {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.config.apiKey}`
                    };
                    body = {
                        model: 'deepseek-chat',
                        messages: [
                            {
                                role: 'system',
                                content: '你是一个测试助手。当用户发送测试消息时，回复"连接成功"。'
                            },
                            {
                                role: 'user',
                                content: testPrompt
                            }
                        ],
                        max_tokens: 50,
                        temperature: 0.1,
                        stream: false
                    };
                    
                    // 尝试两种URL格式
                    let lastError = null;
                    for (const baseUrl of deepseekBaseUrls) {
                        try {
                            const testUrl = `${baseUrl}/chat/completions`;
                            console.log(`尝试DeepSeek API URL: ${testUrl}`);
                            
                            const response = await fetch(testUrl, {
                                method: 'POST',
                                headers: headers,
                                body: JSON.stringify(body)
                            });
                            
                            console.log(`API响应状态 (${baseUrl}):`, response.status, response.statusText);
                            
                            if (response.ok) {
                                const data = await response.json();
                                const content = data.choices[0]?.message?.content || '';
                                
                                console.log('API响应成功，内容:', content.substring(0, 100));
                                
                                if (content.includes('连接成功')) {
                                    return { success: true, message: '连接成功', details: `使用URL: ${baseUrl}` };
                                } else if (content && content.length > 0) {
                                    return { 
                                        success: true, 
                                        message: '连接成功（API工作正常）',
                                        details: `使用URL: ${baseUrl}, 响应: ${content.substring(0, 100)}`
                                    };
                                }
                            } else {
                                const errorText = await response.text();
                                lastError = `URL ${baseUrl}: ${response.status} - ${errorText.substring(0, 100)}`;
                                console.warn(`API错误 (${baseUrl}):`, lastError);
                            }
                        } catch (error) {
                            lastError = `URL ${baseUrl}: ${error.message}`;
                            console.warn(`请求失败 (${baseUrl}):`, error.message);
                        }
                    }
                    
                    // 所有URL都失败
                    throw new Error(`所有DeepSeek API端点都失败。最后错误: ${lastError}`);
                    
                case 'openai':
                    apiUrl = 'https://api.openai.com/v1/chat/completions';
                    headers = {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.config.apiKey}`
                    };
                    body = {
                        model: 'gpt-3.5-turbo',
                        messages: [
                            {
                                role: 'system',
                                content: '你是一个测试助手。当用户发送测试消息时，回复"连接成功"。'
                            },
                            {
                                role: 'user',
                                content: testPrompt
                            }
                        ],
                        max_tokens: 50,
                        temperature: 0.1
                    };
                    break;
                    
                case 'qwen':
                    apiUrl = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';
                    headers = {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.config.apiKey}`
                    };
                    body = {
                        model: 'qwen-turbo',
                        messages: [
                            {
                                role: 'system',
                                content: '你是一个测试助手。当用户发送测试消息时，回复"连接成功"。'
                            },
                            {
                                role: 'user',
                                content: testPrompt
                            }
                        ],
                        max_tokens: 50,
                        temperature: 0.1
                    };
                    break;
                    
                case 'spark':
                    apiUrl = 'https://api-spark.xfyun.cn/v3.5/chat';
                    headers = {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.config.apiKey}`
                    };
                    body = {
                        model: 'generalv3.5',
                        messages: [
                            {
                                role: 'system',
                                content: '你是一个测试助手。当用户发送测试消息时，回复"连接成功"。'
                            },
                            {
                                role: 'user',
                                content: testPrompt
                            }
                        ],
                        max_tokens: 50,
                        temperature: 0.1
                    };
                    break;
                    
                default:
                    throw new Error(`不支持的AI提供商: ${provider}`);
            }
            
            console.log('测试连接信息:', { provider, apiUrl, apiKeyPrefix: this.config.apiKey.substring(0, 10) + '...' });
            
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(body)
            });
            
            console.log('API响应状态:', response.status, response.statusText);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('API错误详情:', errorText);
                throw new Error(`API错误 ${response.status}: ${errorText.substring(0, 200)}`);
            }
            
            const data = await response.json();
            console.log('API响应数据:', data);
            
            // 验证响应
            let content = '';
            if (provider === 'huggingface') {
                content = data[0]?.generated_text || data.generated_text || '';
            } else {
                content = data.choices[0]?.message?.content || '';
            }
            
            console.log('解析的内容:', content);
            
            if (!content.includes('连接成功')) {
                console.warn('API响应不符合预期，内容:', content);
                // 即使内容不完全匹配，如果API响应成功，也认为是连接成功
                if (content && content.length > 0) {
                    return { 
                        success: true, 
                        message: '连接成功（响应内容不完全匹配但API工作正常）',
                        details: content.substring(0, 100)
                    };
                }
                throw new Error('API响应不符合预期');
            }
            
            return { success: true, message: '连接成功', details: content };
        } catch (error) {
            console.error('测试连接失败:', error);
            return { 
                success: false, 
                error: `连接失败: ${error.message}`,
                details: error.stack
            };
        }
    }
    
    getMode() {
        return this.mode;
    }
    
    getProviderInfo() {
        const providers = {
            'openrouter': {
                name: 'OpenRouter',
                description: '聚合多个AI模型的平台，提供免费额度',
                website: 'https://openrouter.ai',
                freeTier: true
            },
            'together': {
                name: 'Together AI',
                description: '专注于开源模型的AI云服务',
                website: 'https://together.ai',
                freeTier: true
            },
            'huggingface': {
                name: 'Hugging Face',
                description: '海量开源模型的平台',
                website: 'https://huggingface.co',
                freeTier: true
            },
            'deepseek': {
                name: 'DeepSeek',
                description: '深度求索公司的AI服务，提供高质量的对话和代码生成',
                website: 'https://www.deepseek.com',
                freeTier: true
            },
            'openai': {
                name: 'OpenAI',
                description: '官方的ChatGPT API，提供最稳定的AI服务',
                website: 'https://openai.com',
                freeTier: false
            },
            'qwen': {
                name: 'Qwen',
                description: '阿里云的通义千问AI服务，国内访问速度快',
                website: 'https://www.aliyun.com/product/ai',
                freeTier: true
            },
            'spark': {
                name: '讯飞星火',
                description: '科大讯飞的AI大模型，国内知名AI服务',
                website: 'https://xinghuo.xfyun.cn',
                freeTier: true
            }
        };
        
        return providers[this.config.provider] || providers['openrouter'];
    }
}

// 创建全局实例
const aiService = new SimpleAIService();
