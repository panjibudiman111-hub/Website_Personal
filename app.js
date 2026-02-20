// ==========================================
// 1. CONFIGURATION & STATE
// ==========================================
const DB_NAME = 'HRSystemDB';
const DB_VERSION = 6;
let db;

let state = {
    user: null, // Logged in user
    employees: [],
    companySettings: {
        logo: '',
        name: 'PT SENTRAL MULTI INDOTAMA'
    },
    currentPage: 1,
    rowsPerPage: 5,
    searchTerm: '',
    reportTrainings: [],
    multiSkills: [],
    evalMultiSkills: [],
    tanokoSkills: [],
    attendanceRecords: []
};

// ==========================================
// 2. DOM ELEMENTS
// ==========================================
const loginSection = document.getElementById('loginSection');
const dashboardSection = document.getElementById('wrapper');
const loginForm = document.getElementById('loginForm');
const employeeTableBody = document.getElementById('employeeTableBody');
const paginationElement = document.getElementById('pagination');
const searchInput = document.getElementById('searchInput');
const companyLogoInput = document.getElementById('companyLogoInput');
const uploadLogoBtn = document.getElementById('uploadLogoBtn');
const sheetUrlInput = document.getElementById('sheetUrlInput');
const syncSheetBtn = document.getElementById('syncSheetBtn');
const navLogo = document.getElementById('navLogo');
const logoutBtn = document.getElementById('logoutBtn');
const sidebarCollapse = document.getElementById('sidebarCollapse');
const sidebar = document.getElementById('sidebar');

// Modals
const employeeModal = new bootstrap.Modal(document.getElementById('employeeModal'));
const trainingModal = new bootstrap.Modal(document.getElementById('trainingModal'));
const certModal = new bootstrap.Modal(document.getElementById('certModal'));
const fileListModal = new bootstrap.Modal(document.getElementById('fileListModal'));
const multiSkillModal = new bootstrap.Modal(document.getElementById('multiSkillModal'));
const evalModal = new bootstrap.Modal(document.getElementById('evalMultiSkillModal'));
const tanokoModal = new bootstrap.Modal(document.getElementById('tanokoModal'));
const reportModal = new bootstrap.Modal(document.getElementById('reportModal'));
const inputReportModal = new bootstrap.Modal(document.getElementById('inputReportModal'));

// ==========================================
// 3. EIS DATA CONFIGURATION
// ==========================================
const eisKarawangFiles = [
    { name: "EIS BZ4X 2025 (191225).pdf", path: "d:/Folder Digitalisasi PPD/2. Multi Skill/IK Karawang/EIS BZ4X 2025 (191225).pdf" },
    { name: "IK D74A - Agya 2023.pdf", path: "d:/Folder Digitalisasi PPD/2. Multi Skill/IK Karawang/IK D74A - Agya 2023.pdf" },
    { name: "INSTRUKSI KERJA MODEL INNOVA REBORN & VENTURER REV.2.pdf", path: "d:/Folder Digitalisasi PPD/2. Multi Skill/IK Karawang/INSTRUKSI KERJA MODEL INNOVA REBORN & VENTURER REV.2.pdf" },
    { name: "INSTRUKSI KERJA MODEL YARIS.pdf", path: "d:/Folder Digitalisasi PPD/2. Multi Skill/IK Karawang/INSTRUKSI KERJA MODEL YARIS.pdf" },
    { name: "LIST INSTRUKSI KERJA D55L - Raize OKE REV.3.pdf", path: "d:/Folder Digitalisasi PPD/2. Multi Skill/IK Karawang/LIST INSTRUKSI KERJA D55L - Raize OKE REV.3.pdf" },
    { name: "LIST INSTRUKSI KERJA MODEL 560B - Zenix REV 05.pdf", path: "d:/Folder Digitalisasi PPD/2. Multi Skill/IK Karawang/LIST INSTRUKSI KERJA MODEL 560B - Zenix REV 05.pdf" },
    { name: "LIST INSTRUKSI MODEL FORTUNER (290425).pdf", path: "d:/Folder Digitalisasi PPD/2. Multi Skill/IK Karawang/LIST INSTRUKSI MODEL FORTUNER (290425).pdf" }
];

const eisCibitungFiles = [
    { name: "IK 397D - Corolla Cross (230425).pdf", path: "d:/Folder Digitalisasi PPD/2. Multi Skill/IK Cibitung/IK 397D - Corolla Cross (230425).pdf" },
    { name: "IK 970B 2023 - Alphard (230425).pdf", path: "d:/Folder Digitalisasi PPD/2. Multi Skill/IK Cibitung/IK 970B 2023 - Alphard (230425).pdf" },
    { name: "IK AEROKIT VELLFIRE.pdf", path: "d:/Folder Digitalisasi PPD/2. Multi Skill/IK Cibitung/IK AEROKIT VELLFIRE.pdf" },
    { name: "INSTRUKSI KERJA 199D - Corolla Altis.pdf", path: "d:/Folder Digitalisasi PPD/2. Multi Skill/IK Cibitung/INSTRUKSI KERJA 199D - Corolla Altis.pdf" },
    { name: "INSTRUKSI KERJA 320D - Hilux Rangga.pdf", path: "d:/Folder Digitalisasi PPD/2. Multi Skill/IK Cibitung/INSTRUKSI KERJA 320D - Hilux Rangga.pdf" },
    { name: "INSTRUKSI KERJA GR COROLLA.pdf", path: "d:/Folder Digitalisasi PPD/2. Multi Skill/IK Cibitung/INSTRUKSI KERJA GR COROLLA.pdf" },
    { name: "INSTRUKSI KERJA MODEL LC300 (3).pdf", path: "d:/Folder Digitalisasi PPD/2. Multi Skill/IK Cibitung/INSTRUKSI KERJA MODEL LC300 (3).pdf" },
    { name: "INSTRUKSI KERJA VOXY (TCO).pdf", path: "d:/Folder Digitalisasi PPD/2. Multi Skill/IK Cibitung/INSTRUKSI KERJA VOXY (TCO).pdf" },
    { name: "LIST INSTRUKSI KERJA MODEL HIACE Rev.02 (2).pdf", path: "d:/Folder Digitalisasi PPD/2. Multi Skill/IK Cibitung/LIST INSTRUKSI KERJA MODEL HIACE Rev.02 (2).pdf" },
    { name: "LIST INSTRUKSI KERJA VOXY - TCO.pdf", path: "d:/Folder Digitalisasi PPD/2. Multi Skill/IK Cibitung/LIST INSTRUKSI KERJA VOXY - TCO.pdf" }
];

// ==========================================
// 4. INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await initDB();
        await migrateFromLocalStorage(); // Check and migrate old data
        await loadStateFromDB();
        checkAuth();
        renderDashboard();
    } catch (err) {
        console.error('Failed to initialize:', err);
        alert('Gagal memuat database!');
    }
});

// ==========================================
// 5. EVENT LISTENERS (GLOBAL)
// ==========================================

// Sidebar Toggle
if (sidebarCollapse) {
    sidebarCollapse.addEventListener('click', () => {
        sidebar.classList.toggle('active');
    });
}

// EIS Buttons
document.getElementById('btnEisKarawang').addEventListener('click', (e) => {
    e.preventDefault();
    openFileList('EIS KARAWANG', eisKarawangFiles);
});

document.getElementById('btnEisCibitung').addEventListener('click', (e) => {
    e.preventDefault();
    openFileList('EIS CIBITUNG', eisCibitungFiles);
});

// Sidebar Employee Add Button
const btnAddEmployeeSidebar = document.getElementById('btnAddEmployeeSidebar');
if (btnAddEmployeeSidebar) {
    btnAddEmployeeSidebar.addEventListener('click', () => {
        resetEmployeeForm();
        document.getElementById('employeeModalTitle').innerText = 'Tambah Karyawan';
    });
}

// Auth Listeners
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const u = document.getElementById('username').value;
    const p = document.getElementById('password').value;

    if (u === 'PPDSHE' && p === 'ppdshe2026') {
        state.user = { username: 'admin', role: 'HR' };
        try {
            if (db) {
                await dbPut('settings', { key: 'user', value: state.user });
            }
        } catch (err) {
            console.error('Failed to persist login:', err);
        }
        checkAuth();
    } else {
        alert('Username atau Password salah!');
    }
});

logoutBtn.addEventListener('click', async () => {
    if(confirm('Apakah anda yakin ingin logout?')) {
        state.user = null;
        try {
            if (db) {
                await dbPut('settings', { key: 'user', value: null });
            }
        } catch (err) {
            console.error('Logout persistence failed:', err);
        }
        checkAuth();
    }
});

// ==========================================
// 6. HELPER FUNCTIONS
// ==========================================

function checkAuth() {
    if (state.user) {
        loginSection.classList.add('d-none');
        dashboardSection.classList.remove('d-none');
        renderDashboard();
    } else {
        loginSection.classList.remove('d-none');
        dashboardSection.classList.add('d-none');
    }
}

