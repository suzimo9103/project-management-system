let currentProjectId = null;  // 当前项目ID

// 全局数据对象
let projectData = {
    basicInfo: {
        projectName: '',
        projectLocation: '',
        designer: '',
        supervisor: ''
    },
    materials: [],
    furniture: [],
    construction: [],
    summary: {
        issues: '',
        lessons: ''
    }
};

// 初始化函数
function init() {
    // 从 URL 获取项目 ID
    const urlParams = new URLSearchParams(window.location.search);
    currentProjectId = urlParams.get('id');
    
    if (!currentProjectId) {
        alert('项目ID无效');
        window.location.href = 'index.html';
        return;
    }

    // 从 localStorage 加载项目数据
    const projects = JSON.parse(localStorage.getItem('projects') || '{}');
    const project = projects[currentProjectId];
    
    if (!project) {
        alert('找不到项目数据');
        window.location.href = 'index.html';
        return;
    }

    // 加载项目数据到全局变量
    projectData = project;
    
    // 加载数据到UI
    loadDataToUI();
    
    // 添加事件监听器
    addEventListeners();
}

// 添加主材行
function addMaterialRow() {
    const tbody = document.querySelector('#materialTable tbody');
    const newRow = tbody.insertRow();
    newRow.innerHTML = `
        <td><textarea class="material-name" rows="1"></textarea></td>
        <td>
            <select class="material-buyer">
                <option value="设计师">设计师</option>
                <option value="监理">监理</option>
                <option value="业主">业主</option>
            </select>
        </td>
        <td>
            <select class="material-status">
                <option value="否">否</option>
                <option value="是">是</option>
            </select>
        </td>
        <td><textarea class="material-location" rows="1"></textarea></td>
        <td><textarea class="material-note" rows="1"></textarea></td>
        <td><input type="number" class="material-cost" onchange="updateCostSummary()"></td>
        <td><button onclick="deleteRow(this)">删除</button></td>
    `;
    addRowChangeListeners(newRow, 'materials');
}

// 添加软装行
function addFurnitureRow() {
    const tbody = document.querySelector('#furnitureTable tbody');
    const newRow = tbody.insertRow();
    newRow.innerHTML = `
        <td><textarea class="furniture-name" rows="1"></textarea></td>
        <td>
            <select class="furniture-buyer">
                <option value="设计师">设计师</option>
                <option value="监理">监理</option>
                <option value="业主">业主</option>
            </select>
        </td>
        <td>
            <select class="furniture-status">
                <option value="否">否</option>
                <option value="是">是</option>
            </select>
        </td>
        <td><textarea class="furniture-location" rows="1"></textarea></td>
        <td><textarea class="furniture-note" rows="1"></textarea></td>
        <td><input type="number" class="furniture-cost" onchange="updateCostSummary()"></td>
        <td><button onclick="deleteRow(this)">删除</button></td>
    `;
    addRowChangeListeners(newRow, 'furniture');
}

// 添加施工行
function addConstructionRow() {
    const tbody = document.querySelector('#constructionTable tbody');
    const newRow = tbody.insertRow();
    newRow.innerHTML = `
        <td><textarea class="construction-type" rows="1"></textarea></td>
        <td><textarea class="construction-name" rows="1"></textarea></td>
        <td><textarea class="construction-period" rows="1"></textarea></td>
        <td><input type="number" class="construction-cost" onchange="updateCostSummary()"></td>
        <td><textarea class="construction-contact" rows="1"></textarea></td>
        <td><textarea class="construction-note" rows="1"></textarea></td>
        <td><button onclick="deleteRow(this)">删除</button></td>
    `;
    addRowChangeListeners(newRow, 'construction');
}

// 删除行
function deleteRow(button) {
    const row = button.parentNode.parentNode;
    const table = row.parentNode.parentNode;
    const rowIndex = row.rowIndex - 1;
    
    let dataArray;
    if (table.id === 'materialTable') dataArray = projectData.materials;
    else if (table.id === 'furnitureTable') dataArray = projectData.furniture;
    else if (table.id === 'constructionTable') dataArray = projectData.construction;
    
    dataArray.splice(rowIndex, 1);
    row.remove();
    updateCostSummary();
    saveToLocalStorage();
}

