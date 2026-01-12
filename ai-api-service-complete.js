// AI API服务 - 开源免费AI API集成
// 支持多种AI提供商，提供统一的接口

class AIService {
    constructor() {
        this.providers = {
            'openrouter': new OpenRouterProvider(),
            'together': new TogetherAIProvider(),
            'huggingface': new HuggingFaceProvider(),
            'local': new LocalTemplateProvider() // 本地模板作为后备
        };
        
        this.currentProvider = 'local'; // 默认使用本地模板
        this.config = {
            apiKeys: {},
            timeout: 30000, // 30秒超时
            retryCount: 2,
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
            chrome.storage.local.get(['aiConfig'], (result) => {
                if (result.aiConfig) {
                    this.config = { ...this.config, ...result.aiConfig };
                }
                resolve();
            });
        });
    }
    
    async saveConfig() {
        return new Promise((resolve) => {
            chrome.storage.local.set({ aiConfig: this.config }, () => {
                resolve();
            });
        });
    }
    
    async setProvider(providerName) {
        if (this.providers[providerName]) {
            this.currentProvider = providerName;
            await this.saveConfig();
            return true;
        }
        return false;
    }
    
    async setApiKey(providerName, apiKey) {
        if (!this.config.apiKeys) {
            this.config.apiKeys = {};
        }
        this.config.apiKeys[providerName] = apiKey;
        await this.saveConfig();
    }
    
    async generateWeeklyReport(completed, problems, plans, styleKey, language = 'zh-CN') {
        const cacheKey = this.getCacheKey(completed, problems, plans, styleKey, language);
        
        // 检查缓存
        if (this.config.enableCache && this.cache.has(cacheKey)) {
            console.log('使用缓存结果');
            return this.cache.get(cacheKey);
        }
        
        // 生成提示词
        const prompt = this.buildPrompt(completed, problems, plans, styleKey, language);
        
        try {
            // 使用当前提供商生成
            const provider = this.providers[this.currentProvider];
            const result = await provider.generate(prompt, {
                styleKey,
                language,
                timeout: this.config.timeout
            });
            
            // 缓存结果
            if (this.config.enableCache) {
                this.cache.set(cacheKey, result);
            }
            
            return result;
        } catch (error) {
            console.error('AI API生成失败:', error);
            
            // 降级到本地模板
            if (this.currentProvider !== 'local') {
                console.log('降级到本地模板');
                const localResult = await this.providers['local'].generate(prompt, {
                    styleKey,
                    language
                });
                return localResult;
            }
            
            throw error;
        }
    }
    
    buildPrompt(completed, problems, plans, styleKey, language) {
        const styleInfo = this.getStyleInfo(styleKey, language);
        
        let prompt = '';
        
        if (language === 'zh-CN') {
            prompt = `请生成一份周报，要求如下：

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
            prompt = `Please generate a weekly work report with the following requirements:

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
        
        return prompt;
    }
    
    getStyleInfo(styleKey, language) {
        // 从ai-generator.js导入风格信息
        const INDUSTRY_STYLES = {
            "internet": {
                "zh-CN": {
                    "name": "互联网风格",
                    "keywords": ["数据驱动", "敏捷迭代", "技术术语", "用户体验", "性能优化", "A/B测试", "灰度发布"],
                    "structure": ["核心成果", "问题与解决", "下周重点"],
                    "tone": "专业、技术导向、结果驱动"
                },
                "en-US": {
                    "name": "Internet Style",
                    "keywords": ["data-driven", "agile iteration", "technical terms", "user experience", "performance optimization", "A/B testing", "gradual rollout"],
                    "structure": ["Key Achievements", "Problems & Solutions", "Next Week Focus"],
                    "tone": "Professional, technology-oriented, results-driven"
                }
            },
            "stateOwned": {
                "zh-CN": {
                    "name": "国企风格",
                    "keywords": ["稳步推进", "贯彻落实", "提高认识", "加强领导", "统筹协调", "确保完成", "取得实效"],
                    "structure": ["工作完成情况", "存在问题", "下一步打算"],
                    "tone": "正式、稳重、政策导向"
                },
                "en-US": {
                    "name": "State-Owned Enterprise Style",
                    "keywords": ["steady progress", "implementation", "awareness improvement", "leadership strengthening", "coordination", "ensuring completion", "achieving results"],
                    "structure": ["Work Completion", "Existing Problems", "Next Steps"],
                    "tone": "Formal, steady, policy-oriented"
                }
            },
            "foreign": {
                "zh-CN": {
                    "name": "外企风格",
                    "keywords": ["OKR完成情况", "stakeholder沟通", "alignment", "deliverable", "KPI", "roadmap", "sync-up"],
                    "structure": ["主要成就", "挑战与解决方案", "下周计划"],
                    "tone": "国际化、目标导向、协作"
                },
                "en-US": {
                    "name": "Foreign Company Style",
                    "keywords": ["OKR completion", "stakeholder communication", "alignment", "deliverables", "KPI", "roadmap", "sync-up"],
                    "structure": ["Key Achievements", "Challenges & Solutions", "Next Week Plan"],
                    "tone": "International, goal-oriented, collaborative"
                }
            },
            "government": {
                "zh-CN": {
                    "name": "体制内风格",
                    "keywords": ["在领导下", "认真学习", "贯彻落实", "提高政治站位", "服务大局", "担当作为", "履职尽责"],
                    "structure": ["主要工作", "存在问题", "下步计划"],
                    "tone": "政治性、规范性、程序性"
                },
                "en-US": {
                    "name": "Government Style",
                    "keywords": ["under leadership", "serious study", "implementation", "political awareness", "serving the overall situation", "taking responsibility", "performing duties"],
                    "structure": ["Main Work", "Existing Problems", "Next Steps"],
                    "tone": "Political, normative, procedural"
                }
            },
            "freelancer": {
                "zh-CN": {
                    "name": "自由职业者",
                    "keywords": ["客户反馈", "项目进展", "时间投入", "收入情况", "技能提升", "网络建设", "时间管理"],
                    "structure": ["项目完成情况", "遇到的问题", "下周安排"],
                    "tone": "灵活、务实、个人成长导向"
                },
                "en-US": {
                    "name": "Freelancer Style",
                    "keywords": ["client feedback", "project progress", "time investment", "income situation", "skill improvement", "network building", "time management"],
                    "structure": ["Project Completion", "Problems Encountered", "Next Week Arrangements"],
                    "tone": "Flexible, practical, personal growth-oriented"
                }
            }
        };
        
        const styleInfo = INDUSTRY_STYLES[styleKey] || INDUSTRY_STYLES["internet"];
        return styleInfo[language] || styleInfo['zh-CN'];
    }
    
    getCacheKey(completed, problems, plans, styleKey, language) {
        return JSON.stringify({
            completed,
            problems,
            plans,
            styleKey,
            language,
            timestamp: Math.floor(Date.now() / 3600000) // 每小时一个缓存
        });
    }
    
    clearCache() {
        this.cache.clear();
    }
    
    async testConnection(providerName) {
        const provider = this.providers[providerName];
        if (!provider) {
            return { success: false, error: 'Provider not found' };
        }
        
        try {
            const result = await provider.testConnection();
            return result;
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    getAvailableProviders() {
        return Object.keys(this.providers).filter(name => name !== 'local');
    }
    
    getProviderInfo(providerName) {
        const provider = this.providers[providerName];
        return provider ? provider.getInfo() : null;
    }
}

// OpenRouter AI 提供商
class OpenRouterProvider {
    constructor() {
        this.name = 'OpenRouter';
        this.baseUrl = 'https://openrouter.ai/api/v1';
        this.models = [
            'openai/gpt-3.5-turbo',
            'openai/gpt-4',
            'anthropic/claude-3-haiku',
            'meta-llama/llama-3-70b-instruct'
        ];
        this.defaultModel = 'openai/gpt-3.5-turbo';
    }
    
    getInfo() {
        return {
            name: this.name,
            description: '聚合多个AI模型的平台，提供免费额度',
            website: 'https://openrouter.ai',
            freeTier: true,
            dailyLimit: 100,
            models: this.models
        };
    }
    
    async generate(prompt, options = {}) {
        const apiKey = await this.getApiKey();
        if (!apiKey) {
            throw new Error('OpenRouter API key not configured');
        }
        
        const model = options.model || this.defaultModel;
        const maxTokens = options.maxTokens || 2000;
        
        const response = await fetch(`${this.baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'HTTP-Referer': 'https://github.com/cleao2/ai_weekly_report',
                'X-Title': 'AI Weekly Report Generator'
            },
            body: JSON.stringify({
                model: model,
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
                max_tokens: maxTokens,
                temperature: 0.7,
                top_p: 0.9
            })
        });
        
        if (!response.ok) {
            throw new Error(`OpenRouter API error: ${response.status}`);
        }
        
        const data = await response.json();
        const content = data.choices[0].message.content;
        
        return {
            content: content,
            model: model,
            provider: this.name,
            tokens: data.usage?.total_tokens || 0
        };
    }
    
    async testConnection() {
        try {
            const apiKey = await this.getApiKey();
            if (!apiKey) {
                return { success: false, error: 'API key not configured' };
            }
            
            // 简单的测试请求
            const response = await fetch(`${this.baseUrl}/models`, {
                headers: {
                    'Authorization': `Bearer ${apiKey}`
                }
            });
            
            return {
                success: response.ok,
                message: response.ok ? 'Connection successful' : `API error: ${response.status}`
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    async getApiKey() {
        return new Promise((resolve) => {
            chrome.storage.local.get(['aiConfig'], (result) => {
                const apiKeys = result.aiConfig?.apiKeys || {};
                resolve(apiKeys['openrouter'] || '');
            });
        });
    }
}

// Together AI 提供商
class TogetherAIProvider {
    constructor() {
        this.name = 'Together AI';
        this.baseUrl = 'https://api.together.xyz/v1';
        this.models = [
            'meta-llama/Llama-3-70b-chat-hf',
            'mistralai/Mixtral-8x7B-Instruct-v0.1',
            'codellama/CodeLlama-34b-Instruct-hf'
        ];
        this.defaultModel = 'meta-llama/Llama-3-70b-chat-hf';
    }
    
    getInfo() {
        return {
            name: this.name,
            description: '专注于开源模型的AI云服务',
            website: 'https://together.ai',
            freeTier: true,
            freeCredits: 25, // 美元
            models: this.models
        };
    }
    
    async generate(prompt, options = {}) {
        const apiKey = await this.getApiKey();
        if (!apiKey) {
            throw new Error('Together AI API key not configured');
        }
        
        const model = options.model || this.defaultModel;
        const maxTokens = options.maxTokens || 2000;
        
        const response = await fetch(`${this.baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: model,
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
                max_tokens: maxTokens,
                temperature: 0.7,
                top_p: 0.9,
                repetition_penalty: 1.1
            })
        });
        
        if (!response.ok) {
            throw new Error(`Together AI API error: ${response.status}`);
        }
        
        const data = await response.json();
        const content = data.choices[0].message.content;
        
        return {
            content: content,
            model: model,
            provider: this.name,
            tokens: data.usage?.total_tokens || 0
        };
    }
    
    async testConnection() {
        try {
            const apiKey = await this.getApiKey();
            if (!apiKey) {
                return { success: false, error: 'API key not configured' };
            }
            
            const response = await fetch(`${this.baseUrl}/models`, {
                headers: {
                    'Authorization': `Bearer ${apiKey}`
                }
            });
            
            return {
                success: response.ok,
                message: response.ok ? 'Connection successful' : `API error: ${response.status}`
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    async getApiKey() {
        return new Promise((resolve) => {
            chrome.storage.local.get(['aiConfig'], (result) => {
                const apiKeys = result.aiConfig?.apiKeys || {};
                resolve(apiKeys['together'] || '');
            });
        });
    }
}

// Hugging Face 提供商
class HuggingFaceProvider {
    constructor() {
        this.name = 'Hugging Face';
        this.baseUrl = 'https://api-inference.huggingface.co/models';
        this.models = [
            'mistralai/Mistral-7B-Instruct-v0.2',
            'google/flan-t5-xxl',
            'microsoft/phi-2'
        ];
        this.defaultModel = 'mistralai/Mistral-7B-Instruct-v0.2';
    }
    
    getInfo() {
        return {
            name: this.name,
            description: '海量开源模型的平台',
            website: 'https://huggingface.co',
            freeTier: true,
            rateLimit: '30k tokens/month',
            models: this.models
        };
    }
    
    async generate(prompt, options = {}) {
        const apiKey = await this.getApiKey();
        if (!apiKey) {
            throw new Error('Hugging Face API key not configured');