function openFileList(title, files) {
    document.getElementById('fileListModalTitle').innerText = title;
    const listGroup = document.getElementById('fileListGroup');
    listGroup.innerHTML = '';

    // Add Help Text
    const helpText = document.createElement('div');
    helpText.className = "alert alert-info small mb-3";
    helpText.innerHTML = '<i class="fas fa-info-circle"></i> <b>Info:</b> Jika tombol <b>"Buka"</b> tidak merespon (diblokir browser), gunakan tombol <b>"Copy Path"</b> lalu paste di File Explorer.';
    listGroup.appendChild(helpText);

    files.forEach(f => {
        const item = document.createElement('div');
        item.className = "list-group-item d-flex justify-content-between align-items-center";
        
        // Normalize path for Windows (Backslashes for display/copy)
        const filePathWindows = f.path.replace(/\//g, '\\');
        
        // Encode for URL (Keep forward slashes, encode spaces)
        const fileUrl = "file:///" + encodeURI(f.path);

        item.innerHTML = `
            <div class="me-3">
                <div class="d-flex align-items-center">
                    <i class="fas fa-file-pdf text-danger me-2 fa-lg"></i>
                    <span class="fw-bold">${f.name}</span>
                </div>
                <div class="small text-muted mt-1" style="font-size: 0.75em;">${filePathWindows}</div>
            </div>
            <div class="btn-group" role="group">
                <a href="${fileUrl}" target="_blank" class="btn btn-sm btn-primary text-white">
                    <i class="fas fa-folder-open"></i> Buka
                </a>
                <button class="btn btn-sm btn-outline-secondary btn-copy" data-path="${filePathWindows}" title="Copy Path">
                    <i class="fas fa-copy"></i>
                </button>
            </div>
        `;
        
        // Add Copy Event
        item.querySelector('.btn-copy').addEventListener('click', (e) => {
            e.preventDefault();
            const path = e.currentTarget.getAttribute('data-path');
            copyToClipboard(path);
        });

        listGroup.appendChild(item);
    });

    fileListModal.show();
}

function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(() => {
            alert('Path berhasil disalin!\n\n' + text + '\n\nSilakan buka File Explorer (Win+E) dan Paste.');
        }).catch(() => {
            prompt("Browser memblokir akses clipboard. Silakan copy manual:", text);
        });
    } else {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
            alert('Path berhasil disalin!\n\n' + text + '\n\nSilakan buka File Explorer (Win+E) dan Paste.');
        } catch (err) {
            prompt("Silakan copy manual:", text);
        }
        document.body.removeChild(textArea);
    }
}

// ==========================================
// 7. INDEXEDDB HELPERS
// ==========================================
function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('employees')) db.createObjectStore('employees', { keyPath: 'id' });
            if (!db.objectStoreNames.contains('settings')) db.createObjectStore('settings', { keyPath: 'key' });
            if (!db.objectStoreNames.contains('report_trainings')) db.createObjectStore('report_trainings', { keyPath: 'id' });
            if (!db.objectStoreNames.contains('multi_skills')) db.createObjectStore('multi_skills', { keyPath: 'id' }); 
            if (!db.objectStoreNames.contains('eval_multi_skills')) db.createObjectStore('eval_multi_skills', { keyPath: 'id' });
            if (!db.objectStoreNames.contains('tanoko_skills')) db.createObjectStore('tanoko_skills', { keyPath: 'empId' });
            if (!db.objectStoreNames.contains('attendance_records')) db.createObjectStore('attendance_records', { keyPath: 'id' });
        };

        request.onsuccess = (event) => {
            db = event.target.result;
            resolve(db);
        };

        request.onerror = (event) => {
            reject('Database error: ' + event.target.errorCode);
        };
    });
}

function dbPut(storeName, data) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.put(data);
        request.onsuccess = () => resolve(request.result);
        request.onerror = (e) => reject(e);
    });
}

function dbGet(storeName, key) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.get(key);
        request.onsuccess = () => resolve(request.result);
        request.onerror = (e) => reject(e);
    });
}

function dbGetAll(storeName) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = (e) => reject(e);
    });
}

function dbDelete(storeName, key) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.delete(key);
        request.onsuccess = () => resolve();
        request.onerror = (e) => reject(e);
    });
}

async function migrateFromLocalStorage() {
    const oldDataJson = localStorage.getItem('hrSystemState');
    if (!oldDataJson) return;

    if(!confirm('Ditemukan data lama di LocalStorage. Apakah Anda ingin memigrasikannya ke database baru?')) {
        return;
    }

    try {
        const oldData = JSON.parse(oldDataJson);
        console.log('Migrating data...', oldData);

        if (oldData.employees && Array.isArray(oldData.employees)) {
            for (const emp of oldData.employees) {
                if (!emp.id) emp.id = crypto.randomUUID();
                await dbPut('employees', emp);
            }
        }
        if (oldData.companySettings) {
            await dbPut('settings', { key: 'companySettings', value: oldData.companySettings });
        }
        if (oldData.user) {
            await dbPut('settings', { key: 'user', value: oldData.user });
        }

        localStorage.removeItem('hrSystemState');
        alert('Migrasi data berhasil! Data lama telah dipindahkan ke database baru.');

    } catch (err) {
        console.error('Migration failed:', err);
        alert('Gagal melakukan migrasi data lama.');
    }
}

async function loadStateFromDB() {
    try {
        const userSetting = await dbGet('settings', 'user');
        if (userSetting) state.user = userSetting.value;

        const companySetting = await dbGet('settings', 'companySettings');
        if (companySetting) {
            state.companySettings = { ...state.companySettings, ...companySetting.value };
        }
        
        const sheetSetting = await dbGet('settings', 'sheetUrl');
        const defaultSheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTPaK7y08e4UgYwabcBxBiwuHYIgC906QRh1nnswWla_VnS2pP2oxH-cP3jndAI7Q/pub?gid=743844400&single=true&output=csv';
        
        if (sheetSetting) {
            if (sheetSetting.value.includes('/d/e/export')) {
                console.warn('Detected broken URL in DB, resetting to default.');
                document.getElementById('sheetUrlInput').value = defaultSheetUrl;
                await dbPut('settings', { key: 'sheetUrl', value: defaultSheetUrl });
                syncFromUrl(defaultSheetUrl).then(() => renderTable());
            } else {
                document.getElementById('sheetUrlInput').value = sheetSetting.value;
                syncFromUrl(sheetSetting.value).then(() => renderTable());
            }
        } else {
            document.getElementById('sheetUrlInput').value = defaultSheetUrl;
            syncFromUrl(defaultSheetUrl).then(() => renderTable());
        }

        const employees = await dbGetAll('employees');
        state.employees = employees || [];
        
        const reports = await dbGetAll('report_trainings');
        state.reportTrainings = reports || [];

        try {
            const ms = await dbGetAll('multi_skills');
            state.multiSkills = ms || [];
        } catch (e) { state.multiSkills = []; }

        try {
            const ev = await dbGetAll('eval_multi_skills');
            state.evalMultiSkills = ev || [];
        } catch (e) { state.evalMultiSkills = []; }

        try {
            const ts = await dbGetAll('tanoko_skills');
            state.tanokoSkills = ts || [];
        } catch (e) { state.tanokoSkills = []; }

        try {
            const ar = await dbGetAll('attendance_records');
            state.attendanceRecords = ar || [];
        } catch (e) { state.attendanceRecords = []; }

    } catch (err) {
        console.error('Error loading state:', err);
    }
}

// ==========================================
// 8. DASHBOARD LOGIC
// ==========================================

// Logo Upload
uploadLogoBtn.addEventListener('click', async () => {
    const file = companyLogoInput.files[0];
    if (file) {
        if (file.size > 500 * 1024) {
            alert('Ukuran file terlalu besar! Max 500KB.');
            return;
        }
        try {
            const base64 = await fileToBase64(file);
            state.companySettings.logo = base64;
            await dbPut('settings', { key: 'companySettings', value: state.companySettings });
            renderLogo();
            alert('Logo berhasil diupdate!');
        } catch (err) {
            alert('Gagal upload logo');
        }
    }
});

function renderLogo() {
    if (state.companySettings.logo) {
        navLogo.src = state.companySettings.logo;
        navLogo.classList.remove('d-none');
    }
}

// Google Sheets Sync
async function syncFromUrl(url) {
    if (!url) return;
    const statusEl = document.getElementById('syncStatus');
    statusEl.innerText = 'Syncing...';
    statusEl.className = 'mt-2 small fw-bold text-primary';

    try {
        console.log('Syncing from:', url);
        const response = await fetch(url);
        if (!response.ok) throw new Error('Gagal mengakses URL (Status: ' + response.status + '). Pastikan link publik.');
        
        const csvText = await response.text();
        const importedCount = await parseAndImportCSV(csvText);
        
        console.log('Auto-sync completed.');
        statusEl.innerText = `Sync Berhasil (${importedCount} data)`;
        statusEl.className = 'mt-2 small fw-bold text-success';
    } catch (err) {
        console.error('Auto-sync error:', err);
        statusEl.innerText = 'Sync Gagal: ' + err.message;
        statusEl.className = 'mt-2 small fw-bold text-danger';
    }
}

syncSheetBtn.addEventListener('click', async () => {
    let url = sheetUrlInput.value.trim();
    if (!url) {
        alert('Masukkan URL Google Sheet (format CSV Export)!');
        return;
    }

    if (!url.includes('/pub?') && !url.includes('output=csv')) {
        const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
        if (match && match[1] && match[1] !== 'e') {
             url = `https://docs.google.com/spreadsheets/d/${match[1]}/export?format=csv`;
             sheetUrlInput.value = url;
        }
    }

    try {
        await dbPut('settings', { key: 'sheetUrl', value: url });
        await syncFromUrl(url);
        renderTable();
    } catch (err) {
        console.error('Sync error:', err);
        alert('Gagal sinkronisasi: ' + err.message);
    }
});