// 更新成本统计
function updateCostSummary() {
    const materialTotal = calculateTotal('#materialTable .material-cost');
    const furnitureTotal = calculateTotal('#furnitureTable .furniture-cost');
    const constructionTotal = calculateTotal('#constructionTable .construction-cost');
    
    document.getElementById('materialTotalCost').textContent = `¥${materialTotal.toLocaleString()}`;
    document.getElementById('furnitureTotalCost').textContent = `¥${furnitureTotal.toLocaleString()}`;
    document.getElementById('constructionTotalCost').textContent = `¥${constructionTotal.toLocaleString()}`;
    document.getElementById('totalCost').textContent = `¥${(materialTotal + furnitureTotal + constructionTotal).toLocaleString()}`;
}

// 计算总额
function calculateTotal(selector) {
    return Array.from(document.querySelectorAll(selector))
        .reduce((sum, input) => sum + (Number(input.value) || 0), 0);
}

// 保存到localStorage
function saveToLocalStorage() {
    const projects = JSON.parse(localStorage.getItem('projects') || '{}');
    projects[currentProjectId] = projectData;
    localStorage.setItem('projects', JSON.stringify(projects));
    showSaveNotification();
}

// 从localStorage加载
function loadFromLocalStorage() {
    const saved = localStorage.getItem('projectData');
    if (saved) {
        projectData = JSON.parse(saved);
        loadDataToUI();
    }
}

// 显示通知
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 4px;
        color: white;
        font-weight: 500;
        z-index: 10000;
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

