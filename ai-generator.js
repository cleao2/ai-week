// AI周报生成器 - JavaScript版本（多语言支持）
// 从Python Flask应用移植的AI生成逻辑

// 多语言行业风格模板
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

// 获取当前周数
function getWeekNumber() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const days = Math.floor((now - start) / (24 * 60 * 60 * 1000));
    return Math.ceil((now.getDay() + 1 + days) / 7);
}

// 随机选择数组元素
function getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

// 生成周报内容（支持多语言）
function generateWeeklyReport(completed, problems, plans, styleKey, language = 'zh-CN') {
    // 获取风格信息
    const styleInfo = INDUSTRY_STYLES[styleKey] || INDUSTRY_STYLES["internet"];
    const styleData = styleInfo[language] || styleInfo['zh-CN'];
    const keywords = styleData.keywords;
    const structure = styleData.structure;
    const styleName = styleData.name;
    
    // 生成报告标题
    const weekNum = getWeekNumber();
    let reportTitle;
    if (language === 'zh-CN') {
        reportTitle = `📅 第${weekNum}周工作报告（${styleName}）`;
    } else {
        reportTitle = `📅 Week ${weekNum} Work Report (${styleName})`;
    }
    
    // 生成各部分内容
    let reportContent = `${reportTitle}\n\n`;
    
    // 第一部分：工作完成情况
    reportContent += `【${structure[0]}】\n`;
    completed.forEach((item, i) => {
        const keyword = getRandomElement(keywords);
        let details;
        
        switch (styleKey) {
            case "internet":
                if (language === 'zh-CN') {
                    details = [
                        `${i + 1}. ${item}：通过${keyword}方法，取得了显著成效`,
                        `${i + 1}. ${item}：采用${keyword}策略，提升了工作效率`,
                        `${i + 1}. ${item}：基于${keyword}原则，优化了工作流程`
                    ];
                } else {
                    details = [
                        `${i + 1}. ${item}: Achieved significant results through ${keyword} method`,
                        `${i + 1}. ${item}: Improved work efficiency by adopting ${keyword} strategy`,
                        `${i + 1}. ${item}: Optimized workflow based on ${keyword} principle`
                    ];
                }
                break;
            case "stateOwned":
                if (language === 'zh-CN') {
                    details = [
                        `${i + 1}. ${item}：按照上级要求，${keyword}，确保任务完成`,
                        `${i + 1}. ${item}：认真贯彻落实，${keyword}，取得阶段性成果`,
                        `${i + 1}. ${item}：在领导指导下，${keyword}，推进工作落实`
                    ];
                } else {
                    details = [
                        `${i + 1}. ${item}: According to superior requirements, ${keyword}, ensuring task completion`,
                        `${i + 1}. ${item}: Seriously implemented, ${keyword}, achieved phased results`,
                        `${i + 1}. ${item}: Under leadership guidance, ${keyword}, promoted work implementation`
                    ];
                }
                break;
            case "foreign":
                if (language === 'zh-CN') {
                    details = [
                        `${i + 1}. ${item}：成功与利益相关者${keyword}`,
                        `${i + 1}. ${item}：提前交付${keyword}`,
                        `${i + 1}. ${item}：通过有效协作实现${keyword}`
                    ];
                } else {
                    details = [
                        `${i + 1}. ${item}: Successfully ${keyword} with stakeholders`,
                        `${i + 1}. ${item}: Delivered ${keyword} ahead of schedule`,
                        `${i + 1}. ${item}: Achieved ${keyword} through effective collaboration`
                    ];
                }
                break;
            case "government":
                if (language === 'zh-CN') {
                    details = [
                        `${i + 1}. ${item}：${keyword}，认真履行职责`,
                        `${i + 1}. ${item}：${keyword}，服务大局需要`,
                        `${i + 1}. ${item}：${keyword}，提高工作水平`
                    ];
                } else {
                    details = [
                        `${i + 1}. ${item}: ${keyword}, seriously performing duties`,
                        `${i + 1}. ${item}: ${keyword}, serving the overall situation`,
                        `${i + 1}. ${item}: ${keyword}, improving work level`
                    ];
                }
                break;
            default: // freelancer
                if (language === 'zh-CN') {
                    details = [
                        `${i + 1}. ${item}：获得客户积极${keyword}`,
                        `${i + 1}. ${item}：${keyword}，项目进展顺利`,
                        `${i + 1}. ${item}：通过${keyword}，提升了服务质量`
                    ];
                } else {
                    details = [
                        `${i + 1}. ${item}: Received positive ${keyword} from clients`,
                        `${i + 1}. ${item}: ${keyword}, project progress smoothly`,
                        `${i + 1}. ${item}: Through ${keyword}, improved service quality`
                    ];
                }
        }
        reportContent += getRandomElement(details) + "\n";
    });
    
    // 第二部分：问题与解决
    if (problems && problems.length > 0) {
        reportContent += `\n【${structure[1]}】\n`;
        problems.forEach((item, i) => {
            let solutions;
            
            switch (styleKey) {
                case "internet":
                    if (language === 'zh-CN') {
                        solutions = [
                            `${i + 1}. 技术问题：${item}，已通过${getRandomElement(keywords)}解决`,
                            `${i + 1}. 体验问题：${item}，正在优化${getRandomElement(keywords)}方案`,
                            `${i + 1}. 协作问题：${item}，通过${getRandomElement(keywords)}改善沟通`
                        ];
                    } else {
                        solutions = [
                            `${i + 1}. Technical issue: ${item}, resolved through ${getRandomElement(keywords)}`,
                            `${i + 1}. Experience issue: ${item}, optimizing ${getRandomElement(keywords)} solution`,
                            `${i + 1}. Collaboration issue: ${item}, improved communication through ${getRandomElement(keywords)}`
                        ];
                    }
                    break;
                case "stateOwned":
                    if (language === 'zh-CN') {
                        solutions = [
                            `${i + 1}. 存在问题：${item}，需要${getRandomElement(keywords)}加以解决`,
                            `${i + 1}. 困难挑战：${item}，正在${getRandomElement(keywords)}协调推进`,
                            `${i + 1}. 不足之处：${item}，将${getRandomElement(keywords)}改进提升`
                        ];
                    } else {
                        solutions = [
                            `${i + 1}. Existing problem: ${item}, needs ${getRandomElement(keywords)} to solve`,
                            `${i + 1}. Difficulty challenge: ${item}, coordinating through ${getRandomElement(keywords)}`,
                            `${i + 1}. Shortcoming: ${item}, will improve through ${getRandomElement(keywords)}`
                        ];
                    }
                    break;
                case "foreign":
                    if (language === 'zh-CN') {
                        solutions = [
                            `${i + 1}. 挑战：${item}，通过${getRandomElement(keywords)}解决`,
                            `${i + 1}. 问题：${item}，解决方案涉及${getRandomElement(keywords)}`,
                            `${i + 1}. 困难：${item}，正在制定${getRandomElement(keywords)}方法`
                        ];
                    } else {
                        solutions = [
                            `${i + 1}. Challenge: ${item}, addressed through ${getRandomElement(keywords)}`,
                            `${i + 1}. Issue: ${item}, solution involves ${getRandomElement(keywords)}`,
                            `${i + 1}. Problem: ${item}, working on ${getRandomElement(keywords)} approach`
                        ];
                    }
                    break;
                case "government":
                    if (language === 'zh-CN') {
                        solutions = [
                            `${i + 1}. 存在问题：${item}，需要${getRandomElement(keywords)}`,
                            `${i + 1}. 不足之处：${item}，将${getRandomElement(keywords)}`,
                            `${i + 1}. 困难挑战：${item}，正在${getRandomElement(keywords)}`
                        ];
                    } else {
                        solutions = [
                            `${i + 1}. Existing problem: ${item}, needs ${getRandomElement(keywords)}`,
                            `${i + 1}. Shortcoming: ${item}, will ${getRandomElement(keywords)}`,
                            `${i + 1}. Difficulty challenge: ${item}, currently ${getRandomElement(keywords)}`
                        ];
                    }
                    break;
                default: // freelancer
                    if (language === 'zh-CN') {
                        solutions = [
                            `${i + 1}. 遇到的问题：${item}，通过${getRandomElement(keywords)}调整`,
                            `${i + 1}. 客户反馈：${item}，正在${getRandomElement(keywords)}改进`,
                            `${i + 1}. 时间管理：${item}，优化${getRandomElement(keywords)}安排`
                        ];
                    } else {
                        solutions = [
                            `${i + 1}. Problem encountered: ${item}, adjusted through ${getRandomElement(keywords)}`,
                            `${i + 1}. Client feedback: ${item}, improving through ${getRandomElement(keywords)}`,
                            `${i + 1}. Time management: ${item}, optimizing ${getRandomElement(keywords)} arrangement`
                        ];
                    }
            }
            reportContent += getRandomElement(solutions) + "\n";
        });
    }
    
    // 第三部分：下周计划
    if (plans && plans.length > 0) {
        reportContent += `\n【${structure[2]}】\n`;
        plans.forEach((item, i) => {
            let plansDetail;
            
            switch (styleKey) {
                case "internet":
                    if (language === 'zh-CN') {
                        plansDetail = [
                            `${i + 1}. ${item}：预计完成${getRandomElement(keywords)}功能`,
                            `${i + 1}. ${item}：进行${getRandomElement(keywords)}测试`,
                            `${i + 1}. ${item}：优化${getRandomElement(keywords)}性能`
                        ];
                    } else {
                        plansDetail = [
                            `${i + 1}. ${item}: Expected to complete ${getRandomElement(keywords)} feature`,
                            `${i + 1}. ${item}: Conduct ${getRandomElement(keywords)} testing`,
                            `${i + 1}. ${item}: Optimize ${getRandomElement(keywords)} performance`
                        ];
                    }
                    break;
                case "stateOwned":
                    if (language === 'zh-CN') {
                        plansDetail = [
                            `${i + 1}. ${item}：${getRandomElement(keywords)}，确保任务完成`,
                            `${i + 1}. ${item}：${getRandomElement(keywords)}，推进工作落实`,
                            `${i + 1}. ${item}：${getRandomElement(keywords)}，提高工作成效`
                        ];
                    } else {
                        plansDetail = [
                            `${i + 1}. ${item}: ${getRandomElement(keywords)}, ensuring task completion`,
                            `${i + 1}. ${item}: ${getRandomElement(keywords)}, promoting work implementation`,
                            `${i + 1}. ${item}: ${getRandomElement(keywords)}, improving work effectiveness`
                        ];
                    }
                    break;
                case "foreign":
                    if (language === 'zh-CN') {
                        plansDetail = [
                            `${i + 1}. ${item}：专注于${getRandomElement(keywords)}交付物`,
                            `${i + 1}. ${item}：计划${getRandomElement(keywords)}对齐`,
                            `${i + 1}. ${item}：安排${getRandomElement(keywords)}会议`
                        ];
                    } else {
                        plansDetail = [
                            `${i + 1}. ${item}: Focus on ${getRandomElement(keywords)} deliverables`,
                            `${i + 1}. ${item}: Plan for ${getRandomElement(keywords)} alignment`,
                            `${i + 1}. ${item}: Schedule ${getRandomElement(keywords)} meetings`
                        ];
                    }
                    break;
                case "government":
                    if (language === 'zh-CN') {
                        plansDetail = [
                            `${i + 1}. ${item}：${getRandomElement(keywords)}，认真组织实施`,
                            `${i + 1}. ${item}：${getRandomElement(keywords)}，确保取得实效`,
                            `${i + 1}. ${item}：${getRandomElement(keywords)}，提高工作水平`
                        ];
                    } else {
                        plansDetail = [
                            `${i + 1}. ${item}: ${getRandomElement(keywords)}, seriously organizing implementation`,
                            `${i + 1}. ${item}: ${getRandomElement(keywords)}, ensuring actual results`,
                            `${i + 1}. ${item}: ${getRandomElement(keywords)}, improving work level`
                        ];
                    }
                    break;
                default: // freelancer
                    if (language === 'zh-CN') {
                        plansDetail = [
                            `${i + 1}. ${item}：安排${getRandomElement(keywords)}时间`,
                            `${i + 1}. ${item}：准备${getRandomElement(keywords)}材料`,
                            `${i + 1}. ${item}：进行${getRandomElement(keywords)}沟通`
                        ];
                    } else {
                        plansDetail = [
                            `${i + 1}. ${item}: Arrange ${getRandomElement(keywords)} time`,
                            `${i + 1}. ${item}: Prepare ${getRandomElement(keywords)} materials`,
                            `${i + 1}. ${item}: Conduct ${getRandomElement(keywords)} communication`
                        ];
                    }
            }
            reportContent += getRandomElement(plansDetail) + "\n";
        });
    }
    
    // 生成时间戳
    let generatedAt;
    if (language === 'zh-CN') {
        generatedAt = new Date().toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
    } else {
        generatedAt = new Date().toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
    }
    
    return {
        content: reportContent,
        style: styleName,
        generated_at: generatedAt
    };
}