async function parseAndImportCSV(csvText) {
    const rows = [];
    const lines = csvText.split(/\r?\n/);
    const csvSplitRegex = /,(?=(?:(?:[^"]*"){2})*[^"]*$)/;

    lines.forEach(line => {
        if (line.trim()) rows.push(line.split(csvSplitRegex));
    });

    if (rows.length < 2) throw new Error('Data CSV kosong atau format salah.');

    const headers = rows[0].map(h => h.trim().replace(/^"|"$/g, '').toLowerCase());
    const idxNik = headers.findIndex(h => h.includes('nik'));
    const idxName = headers.findIndex(h => h.includes('nama'));
    const idxComp = headers.findIndex(h => h.includes('perusahaan'));
    const idxDept = headers.findIndex(h => h.includes('bagian'));
    const idxDate = headers.findIndex(h => h.includes('tanggal') || h.includes('masuk'));

    if (idxNik === -1 || idxName === -1) throw new Error(`Kolom Wajib (NIK, Nama) tidak ditemukan.`);

    let count = 0;
    for (let i = 1; i < rows.length; i++) {
        const cols = rows[i];
        if (cols.length < 2) continue;

        const cleanVal = (val) => val ? val.trim().replace(/^"|"$/g, '') : '';
        const nik = cleanVal(cols[idxNik]);
        const name = cleanVal(cols[idxName]);
        
        if (!nik || !name) continue;

        let joinDate = cleanVal(cols[idxDate]);
        joinDate = parseIndonesianDate(joinDate);

        const existing = state.employees.find(e => e.nik === nik);
        
        const empData = {
            id: existing ? existing.id : crypto.randomUUID(),
            nik: nik,
            name: name,
            company: cleanVal(cols[idxComp]),
            dept: cleanVal(cols[idxDept]),
            joinDate: joinDate,
            photo: existing ? existing.photo : null,
            trainings: existing ? existing.trainings : [],
            position: existing ? existing.position : '',
            level: existing ? existing.level : '',
            shift: existing ? existing.shift : ''
        };

        await dbPut('employees', empData);
        
        const localIdx = state.employees.findIndex(e => e.nik === nik);
        if (localIdx >= 0) state.employees[localIdx] = empData;
        else state.employees.push(empData);
        
        count++;
    }
    
    renderTable();
    return count;
}

function parseIndonesianDate(dateStr) {
    if (!dateStr) return '';
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) return dateStr;

    const months = {
        'januari': '01', 'jan': '01',
        'februari': '02', 'feb': '02',
        'maret': '03', 'mar': '03',
        'april': '04', 'apr': '04',
        'mei': '05', 'may': '05',
        'juni': '06', 'jun': '06',
        'juli': '07', 'jul': '07',
        'agustus': '08', 'aug': '08', 'agu': '08',
        'september': '09', 'sep': '09',
        'oktober': '10', 'okt': '10', 'oct': '10',
        'november': '11', 'nov': '11',
        'desember': '12', 'des': '12', 'dec': '12'
    };

    const parts = dateStr.split(' ');
    if (parts.length === 3) {
        let day = parts[0].padStart(2, '0');
        let monthStr = parts[1].toLowerCase();
        let year = parts[2];
        let month = months[monthStr];
        if (month) return `${year}-${month}-${day}`;
    }
    return dateStr;
}

// ==========================================
// 9. EMPLOYEE CRUD
// ==========================================
const btnAddEmployee = document.getElementById('btnAddEmployee');
const saveEmployeeBtn = document.getElementById('saveEmployeeBtn');
const empPhotoInput = document.getElementById('empPhoto');

btnAddEmployee.addEventListener('click', () => {
    resetEmployeeForm();
    document.getElementById('employeeModalTitle').innerText = 'Tambah Karyawan';
});

saveEmployeeBtn.addEventListener('click', async () => {
    const id = document.getElementById('empId').value;
    const name = document.getElementById('empName').value;
    const nik = document.getElementById('empNIK').value;
    const company = document.getElementById('empCompany').value;
    const dept = document.getElementById('empDepartment').value;
    const position = document.getElementById('empPosition').value;
    const level = document.getElementById('empLevel').value;
    const shift = document.getElementById('empShift').value;
    const joinDate = document.getElementById('empJoinDate').value;
    const photoFile = empPhotoInput.files[0];

    if (!name || !nik) {
        alert('Nama dan NIK wajib diisi!');
        return;
    }

    let photoBase64 = document.getElementById('empPhotoPreview').src;
    if (photoFile) {
        if (photoFile.size > 500 * 1024) {
             alert('Ukuran foto terlalu besar! Max 500KB.');
             return;
        }
        photoBase64 = await fileToBase64(photoFile);
    }

    let existingTrainings = [];
    if (id) {
        const existingEmp = state.employees.find(e => e.id === id);
        if (existingEmp) existingTrainings = existingEmp.trainings || [];
    }

    const employeeData = {
        id: id || crypto.randomUUID(),
        name, nik, company, dept, position, level, shift, joinDate,
        photo: photoBase64,
        trainings: existingTrainings
    };

    try {
        await dbPut('employees', employeeData);
        
        if (id) {
            const index = state.employees.findIndex(e => e.id === id);
            state.employees[index] = employeeData;
        } else {
            state.employees.push(employeeData);
        }

        employeeModal.hide();
        renderTable();
    } catch (err) {
        console.error('Error saving employee:', err);
        alert('Gagal menyimpan data karyawan');
    }
});

empPhotoInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file) {
        const base64 = await fileToBase64(file);
        document.getElementById('empPhotoPreview').src = base64;
    }
});

function resetEmployeeForm() {
    document.getElementById('employeeForm').reset();
    document.getElementById('empId').value = '';
    document.getElementById('empPhotoPreview').src = 'https://via.placeholder.com/150';
}

function editEmployee(id) {
    const emp = state.employees.find(e => e.id === id);
    if (!emp) return;

    document.getElementById('empId').value = emp.id;
    document.getElementById('empName').value = emp.name;
    document.getElementById('empNIK').value = emp.nik;
    document.getElementById('empCompany').value = emp.company;
    document.getElementById('empDepartment').value = emp.dept;
    document.getElementById('empPosition').value = emp.position || '';
    document.getElementById('empLevel').value = emp.level || '';
    document.getElementById('empShift').value = emp.shift || '';
    document.getElementById('empJoinDate').value = emp.joinDate;
    document.getElementById('empPhotoPreview').src = emp.photo || 'https://via.placeholder.com/150';

    document.getElementById('employeeModalTitle').innerText = 'Edit Karyawan';
    employeeModal.show();
}

async function deleteEmployee(id) {
    if (confirm('Yakin ingin menghapus data ini?')) {
        try {
            await dbDelete('employees', id);
            state.employees = state.employees.filter(e => e.id !== id);
            renderTable();
        } catch (err) {
            console.error('Error deleting employee:', err);
            alert('Gagal menghapus data');
        }
    }
}

// ==========================================
// 10. TRAINING LOGIC
// ==========================================
let currentTrainingEmpId = null;

function openTrainingModal(id) {
    currentTrainingEmpId = id;
    const emp = state.employees.find(e => e.id === id);
    document.getElementById('trainingEmpName').innerText = emp.name;
    renderTrainingTable();
    trainingModal.show();
}

document.getElementById('addTrainingBtn').addEventListener('click', addTrainingHandler);