// 添加相关的CSS样式
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInOut {
        0% { opacity: 0; transform: translateY(20px); }
        10% { opacity: 1; transform: translateY(0); }
        90% { opacity: 1; transform: translateY(0); }
        100% { opacity: 0; transform: translateY(-20px); }
    }

    .notification {
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
`;
document.head.appendChild(style);

// 添加行变化监听器
function addRowChangeListeners(row, type) {
    const inputs = row.querySelectorAll('input, select, textarea');
    const rowData = {};
    
    inputs.forEach(input => {
        input.addEventListener('change', function() {
            const rowInputs = row.querySelectorAll('input, select, textarea');
            
            if (type === 'materials' || type === 'furniture') {
                rowData.name = rowInputs[0].value;
                rowData.buyer = rowInputs[1].value;
                rowData.status = rowInputs[2].value;
                rowData.location = rowInputs[3].value;
                rowData.note = rowInputs[4].value;
                rowData.cost = Number(rowInputs[5].value) || 0;
            } else if (type === 'construction') {
                rowData.type = rowInputs[0].value;
                rowData.name = rowInputs[1].value;
                rowData.period = rowInputs[2].value;
                rowData.cost = Number(rowInputs[3].value) || 0;
                rowData.contact = rowInputs[4].value;
                rowData.note = rowInputs[5].value;
            }
            
            const tbody = row.parentNode;
            const rowIndex = Array.from(tbody.children).indexOf(row);
            
            if (rowIndex === projectData[type].length) {
                projectData[type].push(rowData);
            } else {
                projectData[type][rowIndex] = rowData;
            }
            
            saveToLocalStorage();
            updateCostSummary();
        });
    });
}

// 将数据加载到UI
function loadDataToUI() {
    console.log('开始加载数据到UI'); // 添加调试日志
    
    // 加载基本信息
    document.getElementById('projectName').value = projectData.basicInfo.projectName || '';
    document.getElementById('projectLocation').value = projectData.basicInfo.projectLocation || '';
    document.getElementById('designer').value = projectData.basicInfo.designer || '';
    document.getElementById('supervisor').value = projectData.basicInfo.supervisor || '';
    
    // 加载主材数据
    const materialTbody = document.querySelector('#materialTable tbody');
    materialTbody.innerHTML = '';
    if (Array.isArray(projectData.materials)) {
        projectData.materials.forEach(material => {
            const row = materialTbody.insertRow();
            row.innerHTML = `
                <td><textarea class="material-name" rows="1">${material.name || ''}</textarea></td>
                <td>
                    <select class="material-buyer">
                        <option value="设计师" ${material.buyer === '设计师' ? 'selected' : ''}>设计师</option>
                        <option value="监理" ${material.buyer === '监理' ? 'selected' : ''}>监理</option>
                        <option value="业主" ${material.buyer === '业主' ? 'selected' : ''}>业主</option>
                    </select>
                </td>
                <td>
                    <select class="material-status">
                        <option value="否" ${material.status === '否' ? 'selected' : ''}>否</option>
                        <option value="是" ${material.status === '是' ? 'selected' : ''}>是</option>
                    </select>
                </td>
                <td><textarea class="material-location" rows="1">${material.location || ''}</textarea></td>
                <td><textarea class="material-note" rows="1">${material.note || ''}</textarea></td>
                <td><input type="number" class="material-cost" value="${material.cost || 0}" onchange="updateCostSummary()"></td>
                <td><button onclick="deleteRow(this)">删除</button></td>
            `;
            addRowChangeListeners(row, 'materials');
        });
    }
    
    // 加载软装数据
    const furnitureTbody = document.querySelector('#furnitureTable tbody');
    furnitureTbody.innerHTML = '';
    if (Array.isArray(projectData.furniture)) {
        projectData.furniture.forEach(furniture => {
            const row = furnitureTbody.insertRow();
            row.innerHTML = `
                <td><textarea class="furniture-name" rows="1">${furniture.name || ''}</textarea></td>
                <td>
                    <select class="furniture-buyer">
                        <option value="设计师" ${furniture.buyer === '设计师' ? 'selected' : ''}>设计师</option>
                        <option value="监理" ${furniture.buyer === '监理' ? 'selected' : ''}>监理</option>
                        <option value="业主" ${furniture.buyer === '业主' ? 'selected' : ''}>业主</option>
                    </select>
                </td>
                <td>
                    <select class="furniture-status">
                        <option value="否" ${furniture.status === '否' ? 'selected' : ''}>否</option>
                        <option value="是" ${furniture.status === '是' ? 'selected' : ''}>是</option>
                    </select>
                </td>
                <td><textarea class="furniture-location" rows="1">${furniture.location || ''}</textarea></td>
                <td><textarea class="furniture-note" rows="1">${furniture.note || ''}</textarea></td>
                <td><input type="number" class="furniture-cost" value="${furniture.cost || 0}" onchange="updateCostSummary()"></td>
                <td><button onclick="deleteRow(this)">删除</button></td>
            `;
            addRowChangeListeners(row, 'furniture');
        });
    }
    
    // 加载施工数据
    const constructionTbody = document.querySelector('#constructionTable tbody');
    constructionTbody.innerHTML = '';
    if (Array.isArray(projectData.construction)) {
        projectData.construction.forEach(construction => {
            const row = constructionTbody.insertRow();
            row.innerHTML = `
                <td><textarea class="construction-type" rows="1">${construction.type || ''}</textarea></td>
                <td><textarea class="construction-name" rows="1">${construction.name || ''}</textarea></td>
                <td><textarea class="construction-period" rows="1">${construction.period || ''}</textarea></td>
                <td><input type="number" class="construction-cost" value="${construction.cost || 0}" onchange="updateCostSummary()"></td>
                <td><textarea class="construction-contact" rows="1">${construction.contact || ''}</textarea></td>
                <td><textarea class="construction-note" rows="1">${construction.note || ''}</textarea></td>
                <td><button onclick="deleteRow(this)">删除</button></td>
            `;
            addRowChangeListeners(row, 'construction');
        });
    }
    
    // 加载项目总结
    document.getElementById('projectIssues').value = projectData.summary.issues || '';
    document.getElementById('projectLessons').value = projectData.summary.lessons || '';
    
    // 更新成本统计
    updateCostSummary();
    
    // 加载项目状态
    document.getElementById('projectStatus').value = projectData.basicInfo.projectStatus || '进行中';
    
    console.log('数据加载完成'); // 添加调试日志
}

// 显示加载动画
function showLoading() {
    document.querySelector('.loading').classList.add('active');
}

// 隐藏加载动画
function hideLoading() {
    document.querySelector('.loading').classList.remove('active');
}

// 显示保存提示
function showSaveNotification() {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background-color: #4caf50;
        color: white;
        padding: 10px 20px;
        border-radius: 4px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        animation: fadeInOut 2s ease-in-out forwards;
    `;
    notification.textContent = '已自动保存';
    document.body.appendChild(notification);

    setTimeout(() => {
        document.body.removeChild(notification);
    }, 2000);
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init);

