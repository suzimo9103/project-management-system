// 获取当前项目ID
const urlParams = new URLSearchParams(window.location.search);
const currentProjectId = urlParams.get('id');

// 验证项目ID
if (!currentProjectId) {
    alert('项目ID无效');
    window.location.href = `${BASE_URL}/index.html`;
    return;
}

// 获取项目数据
const projects = JSON.parse(localStorage.getItem('projects') || '{}');
const project = projects[currentProjectId];

if (!project) {
    alert('找不到项目数据');
    window.location.href = `${BASE_URL}/index.html`;
    return;
}

// 初始化页面数据
function initializeProject() {
    // 设置基本信息
    document.getElementById('projectName').value = project.basicInfo.projectName || '';
    document.getElementById('projectLocation').value = project.basicInfo.projectLocation || '';
    document.getElementById('designer').value = project.basicInfo.designer || '';
    document.getElementById('supervisor').value = project.basicInfo.supervisor || '';
    document.getElementById('projectStatus').value = project.basicInfo.projectStatus || '进行中';
    
    // 渲染表格数据
    renderMaterialTable();
    renderFurnitureTable();
    renderConstructionTable();
    
    // 设置项目总结
    document.getElementById('projectIssues').value = project.summary?.issues || '';
    document.getElementById('projectLessons').value = project.summary?.lessons || '';
    
    // 更新成本统计
    updateCostSummary();
    
    // 更新进度条
    updateProgress();
    
    // 添加自动保存
    setupAutoSave();
}

// 渲染主材表格
function renderMaterialTable() {
    const tbody = document.querySelector('#materialTable tbody');
    tbody.innerHTML = '';
    
    project.materials.forEach((material, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><textarea class="material-name">${material.name || ''}</textarea></td>
            <td><textarea class="material-buyer">${material.buyer || ''}</textarea></td>
            <td>
                <select class="material-status">
                    <option value="否" ${material.status === '否' ? 'selected' : ''}>否</option>
                    <option value="是" ${material.status === '是' ? 'selected' : ''}>是</option>
                </select>
            </td>
            <td><textarea class="material-location">${material.location || ''}</textarea></td>
            <td><textarea class="material-notes">${material.notes || ''}</textarea></td>
            <td><input type="number" class="material-cost" value="${material.cost || ''}"></td>
            <td><button onclick="deleteMaterialRow(${index})">删除</button></td>
        `;
        tbody.appendChild(tr);
    });
    
    // 自动调整所有textarea的高度
    adjustTextareaHeights();
}

// 渲染软装表格
function renderFurnitureTable() {
    const tbody = document.querySelector('#furnitureTable tbody');
    tbody.innerHTML = '';
    
    project.furniture.forEach((item, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><textarea class="furniture-name">${item.name || ''}</textarea></td>
            <td><textarea class="furniture-buyer">${item.buyer || ''}</textarea></td>
            <td>
                <select class="furniture-status">
                    <option value="否" ${item.status === '否' ? 'selected' : ''}>否</option>
                    <option value="是" ${item.status === '是' ? 'selected' : ''}>是</option>
                </select>
            </td>
            <td><textarea class="furniture-location">${item.location || ''}</textarea></td>
            <td><textarea class="furniture-notes">${item.notes || ''}</textarea></td>
            <td><input type="number" class="furniture-cost" value="${item.cost || ''}"></td>
            <td><button onclick="deleteFurnitureRow(${index})">删除</button></td>
        `;
        tbody.appendChild(tr);
    });
    
    // 自动调整所有textarea的高度
    adjustTextareaHeights();
}