function renderTrainingTable() {
    const emp = state.employees.find(e => e.id === currentTrainingEmpId);
    const tbody = document.getElementById('trainingTableBody');
    tbody.innerHTML = '';

    if (emp && emp.trainings) {
        emp.trainings.forEach((t, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${t.materi}</td>
                <td>${t.date || '-'}</td>
                <td>${t.duration}</td>
                <td>${t.trainer}</td>
                <td class="text-center">
                    ${t.cert ? 
                        `<button class="btn btn-sm btn-info mb-1" onclick="viewCert('${emp.id}', '${t.id}')" title="Lihat"><i class="fas fa-eye"></i></button>` : 
                        '<span class="badge bg-secondary">No Cert</span>'
                    }
                    <button class="btn btn-sm btn-warning mb-1" onclick="editCert('${emp.id}', '${t.id}')" title="Edit/Upload Sertifikat"><i class="fas fa-pen"></i></button>
                </td>
                <td class="text-center">
                    <button class="btn btn-sm btn-primary mb-1" onclick="editTraining('${emp.id}', '${t.id}')" title="Edit Data"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-sm btn-danger mb-1" onclick="deleteTraining('${emp.id}', '${t.id}')"><i class="fas fa-trash"></i></button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }
}

async function editTraining(empId, trainId) {
    const emp = state.employees.find(e => e.id === empId);
    const train = emp.trainings.find(t => t.id === trainId);
    
    if (!train) return;

    // Fill form with existing data
    document.getElementById('trainMateri').value = train.materi;
    document.getElementById('trainDate').value = train.date;
    document.getElementById('trainDuration').value = train.duration;
    document.getElementById('trainTrainer').value = train.trainer;
    
    // Change Add button to Update button
    const btn = document.getElementById('addTrainingBtn');
    btn.innerHTML = '<i class="fas fa-save"></i> Update';
    btn.classList.remove('btn-success');
    btn.classList.add('btn-warning');
    
    // Remove old listener and add new one
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    
    newBtn.addEventListener('click', async () => {
        const materi = document.getElementById('trainMateri').value;
        const date = document.getElementById('trainDate').value;
        const duration = document.getElementById('trainDuration').value;
        const trainer = document.getElementById('trainTrainer').value;
        const certFile = document.getElementById('trainCert').files[0];

        if (!materi) {
            alert('Materi training wajib diisi');
            return;
        }

        let certBase64 = train.cert;
        let certType = train.certType;

        if (certFile) {
            if (certFile.size > 2 * 1024 * 1024) {
                 alert('Ukuran sertifikat terlalu besar! Max 2MB.');
                 return;
            }
            certBase64 = await fileToBase64(certFile);
            certType = certFile.type;
        }

        // Update data
        train.materi = materi;
        train.date = date;
        train.duration = duration;
        train.trainer = trainer;
        train.cert = certBase64;
        train.certType = certType;

        try {
            await dbPut('employees', emp);
            renderTrainingTable();
            
            // Reset form
            document.getElementById('trainMateri').value = '';
            document.getElementById('trainDate').value = '';
            document.getElementById('trainDuration').value = '';
            document.getElementById('trainTrainer').value = '';
            document.getElementById('trainCert').value = '';
            
            // Reset button
            newBtn.innerHTML = '<i class="fas fa-plus"></i> Tambah';
            newBtn.classList.remove('btn-warning');
            newBtn.classList.add('btn-success');
            
            // Restore original add listener (by reloading page logic or re-attaching)
            // Ideally, we should have a mode flag. For simplicity, we re-attach the original logic.
            const resetBtn = newBtn.cloneNode(true);
            newBtn.parentNode.replaceChild(resetBtn, newBtn);
            resetBtn.addEventListener('click', addTrainingHandler);
            
            alert('Data training berhasil diupdate!');
        } catch (err) {
            console.error('Error updating training:', err);
            alert('Gagal mengupdate data training');
        }
    });
}

// Extract original add handler to named function for reuse
async function addTrainingHandler() {
    if (!currentTrainingEmpId) return;

    const materi = document.getElementById('trainMateri').value;
    const date = document.getElementById('trainDate').value;
    const duration = document.getElementById('trainDuration').value;
    const trainer = document.getElementById('trainTrainer').value;
    const certFile = document.getElementById('trainCert').files[0];

    if (!materi) {
        alert('Materi training wajib diisi');
        return;
    }

    let certBase64 = null;
    let certType = null;

    if (certFile) {
        if (certFile.size > 2 * 1024 * 1024) {
             alert('Ukuran sertifikat terlalu besar! Max 2MB.');
             return;
        }
        certBase64 = await fileToBase64(certFile);
        certType = certFile.type;
    }

    const newTraining = {
        id: crypto.randomUUID(),
        materi, date, duration, trainer,
        cert: certBase64,
        certType
    };

    const empIndex = state.employees.findIndex(e => e.id === currentTrainingEmpId);
    if (!state.employees[empIndex].trainings) state.employees[empIndex].trainings = [];
    state.employees[empIndex].trainings.push(newTraining);
    
    try {
        await dbPut('employees', state.employees[empIndex]);
        renderTrainingTable();
        
        document.getElementById('trainMateri').value = '';
        document.getElementById('trainDate').value = '';
        document.getElementById('trainDuration').value = '';
        document.getElementById('trainTrainer').value = '';
        document.getElementById('trainCert').value = '';
    } catch (err) {
        console.error('Error saving training:', err);
        alert('Gagal menyimpan data training');
    }
}

async function editCert(empId, trainId) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,application/pdf';
    
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            alert('Ukuran file terlalu besar! Max 2MB.');
            return;
        }

        try {
            const base64 = await fileToBase64(file);
            const empIndex = state.employees.findIndex(e => e.id === empId);
            const trainIndex = state.employees[empIndex].trainings.findIndex(t => t.id === trainId);
            
            state.employees[empIndex].trainings[trainIndex].cert = base64;
            state.employees[empIndex].trainings[trainIndex].certType = file.type;

            await dbPut('employees', state.employees[empIndex]);
            
            if (currentTrainingEmpId === empId) renderTrainingTable();
            alert('Sertifikat berhasil diupdate!');
        } catch (err) {
            console.error(err);
            alert('Gagal update sertifikat');
        }
    };
    input.click();
}

async function deleteTraining(empId, trainId) {
    if(!confirm('Hapus history training ini?')) return;
    
    const empIndex = state.employees.findIndex(e => e.id === empId);
    state.employees[empIndex].trainings = state.employees[empIndex].trainings.filter(t => t.id !== trainId);
    
    try {
        await dbPut('employees', state.employees[empIndex]);
        renderTrainingTable();
    } catch (err) {
        console.error('Error deleting training:', err);
        alert('Gagal menghapus data training');
    }
}

// Global Expose
window.viewCert = (empId, trainId) => {
    const emp = state.employees.find(e => e.id === empId);
    const train = emp.trainings.find(t => t.id === trainId);
    const container = document.getElementById('certPreviewContainer');
    
    if (train.certType && train.certType.includes('pdf')) {
        container.innerHTML = `<iframe src="${train.cert}" style="width:100%; height:500px;" frameborder="0"></iframe>`;
    } else {
        container.innerHTML = `<img src="${train.cert}" class="img-fluid" />`;
    }
    certModal.show();
};

window.editEmployee = editEmployee;
window.deleteEmployee = deleteEmployee;
window.openTrainingModal = openTrainingModal;
window.deleteTraining = deleteTraining;
window.editCert = editCert;
window.editReportData = editReportData;
window.openMultiSkillModal = openMultiSkillModal;
window.deleteMultiSkillPart = deleteMultiSkillPart;
window.openEvalModal = openEvalModal;
window.deleteEvalItem = deleteEvalItem;
window.toggleEvalCheck = toggleEvalCheck;

// ==========================================
// 11. MULTI SKILL LOGIC
// ==========================================
let currentMultiSkillEmpId = null;
let currentMultiSkillData = null;

async function openMultiSkillModal(empId) {
    currentMultiSkillEmpId = empId;
    const emp = state.employees.find(e => e.id === empId);
    if (!emp) return;

    document.getElementById('msEmpName').innerText = emp.name;
    
    let msData = state.multiSkills.find(m => m.empId === empId);
    if (!msData) {
        msData = {
            id: crypto.randomUUID(),
            empId: empId,
            model: '',
            parts: []
        };
    }
    currentMultiSkillData = JSON.parse(JSON.stringify(msData));
    
    document.getElementById('msModel').value = currentMultiSkillData.model || '';
    renderMultiSkillTable();
    multiSkillModal.show();
}

document.getElementById('btnAddMultiSkillPart').addEventListener('click', () => {
    const name = document.getElementById('msPartName').value;
    const dateTrain = document.getElementById('msDateTrain').value;
    const dateEval = document.getElementById('msDateEval').value;
    const trainer = document.getElementById('msTrainer').value;
    const note = document.getElementById('msNote').value;

    if (!name) {
        alert('Nama Part wajib diisi!');
        return;
    }

    currentMultiSkillData.parts.push({
        id: crypto.randomUUID(),
        name, dateTrain, dateEval, trainer, note
    });

    renderMultiSkillTable();

    document.getElementById('msPartName').value = '';
    document.getElementById('msDateTrain').value = '';
    document.getElementById('msDateEval').value = '';
    document.getElementById('msTrainer').value = '';
    document.getElementById('msNote').value = '';
});