// 快速添加主材
function quickAddMaterial(name, note) {
    const tbody = document.querySelector('#materialTable tbody');
    const newRow = tbody.insertRow();
    newRow.innerHTML = `
        <td><textarea class="material-name" rows="1">${name}</textarea></td>
        <td>
            <select class="material-buyer">
                <option value="设计师">设计师</option>
                <option value="监理">监理</option>
                <option value="业主">业主</option>
            </select>
        </td>
        <td>
            <select class="material-status">
                <option value="否">否</option>
                <option value="是">是</option>
            </select>
        </td>
        <td><textarea class="material-location" rows="1"></textarea></td>
        <td><textarea class="material-note" rows="1"></textarea></td>
        <td><input type="number" class="material-cost" onchange="updateCostSummary()"></td>
        <td><button onclick="deleteRow(this)">删除</button></td>
    `;
    addRowChangeListeners(newRow, 'materials');
}

// 快速添加软装
function quickAddFurniture(name, note) {
    const tbody = document.querySelector('#furnitureTable tbody');
    const newRow = tbody.insertRow();
    newRow.innerHTML = `
        <td><textarea class="furniture-name" rows="1">${name}</textarea></td>
        <td>
            <select class="furniture-buyer">
                <option value="设计师">设计师</option>
                <option value="监理">监理</option>
                <option value="业主">业主</option>
            </select>
        </td>
        <td>
            <select class="furniture-status">
                <option value="否">否</option>
                <option value="是">是</option>
            </select>
        </td>
        <td><textarea class="furniture-location" rows="1"></textarea></td>
        <td><textarea class="furniture-note" rows="1"></textarea></td>
        <td><input type="number" class="furniture-cost" onchange="updateCostSummary()"></td>
        <td><button onclick="deleteRow(this)">删除</button></td>
    `;
    addRowChangeListeners(newRow, 'furniture');
}