// 渲染施工表格
function renderConstructionTable() {
    const tbody = document.querySelector('#constructionTable tbody');
    tbody.innerHTML = '';
    
    project.construction.forEach((item, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><textarea class="construction-type">${item.type || ''}</textarea></td>
            <td><textarea class="construction-name">${item.name || ''}</textarea></td>
            <td><textarea class="construction-period">${item.period || ''}</textarea></td>
            <td><input type="number" class="construction-cost" value="${item.cost || ''}"></td>
            <td><textarea class="construction-contact">${item.contact || ''}</textarea></td>
            <td><textarea class="construction-notes">${item.notes || ''}</textarea></td>
            <td><button onclick="deleteConstructionRow(${index})">删除</button></td>
        `;
        tbody.appendChild(tr);
    });
    
    // 自动调整所有textarea的高度
    adjustTextareaHeights();
}

// 添加主材行
function addMaterialRow() {
    project.materials.push({
        name: '',
        buyer: '',
        status: '否',
        location: '',
        notes: '',
        cost: ''
    });
    renderMaterialTable();
    saveProject();
}

// 添加软装行
function addFurnitureRow() {
    project.furniture.push({
        name: '',
        buyer: '',
        status: '否',
        location: '',
        notes: '',
        cost: ''
    });
    renderFurnitureTable();
    saveProject();
}

// 添加施工行
function addConstructionRow() {
    project.construction.push({
        type: '',
        name: '',
        period: '',
        cost: '',
        contact: '',
        notes: ''
    });
    renderConstructionTable();
    saveProject();
}

// 删除主材行
function deleteMaterialRow(index) {
    if (confirm('确定要删除这一项吗？')) {
        project.materials.splice(index, 1);
        renderMaterialTable();
        saveProject();
    }
}

// 删除软装行
function deleteFurnitureRow(index) {
    if (confirm('确定要删除这一项吗？')) {
        project.furniture.splice(index, 1);
        renderFurnitureTable();
        saveProject();
    }
}

// 删除施工行
function deleteConstructionRow(index) {
    if (confirm('确定要删除这一项吗？')) {
        project.construction.splice(index, 1);
        renderConstructionTable();
        saveProject();
    }
}

// 快速添加主材
function quickAddMaterial(name, notes = '') {
    project.materials.push({
        name: name,
        buyer: '',
        status: '否',
        location: '',
        notes: notes,
        cost: ''
    });
    renderMaterialTable();
    saveProject();
    
    // 关闭下拉菜单
    document.querySelector('.dropdown-content').classList.remove('active');
}

// 快速添加软装
function quickAddFurniture(name, notes = '') {
    project.furniture.push({
        name: name,
        buyer: '',
        status: '否',
        location: '',
        notes: notes,
        cost: ''
    });
    renderFurnitureTable();
    saveProject();
    
    // 关闭下拉菜单
    document.querySelector('.dropdown-content').classList.remove('active');
}

// 更新成本统计
function updateCostSummary() {
    const materialTotal = project.materials.reduce((sum, item) => sum + (Number(item.cost) || 0), 0);
    const furnitureTotal = project.furniture.reduce((sum, item) => sum + (Number(item.cost) || 0), 0);
    const constructionTotal = project.construction.reduce((sum, item) => sum + (Number(item.cost) || 0), 0);
    
    document.getElementById('materialTotalCost').textContent = materialTotal.toLocaleString();
    document.getElementById('furnitureTotalCost').textContent = furnitureTotal.toLocaleString();
    document.getElementById('constructionTotalCost').textContent = constructionTotal.toLocaleString();
    document.getElementById('totalCost').textContent = (materialTotal + furnitureTotal + constructionTotal).toLocaleString();
}

// 更新进度
function updateProgress() {
    // 计算主材进度
    const materialTotal = project.materials.length;
    const materialCompleted = project.materials.filter(item => item.status === '是').length;
    const materialProgress = materialTotal ? Math.round((materialCompleted / materialTotal) * 100) : 0;
    
    // 计算软装进度
    const furnitureTotal = project.furniture.length;
    const furnitureCompleted = project.furniture.filter(item => item.status === '是').length;
    const furnitureProgress = furnitureTotal ? Math.round((furnitureCompleted / furnitureTotal) * 100) : 0;
    
    // 计算总进度
    const totalProgress = Math.round((materialProgress + furnitureProgress) / 2);
    
    // 更新进度条
    document.getElementById('materialProgressText').textContent = `${materialProgress}%`;
    document.getElementById('furnitureProgressText').textContent = `${furnitureProgress}%`;
    document.getElementById('totalProgressText').textContent = `${totalProgress}%`;
    
    // 更新进度条填充
    document.getElementById('materialProgress').style.width = `${materialProgress}%`;
    document.getElementById('furnitureProgress').style.width = `${furnitureProgress}%`;
    document.getElementById('totalProgress').style.width = `${totalProgress}%`;
}

// 保存项目
function saveProject() {
    projects[currentProjectId] = project;
    localStorage.setItem('projects', JSON.stringify(projects));
    updateCostSummary();
    updateProgress();
}

// 设置自动保存
function setupAutoSave() {
    // 监听基本信息变化
    document.getElementById('projectName').addEventListener('input', function() {
        project.basicInfo.projectName = this.value;
        saveProject();
    });
    
    document.getElementById('projectLocation').addEventListener('input', function() {
        project.basicInfo.projectLocation = this.value;
        saveProject();
    });
    
    document.getElementById('designer').addEventListener('input', function() {
        project.basicInfo.designer = this.value;
        saveProject();
    });
    
    document.getElementById('supervisor').addEventListener('input', function() {
        project.basicInfo.supervisor = this.value;
        saveProject();
    });
    
    document.getElementById('projectStatus').addEventListener('change', function() {
        project.basicInfo.projectStatus = this.value;
        saveProject();
    });
    
    // 监听项目总结变化
    document.getElementById('projectIssues').addEventListener('input', function() {
        if (!project.summary) project.summary = {};
        project.summary.issues = this.value;
        saveProject();
    });
    
    document.getElementById('projectLessons').addEventListener('input', function() {
        if (!project.summary) project.summary = {};
        project.summary.lessons = this.value;
        saveProject();
    });
    
    // 监听表格变化
    document.addEventListener('input', function(e) {
        const target = e.target;
        const row = target.closest('tr');
        if (!row) return;
        
        const index = Array.from(row.parentNode.children).indexOf(row);
        
        // 主材表格
        if (target.classList.contains('material-name')) {
            project.materials[index].name = target.value;
        } else if (target.classList.contains('material-buyer')) {
            project.materials[index].buyer = target.value;
        } else if (target.classList.contains('material-status')) {
            project.materials[index].status = target.value;
        } else if (target.classList.contains('material-location')) {
            project.materials[index].location = target.value;
        } else if (target.classList.contains('material-notes')) {
            project.materials[index].notes = target.value;
        } else if (target.classList.contains('material-cost')) {
            project.materials[index].cost = target.value;
        }
        
        // 软装表格
        else if (target.classList.contains('furniture-name')) {
            project.furniture[index].name = target.value;
        } else if (target.classList.contains('furniture-buyer')) {
            project.furniture[index].buyer = target.value;
        } else if (target.classList.contains('furniture-status')) {
            project.furniture[index].status = target.value;
        } else if (target.classList.contains('furniture-location')) {
            project.furniture[index].location = target.value;
        } else if (target.classList.contains('furniture-notes')) {
            project.furniture[index].notes = target.value;
        } else if (target.classList.contains('furniture-cost')) {
            project.furniture[index].cost = target.value;
        }
        
        // 施工表格
        else if (target.classList.contains('construction-type')) {
            project.construction[index].type = target.value;
        } else if (target.classList.contains('construction-name')) {
            project.construction[index].name = target.value;
        } else if (target.classList.contains('construction-period')) {
            project.construction[index].period = target.value;
        } else if (target.classList.contains('construction-cost')) {
            project.construction[index].cost = target.value;
        } else if (target.classList.contains('construction-contact')) {
            project.construction[index].contact = target.value;
        } else if (target.classList.contains('construction-notes')) {
            project.construction[index].notes = target.value;
        }
        
        saveProject();
    });
}

// 导出项目数据为JSON
function exportToJSON() {
    const data = {};
    data[currentProjectId] = project;
    
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `项目数据_${project.basicInfo.projectName || '未命名'}_${new Date().toLocaleDateString()}.json`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// 导出为Excel
function exportExcel() {
    const workbook = new ExcelJS.Workbook();
    
    // 添加主材表
    const materialSheet = workbook.addWorksheet('主材清单');
    materialSheet.columns = [
        { header: '名称', key: 'name' },
        { header: '采购人', key: 'buyer' },
        { header: '是否采购', key: 'status' },
        { header: '采购位置', key: 'location' },
        { header: '备注', key: 'notes' },
        { header: '金额', key: 'cost' }
    ];
    materialSheet.addRows(project.materials);
    
    // 添加软装表
    const furnitureSheet = workbook.addWorksheet('软装清单');
    furnitureSheet.columns = [
        { header: '名称', key: 'name' },
        { header: '采购人', key: 'buyer' },
        { header: '是否采购', key: 'status' },
        { header: '采购位置', key: 'location' },
        { header: '备注', key: 'notes' },
        { header: '金额', key: 'cost' }
    ];
    furnitureSheet.addRows(project.furniture);
    
    // 添加施工表
    const constructionSheet = workbook.addWorksheet('施工清单');
    constructionSheet.columns = [
        { header: '施工工种', key: 'type' },
        { header: '名称', key: 'name' },
        { header: '周期', key: 'period' },
        { header: '金额', key: 'cost' },
        { header: '联系方式', key: 'contact' },
        { header: '备注', key: 'notes' }
    ];
    constructionSheet.addRows(project.construction);
    
    // 导出文件
    workbook.xlsx.writeBuffer().then(buffer => {
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `项目清单_${project.basicInfo.projectName || '未命名'}_${new Date().toLocaleDateString()}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    });
}

// 自动调整textarea高度
function adjustTextareaHeights() {
    document.querySelectorAll('textarea').forEach(textarea => {
        textarea.style.height = '0';
        textarea.style.height = (textarea.scrollHeight + 2) + 'px';
        const td = textarea.closest('td');
        if (td) {
            td.style.height = 'auto';
        }
    });
}

// 初始化下拉菜单交互
document.addEventListener('DOMContentLoaded', function() {
    const dropdowns = document.querySelectorAll('.quick-add-dropdown');
    
    dropdowns.forEach(dropdown => {
        const btn = dropdown.querySelector('.quick-add-btn');
        const content = dropdown.querySelector('.dropdown-content');
        
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            content.classList.toggle('active');
        });
    });
    
    // 点击其他地方关闭下拉菜单
    document.addEventListener('click', () => {
        document.querySelectorAll('.dropdown-content').forEach(content => {
            content.classList.remove('active');
        });
    });
    
    // 初始化项目
    initializeProject();
}); 
