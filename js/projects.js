// 初始化
function init() {
    renderProjects();
}

// 渲染项目列表
function renderProjects() {
    const projectsGrid = document.getElementById('projectsGrid');
    const projects = JSON.parse(localStorage.getItem('projects') || '{}');
    
    projectsGrid.innerHTML = '';
    
    Object.entries(projects).forEach(([id, project]) => {
        const card = createProjectCard(id, project);
        projectsGrid.appendChild(card);
    });
}

// 创建项目卡片
function createProjectCard(id, project) {
    const card = document.createElement('div');
    card.className = 'project-card';
    
    const progress = calculateProgress(project);
    const totalCost = calculateTotalCost(project);
    const status = project.basicInfo.projectStatus || '进行中';
    
    card.innerHTML = `
        <div class="card-header">
            <h3>${project.basicInfo.projectName || '未命名项目'}</h3>
            <div class="card-status">
                <span class="status-badge ${status}">${status}</span>
                <span class="progress-badge">${progress}%</span>
            </div>
        </div>
        <div class="card-content">
            <div class="info-row">
                <span>地址：</span>
                <span>${project.basicInfo.projectLocation || '未设置'}</span>
            </div>
            <div class="info-row">
                <span>设计师：</span>
                <span>${project.basicInfo.designer || '未设置'}</span>
            </div>
            <div class="info-row">
                <span>监理：</span>
                <span>${project.basicInfo.supervisor || '未设置'}</span>
            </div>
            <div class="info-row">
                <span>总成本：</span>
                <span class="cost">¥${totalCost.toLocaleString()}</span>
            </div>
        </div>
        <div class="card-actions">
            <button onclick="openProject('${id}')">查看详情</button>
            <button onclick="duplicateProject('${id}')">复制项目</button>
            <button onclick="deleteProject('${id}')" class="delete-btn">删除</button>
        </div>
    `;
    
    return card;
}

// 计算项目进度
function calculateProgress(project) {
    const totalItems = project.materials.length + project.furniture.length;
    if (totalItems === 0) return 0;
    
    const completedItems = 
        project.materials.filter(item => item.status === '是').length +
        project.furniture.filter(item => item.status === '是').length;
    
    return Math.round((completedItems / totalItems) * 100);
}

// 计算项目总成本
function calculateTotalCost(project) {
    const materialCost = project.materials.reduce((sum, item) => sum + (Number(item.cost) || 0), 0);
    const furnitureCost = project.furniture.reduce((sum, item) => sum + (Number(item.cost) || 0), 0);
    const constructionCost = project.construction.reduce((sum, item) => sum + (Number(item.cost) || 0), 0);
    return materialCost + furnitureCost + constructionCost;
}

// 创建新项目
function createNewProject() {
    const id = 'project_' + Date.now();
    const projects = JSON.parse(localStorage.getItem('projects') || '{}');
    
    projects[id] = {
        basicInfo: {
            projectName: '',
            projectLocation: '',
            designer: '',
            supervisor: '',
            projectStatus: '进行中'
        },
        materials: [],
        furniture: [],
        construction: [],
        summary: {
            issues: '',
            lessons: ''
        }
    };
    
    localStorage.setItem('projects', JSON.stringify(projects));
    window.location.href = `${BASE_URL}/project.html?id=${id}`;
}

// 打开项目详情页
function openProject(id) {
    window.location.href = `${BASE_URL}/project.html?id=${id}`;
}

// 搜索项目
function searchProjects(keyword) {
    const projectCards = document.querySelectorAll('.project-card');
    keyword = keyword.toLowerCase();
    
    projectCards.forEach(card => {
        const content = card.textContent.toLowerCase();
        card.style.display = content.includes(keyword) ? 'block' : 'none';
    });
}

// 复制项目
function duplicateProject(id) {
    const projects = JSON.parse(localStorage.getItem('projects') || '{}');
    const sourceProject = projects[id];
    
    if (!sourceProject) {
        alert('找不到源项目');
        return;
    }
    
    // 创建新项目ID
    const newId = 'project_' + Date.now();
    
    // 深拷贝项目数据
    projects[newId] = JSON.parse(JSON.stringify(sourceProject));
    projects[newId].basicInfo.projectName += ' (副本)';
    
    // 保存到localStorage
    localStorage.setItem('projects', JSON.stringify(projects));
    
    // 刷新项目列表
    renderProjects();
}

// 删除项目
function deleteProject(id) {
    if (!confirm('确定要删除这个项目吗？此操作不可恢复。')) {
        return;
    }
    
    const projects = JSON.parse(localStorage.getItem('projects') || '{}');
    delete projects[id];
    localStorage.setItem('projects', JSON.stringify(projects));
    
    // 刷新项目列表
    renderProjects();
}

// 添加导出功能
function exportProjects() {
    try {
        const projects = localStorage.getItem('projects');
        if (!projects || projects === '{}') {
            alert('没有可导出的项目数据');
            return;
        }

        // 创建下载文件
        const date = new Date().toLocaleDateString().replace(/\//g, '-');
        const blob = new Blob([projects], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `项目管理系统数据备份_${date}.json`;
        
        // 触发下载
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        // 显示成功提示
        showNotification('项目数据导出成功', 'success');
    } catch (error) {
        console.error('导出失败:', error);
        showNotification('导出失败，请重试', 'error');
    }
}

// 添加导入功能
function importProjects(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            // 验证JSON格式
            const importedData = JSON.parse(e.target.result);
            
            // 验证数据结构
            if (typeof importedData !== 'object') {
                throw new Error('数据格式不正确');
            }

            // 合并现有数据和导入数据
            const currentProjects = JSON.parse(localStorage.getItem('projects') || '{}');
            const mergedProjects = { ...currentProjects, ...importedData };
            
            // 保存合并后的数据
            localStorage.setItem('projects', JSON.stringify(mergedProjects));
            
            // 刷新项目列表
            renderProjects();
            
            // 显示成功提示
            showNotification('项目数据导入成功', 'success');
        } catch (error) {
            console.error('导入失败:', error);
            showNotification('导入失败，文件格式不正确', 'error');
        }
    };

    reader.onerror = function() {
        showNotification('文件读取失败', 'error');
    };

    reader.readAsText(file);
    
    // 清除文件选择，允许重复选择同一文件
    event.target.value = '';
}

// 添加通知功能
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 12px 24px;
        border-radius: 4px;
        color: white;
        font-weight: 500;
        z-index: 1000;
        animation: fadeInOut 2.5s ease-in-out forwards;
    `;

    // 根据类型设置背景色
    const colors = {
        success: '#4caf50',
        error: '#f44336',
        info: '#2196f3'
    };
    notification.style.backgroundColor = colors[type];

    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 2500);
}

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', init); 