// 导出数据到JSON文件
function exportToJSON() {
    try {
        // 收集当前页面数据
        const exportData = {
            basicInfo: {
                projectName: document.getElementById('projectName').value || '',
                projectLocation: document.getElementById('projectLocation').value || '',
                designer: document.getElementById('designer').value || '',
                supervisor: document.getElementById('supervisor').value || ''
            },
            materials: [],
            furniture: [],
            construction: [],
            summary: {
                issues: document.getElementById('projectIssues').value || '',
                lessons: document.getElementById('projectLessons').value || ''
            }
        };

        // 收集主材数据
        document.querySelectorAll('#materialTable tbody tr').forEach(row => {
            if (row.querySelector('.material-name')) {
                exportData.materials.push({
                    name: row.querySelector('.material-name').value || '',
                    buyer: row.querySelector('.material-buyer').value || '',
                    status: row.querySelector('.material-status').value || '',
                    location: row.querySelector('.material-location').value || '',
                    note: row.querySelector('.material-note').value || '',
                    cost: Number(row.querySelector('.material-cost').value) || 0
                });
            }
        });

        // 收集软装数据
        document.querySelectorAll('#furnitureTable tbody tr').forEach(row => {
            if (row.querySelector('.furniture-name')) {
                exportData.furniture.push({
                    name: row.querySelector('.furniture-name').value || '',
                    buyer: row.querySelector('.furniture-buyer').value || '',
                    status: row.querySelector('.furniture-status').value || '',
                    location: row.querySelector('.furniture-location').value || '',
                    note: row.querySelector('.furniture-note').value || '',
                    cost: Number(row.querySelector('.furniture-cost').value) || 0
                });
            }
        });

        // 收集施工数据
        document.querySelectorAll('#constructionTable tbody tr').forEach(row => {
            if (row.querySelector('.construction-type')) {
                exportData.construction.push({
                    type: row.querySelector('.construction-type').value || '',
                    name: row.querySelector('.construction-name').value || '',
                    period: row.querySelector('.construction-period').value || '',
                    cost: Number(row.querySelector('.construction-cost').value) || 0,
                    contact: row.querySelector('.construction-contact').value || '',
                    note: row.querySelector('.construction-note').value || ''
                });
            }
        });

        // 创建下载文件
        const dataStr = JSON.stringify(exportData, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        
        // 创建下载链接
        const link = document.createElement('a');
        const fileName = `项目管理_${exportData.basicInfo.projectName || '未命名'}_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.json`;
        
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        link.click();

        showNotification('导出成功', 'success');
    } catch (error) {
        console.error('导出失败:', error);
        showNotification('导出失败，请重试', 'error');
    }
}

// 导入JSON数据
document.getElementById('importFile').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (!file) return;

    showLoading();
    const reader = new FileReader();

    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            
            // 验证数据格式
            if (!importedData.basicInfo || !importedData.materials || 
                !importedData.furniture || !importedData.construction || 
                !importedData.summary) {
                throw new Error('导入的文件格式不正确');
            }

            // 更新全局数据对象
            projectData = importedData;

            // 更新基本信息
            document.getElementById('projectName').value = importedData.basicInfo.projectName || '';
            document.getElementById('projectLocation').value = importedData.basicInfo.projectLocation || '';
            document.getElementById('designer').value = importedData.basicInfo.designer || '';
            document.getElementById('supervisor').value = importedData.basicInfo.supervisor || '';

            // 更新主材表格
            const materialTbody = document.querySelector('#materialTable tbody');
            materialTbody.innerHTML = '';
            importedData.materials.forEach(material => {
                const row = materialTbody.insertRow();
                row.innerHTML = `
                    <td><textarea class="material-name" rows="1">${material.name || ''}</textarea></td>
                    <td>
                        <select class="material-buyer">
                            <option value="设计师" ${material.buyer === '设计师' ? 'selected' : ''}>设计师</option>
                            <option value="监理" ${material.buyer === '监理' ? 'selected' : ''}>监理</option>
                            <option value="业主" ${material.buyer === '业主' ? 'selected' : ''}>业主</option>
                        </select>
                    </td>
                    <td>
                        <select class="material-status">
                            <option value="否" ${material.status === '否' ? 'selected' : ''}>否</option>
                            <option value="是" ${material.status === '是' ? 'selected' : ''}>是</option>
                        </select>
                    </td>
                    <td><textarea class="material-location" rows="1">${material.location || ''}</textarea></td>
                    <td><textarea class="material-note" rows="1">${material.note || ''}</textarea></td>
                    <td><input type="number" class="material-cost" value="${material.cost || 0}" onchange="updateCostSummary()"></td>
                    <td><button onclick="deleteRow(this)">删除</button></td>
                `;
                addRowChangeListeners(row, 'materials');
            });

            // 更新软装表格
            const furnitureTbody = document.querySelector('#furnitureTable tbody');
            furnitureTbody.innerHTML = '';
            importedData.furniture.forEach(furniture => {
                const row = furnitureTbody.insertRow();
                row.innerHTML = `
                    <td><textarea class="furniture-name" rows="1">${furniture.name || ''}</textarea></td>
                    <td>
                        <select class="furniture-buyer">
                            <option value="设计师" ${furniture.buyer === '设计师' ? 'selected' : ''}>设计师</option>
                            <option value="监理" ${furniture.buyer === '监理' ? 'selected' : ''}>监理</option>
                            <option value="业主" ${furniture.buyer === '业主' ? 'selected' : ''}>业主</option>
                        </select>
                    </td>
                    <td>
                        <select class="furniture-status">
                            <option value="否" ${furniture.status === '否' ? 'selected' : ''}>否</option>
                            <option value="是" ${furniture.status === '是' ? 'selected' : ''}>是</option>
                        </select>
                    </td>
                    <td><textarea class="furniture-location" rows="1">${furniture.location || ''}</textarea></td>
                    <td><textarea class="furniture-note" rows="1">${furniture.note || ''}</textarea></td>
                    <td><input type="number" class="furniture-cost" value="${furniture.cost || 0}" onchange="updateCostSummary()"></td>
                    <td><button onclick="deleteRow(this)">删除</button></td>
                `;
                addRowChangeListeners(row, 'furniture');
            });

            // 更新施工表格
            const constructionTbody = document.querySelector('#constructionTable tbody');
            constructionTbody.innerHTML = '';
            importedData.construction.forEach(construction => {
                const row = constructionTbody.insertRow();
                row.innerHTML = `
                    <td><textarea class="construction-type" rows="1">${construction.type || ''}</textarea></td>
                    <td><textarea class="construction-name" rows="1">${construction.name || ''}</textarea></td>
                    <td><textarea class="construction-period" rows="1">${construction.period || ''}</textarea></td>
                    <td><input type="number" class="construction-cost" value="${construction.cost || 0}" onchange="updateCostSummary()"></td>
                    <td><textarea class="construction-contact" rows="1">${construction.contact || ''}</textarea></td>
                    <td><textarea class="construction-note" rows="1">${construction.note || ''}</textarea></td>
                    <td><button onclick="deleteRow(this)">删除</button></td>
                `;
                addRowChangeListeners(row, 'construction');
            });

            // 更新项目总结
            document.getElementById('projectIssues').value = importedData.summary.issues || '';
            document.getElementById('projectLessons').value = importedData.summary.lessons || '';

            // 更新成本统计
            updateCostSummary();
            
            // 保存到本地存储
            saveToLocalStorage();
            
            showNotification('导入成功', 'success');
        } catch (error) {
            console.error('导入失败:', error);
            showNotification('导入失败：文件格式不正确', 'error');
        } finally {
            hideLoading();
            event.target.value = '';
        }
    };

    reader.onerror = function() {
        showNotification('文件读取失败', 'error');
        hideLoading();
    };

    reader.readAsText(file);
});