function renderMultiSkillTable() {
    const tbody = document.getElementById('multiSkillTableBody');
    tbody.innerHTML = '';

    currentMultiSkillData.parts.forEach((p, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${p.name}</td>
            <td>${p.dateTrain || '-'}</td>
            <td>${p.dateEval || '-'}</td>
            <td>${p.trainer || '-'}</td>
            <td>${p.note || '-'}</td>
            <td>
                <button class="btn btn-sm btn-danger" onclick="deleteMultiSkillPart('${p.id}')"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function deleteMultiSkillPart(partId) {
    currentMultiSkillData.parts = currentMultiSkillData.parts.filter(p => p.id !== partId);
    renderMultiSkillTable();
}

document.getElementById('saveMultiSkillBtn').addEventListener('click', async () => {
    if (!currentMultiSkillEmpId) return;

    currentMultiSkillData.model = document.getElementById('msModel').value;
    
    try {
        await dbPut('multi_skills', currentMultiSkillData);

        const idx = state.multiSkills.findIndex(m => m.id === currentMultiSkillData.id);
        if (idx >= 0) state.multiSkills[idx] = currentMultiSkillData;
        else state.multiSkills.push(currentMultiSkillData);

        alert('Data Multi Skill berhasil disimpan!');
    } catch (err) {
        console.error(err);
        alert('Gagal menyimpan data (Pastikan refresh halaman untuk update database)');
    }
});

document.getElementById('exportMultiSkillPdfBtn').addEventListener('click', () => {
    const emp = state.employees.find(e => e.id === currentMultiSkillEmpId);
    const ms = currentMultiSkillData;
    if (!emp || !ms) return;

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    if (state.companySettings.logo) {
        try { doc.addImage(state.companySettings.logo, 'JPEG', 12, 12, 30, 15); } catch (e) {}
    } else {
        doc.setFontSize(10);
        doc.text("Logo", 15, 20);
    }

    doc.setDrawColor(0);
    doc.setLineWidth(0.3);
    doc.rect(10, 10, 190, 20);

    doc.line(45, 10, 45, 30);
    doc.line(145, 10, 145, 30);
    doc.line(45, 20, 145, 20);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("PT. SENTRAL MULTI INDOTAMA", 95, 16, { align: "center" });
    doc.text("FORM TRAINING MULTI SKILL", 95, 26, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    const rightX = 147;
    doc.text("No.Dokumen : SMI-FR-PPD-02-02", rightX, 13);
    doc.line(145, 15, 200, 15);
    doc.text("Revisi          : 04", rightX, 18);
    doc.line(145, 20, 200, 20);
    doc.text("Hal               : 1 of 1", rightX, 23);
    doc.line(145, 25, 200, 25);
    doc.text("Mulai Berlaku : 02 Februari 2026", rightX, 28);

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    let y = 40;
    doc.text("Nama", 10, y); doc.text(":", 30, y);
    doc.setFont("helvetica", "normal"); doc.text(emp.name, 32, y); doc.line(32, y+1, 150, y+1);

    y += 7;
    doc.setFont("helvetica", "bold"); doc.text("NIK", 10, y); doc.text(":", 30, y);
    doc.setFont("helvetica", "normal"); doc.text(emp.nik, 32, y); doc.line(32, y+1, 150, y+1);

    y += 7;
    doc.setFont("helvetica", "bold"); doc.text("Model", 10, y); doc.text(":", 30, y);
    doc.setFont("helvetica", "normal"); doc.text(ms.model || '', 32, y); doc.line(32, y+1, 150, y+1);

    const tableBody = ms.parts.map((p, i) => [
        i + 1, p.name, p.dateTrain || '', p.dateEval || '', p.trainer || '', p.note || ''
    ]);

    for(let i = tableBody.length; i < 15; i++) {
        tableBody.push([i+1, '', '', '', '', '']);
    }

    doc.autoTable({
        startY: 60,
        head: [
            [{ content: 'No', rowSpan: 2 }, { content: 'Nama Part', rowSpan: 2 }, { content: 'Tanggal', colSpan: 2 }, { content: 'Trainer', rowSpan: 2 }, { content: 'Keterangan', rowSpan: 2 }],
            ['Training', 'Evaluasi']
        ],
        body: tableBody,
        theme: 'plain',
        styles: {
            lineColor: [0, 0, 0], lineWidth: 0.2, fontSize: 8, halign: 'center', valign: 'middle', cellPadding: 2
        },
        columnStyles: {
            0: { cellWidth: 10 }, 1: { cellWidth: 50, halign: 'left' }, 2: { cellWidth: 30 }, 3: { cellWidth: 30 }, 4: { cellWidth: 35 }, 5: { cellWidth: 'auto' }
        },
        headStyles: {
            fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold', lineWidth: 0.2
        }
    });

    const finalY = doc.lastAutoTable.finalY;
    const footerY = finalY + 5;
    const boxHeight = 25;
    const colW = 63;
    
    doc.rect(10, footerY, colW, boxHeight);
    doc.setFontSize(8);
    doc.text("Mengetahui", 10 + colW/2, footerY + 5, { align: "center" });
    doc.line(10, footerY + boxHeight - 5, 10 + colW, footerY + boxHeight - 5);
    doc.text("LG/GH", 10 + colW/2, footerY + boxHeight - 1, { align: "center" });

    doc.rect(10 + colW, footerY, colW, boxHeight);
    doc.text("MP Training", 10 + colW + colW/2, footerY + 5, { align: "center" });
    doc.line(10 + colW, footerY + boxHeight - 5, 10 + colW*2, footerY + boxHeight - 5);
    doc.text("OPERATOR", 10 + colW + colW/2, footerY + boxHeight - 1, { align: "center" });

    doc.rect(10 + colW*2, footerY, 190 - colW*2, boxHeight);
    doc.text("Trainer", 10 + colW*2 + (190 - colW*2)/2, footerY + 5, { align: "center" });
    doc.line(10 + colW*2, footerY + boxHeight - 5, 200, footerY + boxHeight - 5);
    doc.text("MP PPD", 10 + colW*2 + (190 - colW*2)/2, footerY + boxHeight - 1, { align: "center" });

    doc.save(`Multi_Skill_${emp.name}.pdf`);
});

// ==========================================
// 12. EVALUASI MULTI SKILL LOGIC
// ==========================================
let currentEvalEmpId = null;
let currentEvalData = null;

function openEvalModal(empId) {
    currentEvalEmpId = empId;
    const emp = state.employees.find(e => e.id === empId);
    if (!emp) return;

    document.getElementById('evalNameInput').value = emp.name;
    document.getElementById('evalNikInput').value = emp.nik;
    
    if (state.companySettings.logo) {
        document.getElementById('evalFormLogo').src = state.companySettings.logo;
        document.getElementById('evalFormLogo').style.display = 'block';
        document.getElementById('evalFormLogoPlaceholder').style.display = 'none';
    } else {
        document.getElementById('evalFormLogo').style.display = 'none';
        document.getElementById('evalFormLogoPlaceholder').style.display = 'block';
    }

    let evData = state.evalMultiSkills.find(e => e.empId === empId);
    if (!evData) {
        evData = {
            id: crypto.randomUUID(),
            empId: empId,
            model: '',
            date: '',
            items: []
        };
    }
    currentEvalData = JSON.parse(JSON.stringify(evData));

    document.getElementById('evalModel').value = currentEvalData.model || '';
    document.getElementById('evalDate').value = currentEvalData.date || '';
    renderEvalTable();

    evalModal.show();
}

document.getElementById('btnAddEvalItem').addEventListener('click', () => {
    const part = document.getElementById('evalItemPart').value;
    const note = document.getElementById('evalNote').value;
    
    if (!part) {
        alert('Nama Item Part wajib diisi!');
        return;
    }

    currentEvalData.items.push({
        id: crypto.randomUUID(),
        part: part,
        status: null,
        note: note
    });

    renderEvalTable();
    document.getElementById('evalItemPart').value = '';
    document.getElementById('evalNote').value = '';
});

function renderEvalTable() {
    const tbody = document.getElementById('evalTableBody');
    tbody.innerHTML = '';

    currentEvalData.items.forEach((item, index) => {
        const row = document.createElement('tr');
        const checkedYes = item.status === 'YES' ? 'checked' : '';
        const checkedNo = item.status === 'NO' ? 'checked' : '';
        
        row.innerHTML = `
            <td class="text-center">${index + 1}</td>
            <td>${item.part}</td>
            <td class="text-center check-cell" onclick="document.getElementById('rad_yes_${item.id}').click()">
                <input type="radio" id="rad_yes_${item.id}" name="evalStatus_${item.id}" value="YES" ${checkedYes} onchange="toggleEvalCheck('${item.id}', 'YES')">
            </td>
            <td class="text-center check-cell" onclick="document.getElementById('rad_no_${item.id}').click()">
                <input type="radio" id="rad_no_${item.id}" name="evalStatus_${item.id}" value="NO" ${checkedNo} onchange="toggleEvalCheck('${item.id}', 'NO')">
            </td>
            <td>${item.note || ''}</td>
            <td class="text-center">
                <button class="btn btn-xs btn-danger rounded-circle" onclick="deleteEvalItem('${item.id}')" style="width: 24px; height: 24px; padding: 0;"><i class="fas fa-trash" style="font-size: 10px;"></i></button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function toggleEvalCheck(itemId, val) {
    const item = currentEvalData.items.find(i => i.id === itemId);
    if (item) item.status = val;
}

function deleteEvalItem(itemId) {
    currentEvalData.items = currentEvalData.items.filter(i => i.id !== itemId);
    renderEvalTable();
}

document.getElementById('saveEvalBtn').addEventListener('click', async () => {
    if (!currentEvalEmpId) return;
    
    currentEvalData.model = document.getElementById('evalModel').value;
    currentEvalData.date = document.getElementById('evalDate').value;

    try {
        await dbPut('eval_multi_skills', currentEvalData);
        
        const idx = state.evalMultiSkills.findIndex(e => e.id === currentEvalData.id);
        if (idx >= 0) state.evalMultiSkills[idx] = currentEvalData;
        else state.evalMultiSkills.push(currentEvalData);

        alert('Data Evaluasi berhasil disimpan!');
    } catch (err) {
        console.error(err);
        alert('Gagal menyimpan data (Coba refresh halaman untuk update DB)');
    }
});

document.getElementById('exportEvalPdfBtn').addEventListener('click', () => {
    const emp = state.employees.find(e => e.id === currentEvalEmpId);
    const ev = currentEvalData;
    if (!emp || !ev) return;

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('landscape');

    doc.setLineWidth(0.3);
    doc.rect(10, 10, 277, 25);

    if (state.companySettings.logo) {
        try { doc.addImage(state.companySettings.logo, 'JPEG', 12, 12, 35, 20); } catch (e) {}
    } else {
        doc.setFontSize(10);
        doc.text("Logo", 15, 25);
    }
    doc.line(50, 10, 50, 35);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("PT. SENTRAL MULTI INDOTAMA", 148, 18, { align: "center" });
    doc.line(50, 22, 230, 22);
    doc.setFontSize(12);
    doc.text("CHECK SHEET EVALUASI MULTI SKILL", 148, 30, { align: "center" });
    doc.line(230, 10, 230, 35);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    const infoX = 232;
    doc.text("No. Dokumen : SMI-FR-PPD-02-03", infoX, 14);
    doc.line(230, 16, 287, 16);
    doc.text("Revisi          : 00", infoX, 20);
    doc.line(230, 22, 287, 22);
    doc.text("Hal               : 1", infoX, 26);
    doc.line(230, 28, 287, 28);
    doc.text("Tgl Berlaku  : 02 Feb 2026", infoX, 32);

    const startY = 45;
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    
    doc.text("Nama", 15, startY); doc.text(":", 40, startY);
    doc.setFont("helvetica", "normal"); doc.text(emp.name, 45, startY); doc.line(45, startY+1, 120, startY+1);

    doc.setFont("helvetica", "bold"); doc.text("NIK", 15, startY + 7); doc.text(":", 40, startY + 7);
    doc.setFont("helvetica", "normal"); doc.text(emp.nik, 45, startY + 7); doc.line(45, startY+8, 120, startY+8);

    doc.setFont("helvetica", "bold"); doc.text("Model", 150, startY); doc.text(":", 170, startY);
    doc.setFont("helvetica", "normal"); doc.text(ev.model || '', 175, startY); doc.line(175, startY+1, 250, startY+1);

    doc.setFont("helvetica", "bold"); doc.text("Tanggal", 150, startY + 7); doc.text(":", 170, startY + 7);
    doc.setFont("helvetica", "normal"); doc.text(ev.date || '', 175, startY + 7); doc.line(175, startY+8, 250, startY+8);

    const tableBody = ev.items.map((item, i) => [
        i + 1, item.part, item.status === 'YES' ? 'V' : '', item.status === 'NO' ? 'V' : '', item.note || ''
    ]);

    for (let i = tableBody.length; i < 15; i++) {
        tableBody.push([i+1, '', '', '', '']);
    }

    doc.autoTable({
        startY: 65,
        head: [['No', 'Item Part', 'YES', 'NO', 'Keterangan']],
        body: tableBody,
        theme: 'plain',
        styles: {
            lineColor: [0, 0, 0], lineWidth: 0.1, fontSize: 9, cellPadding: 2, valign: 'middle'
        },
        headStyles: {
            fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold', halign: 'center'
        },
        columnStyles: {
            0: { cellWidth: 15, halign: 'center' }, 1: { cellWidth: 'auto' }, 2: { cellWidth: 20, halign: 'center' }, 3: { cellWidth: 20, halign: 'center' }, 4: { cellWidth: 80 }
        }
    });

    const finalY = doc.lastAutoTable.finalY + 10;
    const boxW = 50;
    const boxH = 25;
    
    let x = 30;
    doc.rect(x, finalY, boxW, boxH);
    doc.setFontSize(8);
    doc.text("Dibuat", x + boxW/2, finalY + 5, { align: "center" });
    doc.text("( Trainer )", x + boxW/2, finalY + boxH - 5, { align: "center" });

    x += boxW + 50;
    doc.rect(x, finalY, boxW, boxH);
    doc.text("Diperiksa", x + boxW/2, finalY + 5, { align: "center" });
    doc.text("( Foreman )", x + boxW/2, finalY + boxH - 5, { align: "center" });

    x += boxW + 50;
    doc.rect(x, finalY, boxW, boxH);
    doc.text("Disetujui", x + boxW/2, finalY + 5, { align: "center" });
    doc.text("( Supervisor )", x + boxW/2, finalY + boxH - 5, { align: "center" });

    doc.save(`Evaluasi_MultiSkill_${emp.name}.pdf`);
});

// ==========================================
// 13. TANOKO SUMMARY LOGIC
// ==========================================
const models = ['FORTUNER', 'INNOVA ZENIX', 'REBORN', 'RAIZE', 'AGYA', 'YARIS'];

document.getElementById('btnTanoko').addEventListener('click', (e) => {
    e.preventDefault();
    openTanokoModal();
});

document.getElementById('tanokoArea').addEventListener('change', renderTanokoTable);
document.getElementById('tanokoShift').addEventListener('change', renderTanokoTable);

async function openTanokoModal() {
    if (state.companySettings.logo) {
        document.getElementById('tanokoFormLogo').src = state.companySettings.logo;
        document.getElementById('tanokoFormLogo').style.display = 'block';
        document.getElementById('tanokoFormLogoPlaceholder').style.display = 'none';
    } else {
        document.getElementById('tanokoFormLogo').style.display = 'none';
        document.getElementById('tanokoFormLogoPlaceholder').style.display = 'block';
    }
    renderTanokoTable();
    tanokoModal.show();
}

function renderTanokoTable() {
    const tbody = document.getElementById('tanokoTableBody');
    tbody.innerHTML = '';

    const currentShift = document.getElementById('tanokoShift').value;
    
    let filteredEmployees = state.employees;
    if (currentShift !== 'Non-Shift') {
        filteredEmployees = state.employees.filter(e => e.shift === currentShift);
    }
    filteredEmployees.sort((a, b) => a.name.localeCompare(b.name));

    filteredEmployees.forEach((emp, index) => {
        let empSkill = state.tanokoSkills.find(s => s.empId === emp.id);
        if (!empSkill) empSkill = { empId: emp.id, skills: {} };

        const row = document.createElement('tr');
        
        let modelCells = '';
        let totalScore = 0;
        let countScore = 0;

        models.forEach(model => {
            const score = empSkill.skills[model] || 0;
            totalScore += score;
            countScore++;
            modelCells += `
                <td class="text-center">
                    <div class="pie-chart-btn pie-${score}" onclick="cycleTanokoSkill('${emp.id}', '${model}', ${score})" title="${score}%"></div>
                </td>
            `;
        });

        const average = countScore > 0 ? Math.round(totalScore / countScore) : 0;
        let avgClass = 'pie-0';
        if (average > 12 && average <= 37) avgClass = 'pie-25';
        else if (average > 37 && average <= 62) avgClass = 'pie-50';
        else if (average > 62 && average <= 87) avgClass = 'pie-75';
        else if (average > 87) avgClass = 'pie-100';

        row.innerHTML = `
            <td class="text-center">${index + 1}</td>
            <td>${emp.name}</td>
            <td class="text-center">${emp.nik}</td>
            <td class="text-center">${emp.position || '-'}</td>
            ${modelCells}
            <td class="text-center">
                <div class="d-flex align-items-center justify-content-center">
                    <div class="pie-chart-btn ${avgClass} me-2" style="width: 20px; height: 20px; cursor: default;"></div>
                    <span class="fw-bold">${average}</span>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

window.cycleTanokoSkill = async (empId, model, currentScore) => {
    const steps = [0, 25, 50, 75, 100];
    let idx = steps.indexOf(currentScore);
    if (idx === -1) idx = 0;
    
    let nextIdx = (idx + 1) % steps.length;
    const nextScore = steps[nextIdx];

    let empSkillIdx = state.tanokoSkills.findIndex(s => s.empId === empId);
    if (empSkillIdx === -1) {
        state.tanokoSkills.push({ empId: empId, skills: { [model]: nextScore } });
    } else {
        if (!state.tanokoSkills[empSkillIdx].skills) state.tanokoSkills[empSkillIdx].skills = {};
        state.tanokoSkills[empSkillIdx].skills[model] = nextScore;
    }

    renderTanokoTable();

    try {
        const dataToSave = state.tanokoSkills.find(s => s.empId === empId);
        await dbPut('tanoko_skills', dataToSave);
    } catch (e) {
        console.error("Failed to auto-save skill", e);
    }
};

document.getElementById('saveTanokoBtn').addEventListener('click', () => {
    alert('Data tersimpan otomatis setiap kali Anda mengubah chart!');
});

// ==========================================
// 14. REPORT LOGIC
// ==========================================
document.getElementById('btnReportTraining').addEventListener('click', () => {
    renderReportTable();
    reportModal.show();
});

document.getElementById('btnAddReportData').addEventListener('click', () => {
    resetReportForm();
    document.getElementById('inputReportTitle').innerText = 'Input Data Report Training';
    reportModal.hide();
    inputReportModal.show();
});

const reportSearchEmp = document.getElementById('reportSearchEmp');
reportSearchEmp.addEventListener('input', (e) => {
    const val = e.target.value.toLowerCase();
    const list = document.getElementById('employeeListOptions');
    list.innerHTML = '';
    
    if (val.length < 1) return;

    state.employees.forEach(emp => {
        if (emp.name.toLowerCase().includes(val) || emp.nik.toLowerCase().includes(val)) {
            const option = document.createElement('option');
            option.value = emp.nik;
            option.innerText = `${emp.name} - ${emp.dept}`;
            list.appendChild(option);
        }
    });

    const match = state.employees.find(emp => emp.nik === val);
    if (match) {
        document.getElementById('reportEmpId').value = match.id;
        document.getElementById('repName').innerText = match.name;
        document.getElementById('repNIK').innerText = match.nik;
        document.getElementById('repDept').innerText = match.dept;
        document.getElementById('repPos').innerText = match.position || '-';
        document.getElementById('repLvl').innerText = match.level || '-';
        document.getElementById('repShift').innerText = match.shift || '-';
    } else {
        document.getElementById('reportEmpId').value = '';
        document.getElementById('repName').innerText = '-';
        document.getElementById('repNIK').innerText = '-';
        document.getElementById('repDept').innerText = '-';
        document.getElementById('repPos').innerText = '-';
        document.getElementById('repLvl').innerText = '-';
        document.getElementById('repShift').innerText = '-';
    }
});

document.getElementById('saveReportBtn').addEventListener('click', async () => {
    const empId = document.getElementById('reportEmpId').value;
    const trainId = document.getElementById('reportTrainId').value;
    const materi = document.getElementById('repMateri').value;
    const trainer = document.getElementById('repTrainer').value;
    const startDate = document.getElementById('repStartDate').value;
    const endDate = document.getElementById('repEndDate').value;
    const duration = document.getElementById('repDuration').value;

    if (!empId) {
        alert('Silakan pilih karyawan terlebih dahulu!');
        return;
    }
    if (!materi || !startDate) {
        alert('Materi dan Tanggal Mulai wajib diisi!');
        return;
    }

    const reportData = {
        id: trainId || crypto.randomUUID(),
        empId: empId,
        nik: document.getElementById('repNIK').innerText,
        name: document.getElementById('repName').innerText,
        dept: document.getElementById('repDept').innerText,
        position: document.getElementById('repPos').innerText,
        level: document.getElementById('repLvl').innerText,
        shift: document.getElementById('repShift').innerText,
        materi: materi,
        trainer: trainer,
        date: startDate,
        endDate: endDate,
        duration: duration
    };

    try {
        await dbPut('report_trainings', reportData);
        
        if (trainId) {
            const idx = state.reportTrainings.findIndex(r => r.id === trainId);
            if (idx >= 0) state.reportTrainings[idx] = reportData;
        } else {
            state.reportTrainings.push(reportData);
        }

        alert('Data Report berhasil disimpan!');
        inputReportModal.hide();
        renderReportTable();
        reportModal.show();
    } catch (err) {
        console.error(err);
        alert('Gagal menyimpan data report');
    }
});

function resetReportForm() {
    document.getElementById('reportForm').reset();
    document.getElementById('reportEmpId').value = '';
    document.getElementById('reportTrainId').value = '';
    document.getElementById('repName').innerText = '-';
    document.getElementById('repNIK').innerText = '-';
    document.getElementById('repDept').innerText = '-';
    document.getElementById('repPos').innerText = '-';
    document.getElementById('repLvl').innerText = '-';
    document.getElementById('repShift').innerText = '-';
}

function editReportData(empId, trainId) {
    const report = state.reportTrainings.find(r => r.id === trainId);
    if (!report) return;

    document.getElementById('inputReportTitle').innerText = 'Edit Data Report Training';
    
    document.getElementById('reportEmpId').value = report.empId;
    document.getElementById('reportTrainId').value = report.id;
    document.getElementById('reportSearchEmp').value = report.nik;
    
    document.getElementById('repName').innerText = report.name;
    document.getElementById('repNIK').innerText = report.nik;
    document.getElementById('repDept').innerText = report.dept;
    document.getElementById('repPos').innerText = report.position || '-';
    document.getElementById('repLvl').innerText = report.level || '-';
    document.getElementById('repShift').innerText = report.shift || '-';

    document.getElementById('repMateri').value = report.materi;
    document.getElementById('repTrainer').value = report.trainer;
    document.getElementById('repStartDate').value = report.date;
    document.getElementById('repEndDate').value = report.endDate || '';
    document.getElementById('repDuration').value = report.duration;

    reportModal.hide();
    inputReportModal.show();
}

function renderReportTable() {
    const tbody = document.getElementById('reportTableBody');
    tbody.innerHTML = '';

    let count = 1;
    state.reportTrainings.forEach(rep => {
        const row = document.createElement('tr');
        const year = rep.date ? rep.date.substring(0, 4) : '-';
        row.innerHTML = `
            <td>${count++}</td>
            <td>${rep.nik}</td>
            <td>${rep.name}</td>
            <td>${rep.dept}</td>
            <td>${rep.level || '-'}</td>
            <td>${rep.position || '-'}</td>
            <td>${rep.shift || '-'}</td>
            <td>${rep.materi}</td>
            <td>${rep.trainer}</td>
            <td>${rep.date || '-'}</td>
            <td>${rep.endDate || '-'}</td>
            <td>${year}</td>
            <td class="text-center">
                <button class="btn btn-sm btn-warning" onclick="editReportData('${rep.empId}', '${rep.id}')"><i class="fas fa-edit"></i></button>
                <button class="btn btn-sm btn-danger ms-1" onclick="deleteReportData('${rep.id}')"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

window.deleteReportData = async (id) => {
    if(!confirm('Hapus data report ini?')) return;
    try {
        await dbDelete('report_trainings', id);
        state.reportTrainings = state.reportTrainings.filter(r => r.id !== id);
        renderReportTable();
    } catch (err) {
        console.error(err);
        alert('Gagal menghapus data report');
    }
};

document.getElementById('exportReportPdfBtn').addEventListener('click', () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('landscape');

    doc.setLineWidth(0.5);
    doc.rect(10, 10, 277, 25);
    
    if (state.companySettings.logo) {
        try { doc.addImage(state.companySettings.logo, 'JPEG', 12, 12, 35, 20); } catch (e) {}
    } else {
        doc.setFontSize(10);
        doc.text("Logo Here", 15, 25);
    }
    
    doc.line(50, 10, 50, 35);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("PT SENTRAL MULTI INDOTAMA", 148, 18, { align: "center" });
    
    doc.line(50, 22, 220, 22);
    doc.setFontSize(12);
    doc.text("REPORT TRAINING", 148, 30, { align: "center" });

    doc.line(220, 10, 220, 35);

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    const rightX = 222;
    doc.text("No Dokumen : SMI-FR-PPD-04-04", rightX, 15);
    doc.line(220, 17, 287, 17);
    doc.text("Revisi          : 03", rightX, 21);
    doc.line(220, 23, 287, 23);
    doc.text("Hal               : 1", rightX, 27);
    doc.line(220, 29, 287, 29);
    doc.text("Tgl Berlaku  : 07 Maret 2024", rightX, 33);

    const tableData = [];
    let count = 1;
    state.reportTrainings.forEach(rep => {
        const year = rep.date ? rep.date.substring(0, 4) : '';
        tableData.push([
            count++, rep.nik, rep.name, rep.dept, rep.level || '', rep.position || '', rep.shift || '',
            rep.materi, rep.trainer, rep.date || '', rep.endDate || '', year
        ]);
    });

    doc.autoTable({
        startY: 40,
        head: [['NO', 'NIK', 'Nama Lengkap', 'Divisi', 'Level', 'Jabatan', 'Shift', 'Materi Training', 'Penyelenggara', 'Tgl Mulai', 'Tgl Berakhir', 'Tahun']],
        body: tableData,
        theme: 'plain',
        styles: { fontSize: 8, cellPadding: 1, lineColor: [0, 0, 0], lineWidth: 0.1 },
        headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold', halign: 'center', valign: 'middle' },
        columnStyles: { 0: { cellWidth: 10, halign: 'center' } },
        margin: { left: 10, right: 10 }
    });

    doc.save('Report_Training_SMI_2026.pdf');
});

// ==========================================
// 15. SEARCH & PAGINATION
// ==========================================
searchInput.addEventListener('input', (e) => {
    state.searchTerm = e.target.value.toLowerCase();
    state.currentPage = 1;
    renderTable();
});

function renderDashboard() {
    renderLogo();
    renderTable();
}

function renderTable() {
    let filtered = state.employees.filter(e => 
        e.name.toLowerCase().includes(state.searchTerm) || 
        e.nik.toLowerCase().includes(state.searchTerm)
    );

    const totalItems = filtered.length;
    const start = (state.currentPage - 1) * state.rowsPerPage;
    const end = start + state.rowsPerPage;
    const paginated = filtered.slice(start, end);

    employeeTableBody.innerHTML = '';
    paginated.forEach(e => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><img src="${e.photo || 'https://via.placeholder.com/40'}" class="avatar-sm"></td>
            <td>${e.nik}</td>
            <td>${e.name}</td>
            <td>${e.dept}</td>
            <td>${e.company}</td>
            <td>${e.joinDate}</td>
            <td class="text-center">
                <button class="btn btn-sm btn-info text-white me-1" onclick="openTrainingModal('${e.id}')" title="Training"><i class="fas fa-graduation-cap"></i></button>
                <button class="btn btn-sm btn-purple text-white me-1" style="background-color: #6f42c1;" onclick="openMultiSkillModal('${e.id}')" title="Multi Skill"><i class="fas fa-tools"></i></button>
                <button class="btn btn-sm btn-warning text-dark me-1" onclick="openEvalModal('${e.id}')" title="Evaluasi Multi Skill"><i class="fas fa-clipboard-check"></i></button>
                <button class="btn btn-sm btn-secondary me-1" onclick="editEmployee('${e.id}')" title="Edit"><i class="fas fa-edit"></i></button>
                <button class="btn btn-sm btn-danger" onclick="deleteEmployee('${e.id}')" title="Hapus"><i class="fas fa-trash"></i></button>
            </td>
        `;
        employeeTableBody.appendChild(row);
    });

    document.getElementById('paginationInfo').innerText = `Showing ${paginated.length > 0 ? start + 1 : 0} to ${Math.min(end, totalItems)} of ${totalItems} entries`;
    
    const totalDisplay = document.getElementById('totalEmployeesDisplay');
    if(totalDisplay) totalDisplay.innerText = state.employees.length;

    renderPagination(totalItems);
}

function renderPagination(totalItems) {
    const totalPages = Math.ceil(totalItems / state.rowsPerPage);
    paginationElement.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
        const li = document.createElement('li');
        li.className = `page-item ${i === state.currentPage ? 'active' : ''}`;
        li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
        li.addEventListener('click', (e) => {
            e.preventDefault();
            state.currentPage = i;
            renderTable();
        });
        paginationElement.appendChild(li);
    }
}

// ==========================================
// 16. PDF EXPORT (EMPLOYEE TRAINING)
// ==========================================
document.getElementById('exportPdfBtn').addEventListener('click', () => {
    if (!currentTrainingEmpId) return;
    const emp = state.employees.find(e => e.id === currentTrainingEmpId);
    generatePDF(emp);
});

function generatePDF(emp) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setLineWidth(0.5);
    doc.rect(10, 10, 190, 30);
    
    if (state.companySettings.logo) {
        try { doc.addImage(state.companySettings.logo, 'JPEG', 12, 12, 35, 20); } catch (e) {}
    } else {
        doc.setFontSize(10);
        doc.text("Logo Here", 15, 25);
    }
    
    doc.line(50, 10, 50, 40);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("PT SENTRAL MULTI INDOTAMA", 100, 20, { align: "center" });
    
    doc.line(50, 25, 150, 25);
    doc.setFontSize(12);
    doc.text("Form Personal Training", 100, 33, { align: "center" });

    doc.line(150, 10, 150, 40);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("No Dokumen : SMI-FR-PPD-04-03", 152, 15);
    doc.line(150, 17, 200, 17);
    doc.text("Revisi          : 03", 152, 21);
    doc.line(150, 23, 200, 23);
    doc.text("Hal               : 1", 152, 27);
    doc.line(150, 29, 200, 29);
    doc.text("Tgl Berlaku  : 07 Maret 2024", 152, 33);

    doc.rect(10, 42, 190, 40);
    doc.setFontSize(10);
    
    if (emp.photo) {
        try { doc.addImage(emp.photo, 'JPEG', 165, 44, 30, 36); } catch (e) {}
    }

    const startY = 50;
    const lineHeight = 6;
    
    doc.text("Nama", 15, startY); doc.text(":", 55, startY); doc.text(emp.name || "", 60, startY);
    doc.text("Perusahaan", 15, startY + lineHeight); doc.text(":", 55, startY + lineHeight); doc.text(emp.company || "", 60, startY + lineHeight);
    doc.text("No. Nik", 15, startY + lineHeight * 2); doc.text(":", 55, startY + lineHeight * 2); doc.text(emp.nik || "", 60, startY + lineHeight * 2);
    doc.text("Tanggal Masuk Kerja", 15, startY + lineHeight * 3); doc.text(":", 55, startY + lineHeight * 3); doc.text(emp.joinDate || "", 60, startY + lineHeight * 3);
    doc.text("Bagian", 15, startY + lineHeight * 4); doc.text(":", 55, startY + lineHeight * 4); doc.text(emp.dept || "", 60, startY + lineHeight * 4);

    doc.setFont("helvetica", "bold");
    doc.text("Training History :", 10, 90);

    const tableData = emp.trainings ? emp.trainings.map((t, i) => [
        i + 1, t.materi, t.date, t.duration, t.trainer, ""
    ]) : [];

    for (let i = tableData.length; i < 17; i++) {
        tableData.push([i + 1, "", "", "", "", ""]);
    }

    doc.autoTable({
        startY: 92,
        head: [['No', 'Materi Training', 'Tgl/Bln/Thn', 'Durasi', 'Trainer', 'Keterangan']],
        body: tableData,
        theme: 'plain',
        styles: { lineColor: [0, 0, 0], lineWidth: 0.1, fontSize: 9 },
        headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold', halign: 'center' },
        columnStyles: { 0: { cellWidth: 10, halign: 'center' }, 1: { cellWidth: 'auto' }, 2: { cellWidth: 30, halign: 'center' }, 3: { cellWidth: 20, halign: 'center' }, 4: { cellWidth: 30 }, 5: { cellWidth: 30 } },
        margin: { left: 10, right: 10 }
    });

    doc.save(`Training_History_${emp.name}.pdf`);
}

// ==========================================
// 17. ATTENDANCE LOGIC
// ==========================================
let currentAttendanceMonth = '';
const attendanceModal = new bootstrap.Modal(document.getElementById('attendanceModal'));
const inputAttendanceModal = new bootstrap.Modal(document.getElementById('inputAttendanceModal'));

function openAttendance(month) {
    currentAttendanceMonth = month;
    document.getElementById('attendanceMonthTitle').innerText = month;
    renderAttendanceTable();
    attendanceModal.show();
}

function renderAttendanceTable() {
    const tbody = document.getElementById('attendanceTableBody');
    tbody.innerHTML = '';
    
    // Filter by month
    const records = state.attendanceRecords.filter(r => r.month === currentAttendanceMonth);
    
    records.forEach((r, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${r.date}</td>
            <td>${r.materi}</td>
            <td>${r.trainer}</td>
            <td class="text-center">
                ${r.file ? 
                    `<button class="btn btn-sm btn-info" onclick="viewAttendanceFile('${r.id}')" title="Lihat"><i class="fas fa-eye"></i></button>` : 
                    '<span class="badge bg-secondary">No File</span>'
                }
            </td>
            <td>${r.note || '-'}</td>
            <td class="text-center">
                <button class="btn btn-sm btn-warning mb-1" onclick="editAttendance('${r.id}')"><i class="fas fa-edit"></i></button>
                <button class="btn btn-sm btn-danger mb-1" onclick="deleteAttendance('${r.id}')"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

document.getElementById('btnAddAttendance').addEventListener('click', () => {
    document.getElementById('attendanceForm').reset();
    document.getElementById('attId').value = '';
    document.getElementById('attMonth').value = currentAttendanceMonth;
    document.getElementById('inputAttendanceTitle').innerText = 'Input Daftar Hadir - ' + currentAttendanceMonth;
    
    attendanceModal.hide();
    inputAttendanceModal.show();
});

document.getElementById('saveAttendanceBtn').addEventListener('click', async () => {
    const id = document.getElementById('attId').value;
    const month = document.getElementById('attMonth').value;
    const date = document.getElementById('attDate').value;
    const materi = document.getElementById('attMateri').value;
    const trainer = document.getElementById('attTrainer').value;
    const note = document.getElementById('attNote').value;
    const fileInput = document.getElementById('attFile').files[0];
    
    if (!date || !materi) {
        alert('Tanggal dan Materi wajib diisi!');
        return;
    }

    let fileBase64 = null;
    let fileType = null;
    
    // Keep old file if editing and no new file selected
    if (id) {
        const oldRec = state.attendanceRecords.find(r => r.id === id);
        if (oldRec) {
            fileBase64 = oldRec.file;
            fileType = oldRec.fileType;
        }
    }

    if (fileInput) {
        if (fileInput.size > 5 * 1024 * 1024) { // 5MB limit
             alert('Ukuran file terlalu besar! Max 5MB.');
             return;
        }
        try {
            fileBase64 = await fileToBase64(fileInput);
            fileType = fileInput.type;
        } catch (e) {
            alert('Gagal membaca file');
            return;
        }
    }

    const record = {
        id: id || crypto.randomUUID(),
        month, date, materi, trainer, note,
        file: fileBase64,
        fileType
    };

    try {
        await dbPut('attendance_records', record);
        
        const idx = state.attendanceRecords.findIndex(r => r.id === record.id);
        if (idx >= 0) state.attendanceRecords[idx] = record;
        else state.attendanceRecords.push(record);
        
        inputAttendanceModal.hide();
        renderAttendanceTable();
        attendanceModal.show();
        alert('Data berhasil disimpan!');
    } catch (err) {
        console.error(err);
        alert('Gagal menyimpan data');
    }
});

function editAttendance(id) {
    const rec = state.attendanceRecords.find(r => r.id === id);
    if (!rec) return;
    
    document.getElementById('attId').value = rec.id;
    document.getElementById('attMonth').value = rec.month;
    document.getElementById('attDate').value = rec.date;
    document.getElementById('attMateri').value = rec.materi;
    document.getElementById('attTrainer').value = rec.trainer;
    document.getElementById('attNote').value = rec.note || '';
    
    document.getElementById('inputAttendanceTitle').innerText = 'Edit Daftar Hadir - ' + rec.month;
    
    attendanceModal.hide();
    inputAttendanceModal.show();
}

async function deleteAttendance(id) {
    if(!confirm('Hapus data ini?')) return;
    try {
        await dbDelete('attendance_records', id);
        state.attendanceRecords = state.attendanceRecords.filter(r => r.id !== id);
        renderAttendanceTable();
    } catch (e) {
        alert('Gagal menghapus data');
    }
}

function viewAttendanceFile(id) {
    const rec = state.attendanceRecords.find(r => r.id === id);
    if (!rec || !rec.file) return;
    
    const container = document.getElementById('certPreviewContainer');
    if (rec.fileType && rec.fileType.includes('pdf')) {
        container.innerHTML = `<iframe src="${rec.file}" style="width:100%; height:500px;" frameborder="0"></iframe>`;
    } else {
        container.innerHTML = `<img src="${rec.file}" class="img-fluid" />`;
    }
    certModal.show();
}

window.openAttendance = openAttendance;
window.editAttendance = editAttendance;
window.deleteAttendance = deleteAttendance;
window.viewAttendanceFile = viewAttendanceFile;

// ==========================================
// 18. UTILITIES
// ==========================================
const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
};