// 导出Excel文件
async function exportExcel() {
    showLoading();
    try {
        const workbook = new ExcelJS.Workbook();
        workbook.creator = '项目管理系统';
        workbook.created = new Date();

        // 创建工作表
        const worksheet = workbook.addWorksheet('项目管理', {
            properties: {
                tabColor: { argb: '4167B2' }
            }
        });

        // 设置列宽
        worksheet.columns = [
            { width: 25 }, { width: 15 }, { width: 15 },
            { width: 25 }, { width: 35 }, { width: 15 }
        ];

        // 通用样式
        const styles = {
            header: {
                font: { bold: true, size: 14, color: { argb: 'FFFFFF' } },
                fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: '4167B2' } },
                alignment: { horizontal: 'center', vertical: 'middle' },
                border: {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                }
            },
            subHeader: {
                font: { bold: true, size: 12 },
                fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E6E6FA' } },
                alignment: { horizontal: 'center', vertical: 'middle' }
            },
            cell: {
                alignment: { vertical: 'middle', wrapText: true },
                border: {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                }
            },
            money: {
                numFmt: '¥#,##0.00',
                alignment: { horizontal: 'right', vertical: 'middle' }
            }
        };

        // 添加标题
        const titleRow = worksheet.addRow(['项目管理报表']);
        worksheet.mergeCells(`A${titleRow.number}:F${titleRow.number}`);
        titleRow.height = 40;
        Object.assign(titleRow.getCell(1), styles.header);

        // 添加基本信息
        worksheet.addRow([]);
        const basicInfoTitle = worksheet.addRow(['项目基本信息']);
        worksheet.mergeCells(`A${basicInfoTitle.number}:F${basicInfoTitle.number}`);
        Object.assign(basicInfoTitle.getCell(1), styles.subHeader);

        const basicInfo = [
            ['项目名称', document.getElementById('projectName').value],
            ['项目位置', document.getElementById('projectLocation').value],
            ['设计师', document.getElementById('designer').value],
            ['监理', document.getElementById('supervisor').value]
        ];
        basicInfo.forEach(([label, value]) => {
            const row = worksheet.addRow([label, value]);
            row.getCell(1).font = { bold: true };
        });

        // 添加主材管理
        worksheet.addRow([]);
        const materialTitle = worksheet.addRow(['主材管理明细']);
        worksheet.mergeCells(`A${materialTitle.number}:F${materialTitle.number}`);
        Object.assign(materialTitle.getCell(1), styles.subHeader);

        // 主材表头
        const materialHeaders = ['名称', '采购人', '是否采购', '采购位置', '备注', '金额'];
        const materialHeaderRow = worksheet.addRow(materialHeaders);
        materialHeaderRow.eachCell((cell) => Object.assign(cell, styles.header));

        // 主材数据
        document.querySelectorAll('#materialTable tbody tr').forEach(row => {
            const dataRow = worksheet.addRow([
                row.querySelector('.material-name').value,
                row.querySelector('.material-buyer').value,
                row.querySelector('.material-status').value,
                row.querySelector('.material-location').value,
                row.querySelector('.material-note').value,
                Number(row.querySelector('.material-cost').value) || 0
            ]);
            dataRow.eachCell((cell, colNumber) => {
                Object.assign(cell, styles.cell);
                if (colNumber === 6) Object.assign(cell, styles.money);
            });
        });

        // 添加软装管理
        worksheet.addRow([]);
        const furnitureTitle = worksheet.addRow(['软装管理明细']);
        worksheet.mergeCells(`A${furnitureTitle.number}:F${furnitureTitle.number}`);
        Object.assign(furnitureTitle.getCell(1), styles.subHeader);

        // 软装表头
        const furnitureHeaderRow = worksheet.addRow(materialHeaders);
        furnitureHeaderRow.eachCell((cell) => Object.assign(cell, styles.header));

        // 软装数据
        document.querySelectorAll('#furnitureTable tbody tr').forEach(row => {
            const dataRow = worksheet.addRow([
                row.querySelector('.furniture-name').value,
                row.querySelector('.furniture-buyer').value,
                row.querySelector('.furniture-status').value,
                row.querySelector('.furniture-location').value,
                row.querySelector('.furniture-note').value,
                Number(row.querySelector('.furniture-cost').value) || 0
            ]);
            dataRow.eachCell((cell, colNumber) => {
                Object.assign(cell, styles.cell);
                if (colNumber === 6) Object.assign(cell, styles.money);
            });
        });

        // 添加施工管理
        worksheet.addRow([]);
        const constructionTitle = worksheet.addRow(['施工管理明细']);
        worksheet.mergeCells(`A${constructionTitle.number}:F${constructionTitle.number}`);
        Object.assign(constructionTitle.getCell(1), styles.subHeader);

        // 施工表头
        const constructionHeaders = ['工种', '名称', '周期', '金额', '联系方式', '备注'];
        const constructionHeaderRow = worksheet.addRow(constructionHeaders);
        constructionHeaderRow.eachCell((cell) => Object.assign(cell, styles.header));

        // 施工数据
        document.querySelectorAll('#constructionTable tbody tr').forEach(row => {
            const dataRow = worksheet.addRow([
                row.querySelector('.construction-type').value,
                row.querySelector('.construction-name').value,
                row.querySelector('.construction-period').value,
                Number(row.querySelector('.construction-cost').value) || 0,
                row.querySelector('.construction-contact').value,
                row.querySelector('.construction-note').value
            ]);
            dataRow.eachCell((cell, colNumber) => {
                Object.assign(cell, styles.cell);
                if (colNumber === 4) Object.assign(cell, styles.money);
            });
        });

        // 添加成本统计
        worksheet.addRow([]);
        const costTitle = worksheet.addRow(['成本统计']);
        worksheet.mergeCells(`A${costTitle.number}:F${costTitle.number}`);
        Object.assign(costTitle.getCell(1), styles.subHeader);

        const materialTotal = calculateTotal('#materialTable .material-cost');
        const furnitureTotal = calculateTotal('#furnitureTable .furniture-cost');
        const constructionTotal = calculateTotal('#constructionTable .construction-cost');
        const totalCost = materialTotal + furnitureTotal + constructionTotal;

        [
            ['主材总成本', materialTotal],
            ['软装总成本', furnitureTotal],
            ['施工总成本', constructionTotal],
            ['项目总成本', totalCost]
        ].forEach(([label, value]) => {
            const row = worksheet.addRow([label, value]);
            row.getCell(1).font = { bold: true };
            Object.assign(row.getCell(2), { ...styles.cell, ...styles.money });
            if (label === '项目总成本') {
                row.getCell(2).font = { bold: true, color: { argb: 'FF0000' } };
            }
        });

        // 添加项目总结
        worksheet.addRow([]);
        const summaryTitle = worksheet.addRow(['项目总结']);
        worksheet.mergeCells(`A${summaryTitle.number}:F${summaryTitle.number}`);
        Object.assign(summaryTitle.getCell(1), styles.subHeader);

        const issues = worksheet.addRow(['项目问题记录']);
        worksheet.addRow([document.getElementById('projectIssues').value]);
        const lessons = worksheet.addRow(['项目经验总结']);
        worksheet.addRow([document.getElementById('projectLessons').value]);

        // 导出文件
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { 
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `项目管理_${document.getElementById('projectName').value || '未命名'}_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        showNotification('Excel导出成功', 'success');
    } catch (error) {
        console.error('导出Excel失败:', error);
        showNotification('导出Excel失败，请重试', 'error');
    } finally {
        hideLoading();
    }
}

// 处理下拉菜单的显示和隐藏
document.addEventListener('DOMContentLoaded', function() {
    // 获取所有快速添加按钮和下拉内容
    const quickAddButtons = document.querySelectorAll('.quick-add-btn');
    
    quickAddButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation(); // 阻止事件冒泡
            
            // 获取当前按钮对应的下拉内容
            const dropdown = this.nextElementSibling;
            
            // 关闭其他所有下拉菜单
            document.querySelectorAll('.dropdown-content').forEach(content => {
                if (content !== dropdown) {
                    content.classList.remove('active');
                }
            });
            
            // 切换当前下拉菜单的显示状态
            dropdown.classList.toggle('active');
        });
    });
    
    // 点击下拉菜单内容时阻止关闭
    document.querySelectorAll('.dropdown-content').forEach(content => {
        content.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    });
    
    // 点击页面其他地方时关闭所有下拉菜单
    document.addEventListener('click', function() {
        document.querySelectorAll('.dropdown-content').forEach(content => {
            content.classList.remove('active');
        });
    });
});

// 添加事件监听器
function addEventListeners() {
    // 为基本信息添加change事件
    ['projectName', 'projectLocation', 'designer', 'supervisor'].forEach(id => {
        document.getElementById(id).addEventListener('change', function(e) {
            projectData.basicInfo[id] = e.target.value;
            saveToLocalStorage();
        });
    });
    
    // 为项目总结添加change事件
    ['projectIssues', 'projectLessons'].forEach(id => {
        document.getElementById(id).addEventListener('change', function(e) {
            projectData.summary[id === 'projectIssues' ? 'issues' : 'lessons'] = e.target.value;
            saveToLocalStorage();
        });
    });

    // 为所有textarea添加自动调整高度功能
    document.querySelectorAll('textarea').forEach(textarea => {
        textarea.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
        });
    });

    // 添加项目状态变化监听
    document.getElementById('projectStatus').addEventListener('change', function(e) {
        projectData.basicInfo.projectStatus = e.target.value;
        saveToLocalStorage();
    });
}
