// ==========================================
// 1. CONFIGURAanokoION & STATE
// ==========================================
const DB_NAME = 'HRSystemDB';
const DB_VERSION = 8;
let db;

let state = {
    user: null, // Logged in user
    employees: [],
    companySettings: {
        logo: '',
        name: 'PT SENTRAL MULTI INDOTAMA'
    },
    currentPage: 1,
    rowsPerPage: 20,
    searchTerm: '',
    reportTrainings: [],
    multiSkills: [],
    evalMultiSkills: [],
    tanokoSkills: [],
    attendanceRecords: [],
    modelImages: {}, // { MODEL_NAME: base64 }
    msByPart: [] // [{ empId, data: { MODEL: { target, actual } } }]
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
const settingsModal = new bootstrap.Modal(document.getElementById('settingsModal'));
const pkMultiSkillEditModal = new bootstrap.Modal(document.getElementById('pkMultiSkillEditModal'));

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

const btnSettingsSidebar = document.getElementById('btnSettingsSidebar');
if(btnSettingsSidebar) {
    btnSettingsSidebar.addEventListener('click', (e) => {
        e.preventDefault();
        renderLogo();
        settingsModal.show();
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
            if (!db.objectStoreNames.contains('model_images')) db.createObjectStore('model_images', { keyPath: 'model' });
            if (!db.objectStoreNames.contains('ms_by_part')) db.createObjectStore('ms_by_part', { keyPath: 'empId' });
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

        try {
            const mi = await dbGetAll('model_images');
            state.modelImages = {};
            (mi || []).forEach(rec => { state.modelImages[rec.model] = rec.data; });
        } catch (e) { state.modelImages = {}; }

        try {
            const mp = await dbGetAll('ms_by_part');
            state.msByPart = mp || [];
        } catch (e) { state.msByPart = []; }

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
    const logoImg = document.getElementById('navLogo');
    const logoPlaceholder = document.getElementById('navLogoPlaceholder');

    if (state.companySettings.logo) {
        if(logoImg) {
            logoImg.src = state.companySettings.logo;
            logoImg.classList.remove('d-none');
        }
        if(logoPlaceholder) logoPlaceholder.classList.add('d-none');
    } else {
        if(logoImg) logoImg.classList.add('d-none');
        if(logoPlaceholder) logoPlaceholder.classList.remove('d-none');
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
    const idxStatus = headers.findIndex(h => h.includes('status') || h.includes('jenis') || h.includes('employment') || h.includes('type'));

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
            shift: existing ? existing.shift : '',
            status: idxStatus !== -1 ? cleanVal(cols[idxStatus]) : (existing ? existing.status || '' : '')
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
window.editTraining = editTraining;
window.deleteTraining = deleteTraining;
window.editCert = editCert;
window.editReportData = editReportData;
window.openMultiSkillModal = openMultiSkillModal;
window.deleteMultiSkillPart = deleteMultiSkillPart;
window.openEvalModal = openEvalModal;

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
    const sel = document.getElementById('msModel');
    if (!sel.value) sel.value = 'AGYA';
    const selectedModel = sel.value;
    let msData = state.multiSkills.find(m => m.empId === empId && m.model === selectedModel);
    if (!msData) msData = { id: crypto.randomUUID(), empId: empId, model: selectedModel, parts: [] };
    currentMultiSkillData = JSON.parse(JSON.stringify(msData));
    renderMultiSkillTable();
    sel.onchange = () => {
        const m = sel.value;
        let d = state.multiSkills.find(x => x.empId === currentMultiSkillEmpId && x.model === m);
        if (!d) d = { id: crypto.randomUUID(), empId: currentMultiSkillEmpId, model: m, parts: [] };
        currentMultiSkillData = JSON.parse(JSON.stringify(d));
        renderMultiSkillTable();
    };
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

// Updated Standard Questions with Sub-Categories (Item Check)
const standardEvalQuestions = [
    { id: 'prep_part_1', category: 'Preparation', subCategory: 'PART', text: 'Mengenal part yang akan dipasang' },
    { id: 'prep_part_2', category: 'Preparation', subCategory: 'PART', text: 'Mengerti kelengkapan part yang akan dipasang' },
    { id: 'prep_part_3', category: 'Preparation', subCategory: 'PART', text: 'Meletakkan part sesuai pada tempatnya' },
    
    { id: 'prep_tools_1', category: 'Preparation', subCategory: 'TOOLS', text: 'Mengenal tools yang harus digunakan' },
    { id: 'prep_tools_2', category: 'Preparation', subCategory: 'TOOLS', text: 'Paham terhadap abnormality tools' },
    { id: 'prep_tools_3', category: 'Preparation', subCategory: 'TOOLS', text: 'Mengerti cara penggunaan tools' },
    { id: 'prep_tools_4', category: 'Preparation', subCategory: 'TOOLS', text: 'Meletakkan tools sesuai pada tempatnya' },

    { id: 'prep_apd_1', category: 'Preparation', subCategory: 'APD', text: 'Mengenal APD yang harus dipakai' },
    { id: 'prep_apd_2', category: 'Preparation', subCategory: 'APD', text: 'Mengerti cara penggunaan APD' },

    { id: 'proc_ik_1', category: 'Process', subCategory: 'IK / IM/SOP/EIS', text: 'Melakukan instalasi sesuai dengan IK/IM/SOP/EIS' },
    { id: 'proc_ik_2', category: 'Process', subCategory: 'IK / IM/SOP/EIS', text: 'Melakukan check ulang setelah pemasangan' },
    { id: 'proc_ik_3', category: 'Process', subCategory: 'IK / IM/SOP/EIS', text: 'Melakukan pemberian marking' },

    { id: 'proc_cycle_1', category: 'Process', subCategory: 'Cycle Time', text: 'Dapat bekerja sesuai waktu yang sudah ditentukan (Cycle Time)' },

    { id: 'check_app_1', category: 'Check', subCategory: 'Appearance & Function', text: 'Mengetahui abnormality setelah pemasangan' },
    { id: 'check_app_2', category: 'Check', subCategory: 'Appearance & Function', text: 'Mengerti item pengecekan terhadap part yg dipasang' }
];

function openEvalModal(empId) {
    currentEvalEmpId = empId;
    const emp = state.employees.find(e => e.id === empId);
    if (!emp) return;

    document.getElementById('evalNameInput').value = emp.name;
    document.getElementById('evalNikInput').value = emp.nik;
    
    // Logo Logic
    if (state.companySettings.logo) {
        document.getElementById('evalFormLogo').src = state.companySettings.logo;
        document.getElementById('evalFormLogo').style.display = 'block';
        document.getElementById('evalFormLogoPlaceholder').style.display = 'none';
    } else {
        document.getElementById('evalFormLogo').style.display = 'none';
        document.getElementById('evalFormLogoPlaceholder').style.display = 'block';
    }

    // Trainers List (Updated)
    const trainers = [
        "Dedi Af", "Alhamsah", "Budi S", "Kusendi", 
        "jainal Arifin", "Supriyatna"
    ];
    
    const sigTrainer = document.getElementById('sigTrainer');
    sigTrainer.innerHTML = '<option value="">Pilih nama</option>';
    trainers.forEach(name => {
        const opt = document.createElement('option');
        opt.value = name;
        opt.innerText = name;
        sigTrainer.appendChild(opt);
    });

    let evData = state.evalMultiSkills.find(e => e.empId === empId);
    
    // Migration Logic: Convert old single-session data to new array-session data
    if (!evData) {
        evData = {
            id: crypto.randomUUID(),
            empId: empId,
            model: '',
            sessions: Array(6).fill().map(() => ({ date: '', part: '', scores: {} })),
            signatures: { mengetahui: '', mp: emp.name, trainer: '' }
        };
    } else {
        // If old format (has .items), migrate to session[0]
        if (evData.items && !evData.sessions) {
            const session0 = {
                date: evData.date || '',
                part: evData.itemPart || '',
                scores: {}
            };
            // Map old items to scores
            // Note: Old items had random IDs, new system uses fixed IDs (prep_part_1, etc.)
            // Since mapping is hard without fixed IDs, we might lose old check data unless we match by text.
            // For now, we'll try to match by text or just reset if structure differs too much.
            // Given the requirement change, it's safer to just init fresh sessions or try best effort.
            evData.items.forEach((item, idx) => {
                if (idx < standardEvalQuestions.length) {
                    const qId = standardEvalQuestions[idx].id;
                    session0.scores[qId] = item.status;
                }
            });
            
            evData.sessions = Array(6).fill().map(() => ({ date: '', part: '', scores: {} }));
            evData.sessions[0] = session0;
        }
        
        // Ensure sessions array has 6 elements
        if (!evData.sessions) evData.sessions = Array(6).fill().map(() => ({ date: '', part: '', scores: {} }));
        while (evData.sessions.length < 6) evData.sessions.push({ date: '', part: '', scores: {} });
    }
    
    currentEvalData = JSON.parse(JSON.stringify(evData));

    document.getElementById('evalModel').value = currentEvalData.model || '';
    
    // Populate Header Inputs (Date & Part)
    currentEvalData.sessions.forEach((sess, i) => {
        const dateInput = document.getElementById(`evalDate_${i}`);
        const partInput = document.getElementById(`evalPart_${i}`);
        if(dateInput) dateInput.value = sess.date || '';
        if(partInput) partInput.value = sess.part || '';
        
        // Add listeners to update state on change
        if(dateInput) dateInput.onchange = (e) => currentEvalData.sessions[i].date = e.target.value;
        if(partInput) partInput.onchange = (e) => currentEvalData.sessions[i].part = e.target.value;
    });
    
    // Signatures
    document.getElementById('sigMengetahui').value = currentEvalData.signatures?.mengetahui || '';
    document.getElementById('sigMpDisplay').innerText = emp.name;
    document.getElementById('sigTrainer').value = currentEvalData.signatures?.trainer || '';

    renderEvalTable();
    recalcEvalTotals();
    evalModal.show();
}

function renderEvalTable() {
    const tbody = document.getElementById('evalTableBody');
    tbody.innerHTML = '';

    // We need to track rowspans
    // Since we iterate through the fixed `standardEvalQuestions` array, we can pre-calculate or detect first occurrence.
    
    let lastCategory = '';
    let lastSubCategory = '';
    
    // Helper to count rows for rowspan
    const getCatRowSpan = (cat) => standardEvalQuestions.filter(q => q.category === cat).length;
    const getSubCatRowSpan = (sub) => standardEvalQuestions.filter(q => q.subCategory === sub).length;

    standardEvalQuestions.forEach((q, index) => {
        const row = document.createElement('tr');
        
        // Category Column (Merged)
        if (q.category !== lastCategory) {
            const catCell = document.createElement('td');
            catCell.innerText = q.category;
            catCell.rowSpan = getCatRowSpan(q.category);
            catCell.className = "fw-bold align-middle bg-light";
            catCell.style.width = "100px";
            row.appendChild(catCell);
            lastCategory = q.category;
        }
        
        // SubCategory Column (Merged)
        if (q.subCategory !== lastSubCategory) {
            const subCell = document.createElement('td');
            subCell.innerText = q.subCategory;
            subCell.rowSpan = getSubCatRowSpan(q.subCategory);
            subCell.className = "fw-bold align-middle";
            subCell.style.width = "150px";
            row.appendChild(subCell);
            lastSubCategory = q.subCategory;
        }

        // Evaluasi Text
        const textCell = document.createElement('td');
        textCell.innerText = `${index + 1}. ${q.text}`; // Add numbering based on global index? Or sub-index? 
        // The image shows numbering 1,2,3 for each subcategory.
        // Let's compute local index.
        const localIndex = standardEvalQuestions.filter(x => x.subCategory === q.subCategory).findIndex(x => x.id === q.id) + 1;
        textCell.innerText = `${localIndex}. ${q.text}`;
        textCell.className = "align-middle small";
        row.appendChild(textCell);

        // Render 6 Session Columns (Yes/No pairs)
        currentEvalData.sessions.forEach((sess, sessIdx) => {
            const score = sess.scores[q.id];
            const isYes = score === 'YES';
            const isNo = score === 'NO';
            
            // Yes Cell
            const yesCell = document.createElement('td');
            yesCell.className = "text-center align-middle p-0";
            yesCell.innerHTML = `<input type="checkbox" class="form-check-input" ${isYes ? 'checked' : ''} onclick="updateEvalScore(${sessIdx}, '${q.id}', 'YES', this)">`;
            row.appendChild(yesCell);

            // No Cell
            const noCell = document.createElement('td');
            noCell.className = "text-center align-middle p-0";
            noCell.innerHTML = `<input type="checkbox" class="form-check-input" ${isNo ? 'checked' : ''} onclick="updateEvalScore(${sessIdx}, '${q.id}', 'NO', this)">`;
            row.appendChild(noCell);
        });

        tbody.appendChild(row);
    });
}

window.updateEvalScore = (sessIdx, qId, val, checkbox) => {
    // If checked, set value. If unchecked, clear value.
    // Also ensure mutual exclusivity visually (though standard checkbox allows multiple, logic should force one)
    // Actually, matrix usually implies mutual exclusive Yes/No.
    
    if (checkbox.checked) {
        currentEvalData.sessions[sessIdx].scores[qId] = val;
        // Uncheck the other one
        // We need to find the other checkbox in the DOM or re-render. Re-render is safer but slower.
        // Let's just re-render to be safe and simple.
        renderEvalTable();
    } else {
        delete currentEvalData.sessions[sessIdx].scores[qId];
    }
    recalcEvalTotals();
};

function recalcEvalTotals() {
    currentEvalData.sessions.forEach((sess, i) => {
        let yesCount = 0;
        let noCount = 0;
        let totalAnswered = 0;

        standardEvalQuestions.forEach(q => {
            if (sess.scores[q.id] === 'YES') yesCount++;
            if (sess.scores[q.id] === 'NO') noCount++;
        });

        document.getElementById(`totalYes_${i}`).innerText = yesCount;
        document.getElementById(`totalNo_${i}`).innerText = noCount;

        // Percentage logic: (Yes / Total Items) * 100? Or (Yes / (Yes+No))?
        // Usually it's against total possible items (15 items).
        const totalItems = standardEvalQuestions.length;
        const perc = Math.round((yesCount / totalItems) * 100);
        
        document.getElementById(`percYes_${i}`).innerText = perc + '%';
        document.getElementById(`percNo_${i}`).innerText = '0%'; // Usually No % is not tracked or is (No/Total)? Image shows 0% if empty. 
        // Image shows: Yes=100%, No=0%. 
        // Let's assume No% is also calculated.
        const percNo = Math.round((noCount / totalItems) * 100);
        document.getElementById(`percNo_${i}`).innerText = percNo + '%';
    });
}

document.getElementById('saveEvalBtn').addEventListener('click', async () => {
    if (!currentEvalEmpId) return;
    
    currentEvalData.model = document.getElementById('evalModel').value;
    
    currentEvalData.signatures = {
        mengetahui: document.getElementById('sigMengetahui').value,
        mp: document.getElementById('sigMpDisplay').innerText,
        trainer: document.getElementById('sigTrainer').value
    };

    try {
        await dbPut('eval_multi_skills', currentEvalData);
        
        const idx = state.evalMultiSkills.findIndex(e => e.id === currentEvalData.id);
        if (idx >= 0) state.evalMultiSkills[idx] = currentEvalData;
        else state.evalMultiSkills.push(currentEvalData);

        alert('Data Evaluasi berhasil disimpan!');
    } catch (err) {
        console.error(err);
        alert('Gagal menyimpan data');
    }
});

document.getElementById('exportEvalPdfBtn').addEventListener('click', () => {
    const emp = state.employees.find(e => e.id === currentEvalEmpId);
    if (!emp || !currentEvalData) return;

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('l', 'mm', 'a3'); 

    // Colors
    const headerBlue = [255, 255, 255];
    const catPrepColor = [255, 255, 255];
    const catProcColor = [255, 255, 255];
    const catCheckColor = [255, 255, 255];

    // ==========================================
    // 1. HEADER (Manual Draw)
    // ==========================================
    const logoImg = state.companySettings.logo || null;
    
    doc.setLineWidth(0.3);
    doc.setDrawColor(0);
    
    // Main Page Frame
    doc.rect(5, 5, 410, 287);
    
    // Header Box (A3 Landscape: 420mm width. Margin 10mm. Content Width 400mm)
    doc.rect(10, 10, 400, 25);
    
    // Logo Box (Left)
    doc.rect(10, 10, 50, 25);
    if (logoImg) {
        try { doc.addImage(logoImg, 'JPEG', 12, 12, 46, 21); } catch (e) {}
    } else {
        doc.setFontSize(10); doc.text("LOGO", 25, 25);
    }

    // Title Box (Center)
    doc.rect(60, 10, 270, 25);
    doc.line(60, 18, 330, 18); // Horizontal separator
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("PT.SENTRAL MULTI INDOTAMA", 195, 16, { align: "center" });
    doc.setFontSize(14);
    doc.text("CHECK SHEET EVALUASI MULTI SKILL", 195, 23, { align: "center" });

    // Info Box (Right)
    const infoX = 330;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    
    doc.line(infoX, 16, 410, 16);
    doc.text("No. Document", infoX + 2, 14); doc.text(": SMI-FR-PPD-02-03", infoX + 30, 14);
    
    doc.line(infoX, 22, 410, 22);
    doc.text("Halaman", infoX + 2, 20); doc.text(": 1", infoX + 30, 20);
    
    doc.line(infoX, 28, 410, 28);
    doc.text("Revisi", infoX + 2, 26); doc.text(": 04", infoX + 30, 26);
    
    doc.text("Mulai Berlaku", infoX + 2, 32); doc.text(": 02 Februari 2026", infoX + 30, 32);
    
    doc.line(infoX + 28, 10, infoX + 28, 35);


    // ==========================================
    // 2. EMPLOYEE INFO (Left Table)
    // ==========================================
    const startY = 38;
    
    // Use autoTable for this small table to look neat
    doc.autoTable({
        startY: startY,
        body: [
            ['NAMA', emp.name],
            ['NIK', emp.nik],
            ['MODEL', currentEvalData.model || '']
        ],
        theme: 'plain',
        styles: {
            lineColor: [0, 0, 0], lineWidth: 0.1, fontSize: 9, cellPadding: 1.5
        },
        columnStyles: {
            0: { cellWidth: 30, fontStyle: 'bold', fillColor: [255, 255, 255] }, // No color in image for this part? Image shows white.
            1: { cellWidth: 60 }
        },
        margin: { left: 10 }
    });


    // ==========================================
    // 3. MAIN TABLE
    // ==========================================
    const tableBody = [];
    let lastCat = '';
    let lastSub = '';

    const getCatRowSpan = (cat) => standardEvalQuestions.filter(q => q.category === cat).length;
    const getSubCatRowSpan = (sub) => standardEvalQuestions.filter(q => q.subCategory === sub).length;

    standardEvalQuestions.forEach((q, idx) => {
        const row = [];
        
        // Color logic
        let catColor = [255, 255, 255];
        if (q.category === 'Preparation') catColor = catPrepColor;
        else if (q.category === 'Process') catColor = catProcColor;
        else if (q.category === 'Check') catColor = catCheckColor;

        // Category
        if (q.category !== lastCat) {
            row.push({ 
                content: q.category, 
                rowSpan: getCatRowSpan(q.category), 
                styles: { valign: 'middle', halign: 'center', fontStyle: 'bold', fillColor: catColor } 
            });
            lastCat = q.category;
        } 
        
        // SubCategory
        if (q.subCategory !== lastSub) {
            row.push({ 
                content: q.subCategory, 
                rowSpan: getSubCatRowSpan(q.subCategory), 
                styles: { valign: 'middle', halign: 'center', fontStyle: 'bold', fillColor: [255, 255, 255] } // White for item check
            });
            lastSub = q.subCategory;
        }

        // Text
        const localIndex = standardEvalQuestions.filter(x => x.subCategory === q.subCategory).findIndex(x => x.id === q.id) + 1;
        row.push(`${localIndex}.${q.text}`);

        // 6 Sessions
        currentEvalData.sessions.forEach(sess => {
            const score = sess.scores[q.id];
            row.push({ content: score === 'YES' ? '1' : '', styles: { halign: 'center', fontStyle: 'bold' } });
            row.push({ content: score === 'NO' ? '0' : '', styles: { halign: 'center' } }); // Image implies 0 point for No? "Nilai NG (No) = 0 Point"
        });
        
        tableBody.push(row);
    });
    
    // Footer Rows (Total & Percentage)
    const totalRow = [{ content: 'Total Nilai', colSpan: 3, styles: { halign: 'center', fontStyle: 'bold' } }];
    const percRow = [{ content: 'Persentase Nilai', colSpan: 3, styles: { halign: 'center', fontStyle: 'bold' } }];

    currentEvalData.sessions.forEach(sess => {
        let yesCount = 0;
        let noCount = 0;
        standardEvalQuestions.forEach(q => {
            if (sess.scores[q.id] === 'YES') yesCount++;
            if (sess.scores[q.id] === 'NO') noCount++;
        });
        const perc = Math.round((yesCount / standardEvalQuestions.length) * 100);
        const percNo = Math.round((noCount / standardEvalQuestions.length) * 100);

        totalRow.push({ content: yesCount.toString(), styles: { halign: 'center', fontStyle: 'bold' } });
        totalRow.push({ content: '0', styles: { halign: 'center', fontStyle: 'bold' } }); // Image shows 0 for No col
        
        percRow.push({ content: perc + '%', styles: { halign: 'center', fontStyle: 'bold' } });
        percRow.push({ content: '0%', styles: { halign: 'center', fontStyle: 'bold' } });
    });
    
    tableBody.push(totalRow);
    tableBody.push(percRow);

    // Build Headers
    // Row 1: CATEGORY, ITEM CHECK, EVALUASI (span 3 rows)
    const headRow1 = [
        { content: 'CATEGORY', rowSpan: 3, styles: { valign: 'middle', halign: 'center', fillColor: headerBlue } },
        { content: 'ITEM CHECK', rowSpan: 3, styles: { valign: 'middle', halign: 'center', fillColor: headerBlue } },
        { content: 'EVALUASI', rowSpan: 3, styles: { valign: 'middle', halign: 'center', fillColor: headerBlue } }
    ];

    const headRow2 = [];
    const headRow3 = [];

    currentEvalData.sessions.forEach(s => {
        headRow1.push({ content: s.date || 'Input Tanggal', colSpan: 2, styles: { halign: 'center', fillColor: [255, 255, 255], fontSize: 7 } });
        headRow2.push({ content: s.part || 'Input Part', colSpan: 2, styles: { halign: 'center', fillColor: [255, 255, 255], fontSize: 7 } });
        headRow3.push({ content: 'Yes', styles: { halign: 'center', fillColor: headerBlue } });
        headRow3.push({ content: 'No', styles: { halign: 'center', fillColor: headerBlue } });
    });

    doc.autoTable({
        startY: 60,
        head: [headRow1, headRow2, headRow3],
        body: tableBody,
        theme: 'grid',
        styles: {
            lineColor: [0, 0, 0], lineWidth: 0.1, fontSize: 7, cellPadding: 1.5
        },
        headStyles: {
            fillColor: headerBlue, textColor: [0, 0, 0], fontStyle: 'bold', lineWidth: 0.1
        },
        columnStyles: {
            0: { cellWidth: 20 },
            1: { cellWidth: 25 },
            2: { cellWidth: 60 }
        },
        margin: { left: 10, right: 10 }
    });
    
    const finalY = doc.lastAutoTable.finalY;
    
    // ==========================================
    // 4. FOOTER INFO
    // ==========================================
    const noteY = finalY + 5;
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    
    // Catatan
    doc.text("Catatan :", 10, noteY);
    doc.setFont("helvetica", "normal");
    doc.text("1. Nilai OK (Yes) = 1 Point", 10, noteY + 4);
    doc.text("2. Nilai NG (No) = 0 Point", 10, noteY + 8);
    doc.text("3. Minimal Presentase Nilai LULUS = 90%", 10, noteY + 12);
    
    // Rumus
    doc.setFont("helvetica", "bold");
    doc.text("Rumus :", 110, noteY);
    doc.setFont("helvetica", "normal");
    doc.text("Nilai Persentase =", 110, noteY + 6);
    doc.text("Total Nilai", 140, noteY + 4);
    doc.line(135, noteY + 5, 155, noteY + 5); // Fraction line
    doc.text("15 Point", 140, noteY + 9);
    doc.text("X 100 %", 157, noteY + 6);

    // Note Box
    doc.setFont("helvetica", "bold");
    doc.text("Note :", 10, noteY + 20);
    doc.rect(10, noteY + 22, 170, 20); // Empty box

    // ==========================================
    // 5. SIGNATURES
    // ==========================================
    const footerY = noteY + 22; // Align with Note box top
    
    const sigBody = [
        [
            { content: '', styles: { minCellHeight: 15 } }, 
            { content: '', styles: { minCellHeight: 15 } },
            { content: '', styles: { minCellHeight: 15 } }
        ],
        [
            currentEvalData.signatures?.mengetahui || '', 
            currentEvalData.signatures?.mp || '', 
            currentEvalData.signatures?.trainer || '' 
        ],
        [
            'LG/GH',
            'OPERATOR',
            'MP PPD'
        ]
    ];

    doc.autoTable({
        startY: footerY,
        head: [['MENGETAHUI', 'MP TRAINING', 'TRAINER']],
        body: sigBody,
        theme: 'grid',
        styles: {
            lineColor: [0, 0, 0], lineWidth: 0.1, fontSize: 7, halign: 'center', valign: 'middle', cellPadding: 1
        },
        headStyles: {
            fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold', halign: 'center', lineWidth: 0.1
        },
        columnStyles: {
            0: { cellWidth: 32 },
            1: { cellWidth: 32 },
            2: { cellWidth: 32 }
        },
        margin: { left: 182 } // Push to right. 10 + 170 (Note box) + gap = 182 approx
    });

    doc.save(`Evaluasi_MultiSkill_${emp.name}.pdf`);
});

// ==========================================
// 13. TANOKO SUMMARY LOGIC
// ==========================================
const MODELS_SHIFT = {
    'Red': ['FORTUNER', 'INNOVA ZENIX', 'INNOVA REBORN', 'RAIZE', 'AGYA', 'YARIS'],
    'White': ['FORTUNER', 'INNOVA ZENIX', 'INNOVA REBORN', 'RAIZE', 'AGYA', 'YARIS'],
    'Non-Shift': ['HILUX DC', 'HILUX RANGGA', 'HIACE PREMIO', 'HIACE COMMUTER', 'ALPHARD', 'VELLFIRE']
};
function getCurrentTanokoModels() {
    const s = document.getElementById('tanokoShift').value;
    return MODELS_SHIFT[s] || MODELS_SHIFT['Red'];
}
function renderTanokoHeaderModels() {
    const row = document.getElementById('tanokoModelHeaderRow');
    const models = getCurrentTanokoModels();
    row.innerHTML = models.map(m => `<th class="col-model small">${m}</th>`).join('');
}

document.getElementById('btnTanoko').addEventListener('click', (e) => {
    e.preventDefault();
    openTanokoModal();
});

document.getElementById('tanokoArea').addEventListener('change', () => {
    updateTanokoFilters();
    renderTanokoHeaderModels();
    renderTanokoTable();
});
document.getElementById('tanokoShift').addEventListener('change', () => {
    renderTanokoHeaderModels();
    renderTanokoTable();
});

async function openTanokoModal() {
    if (state.companySettings.logo) {
        document.getElementById('tanokoFormLogo').src = state.companySettings.logo;
        document.getElementById('tanokoFormLogo').style.display = 'block';
        document.getElementById('tanokoFormLogoPlaceholder').style.display = 'none';
    } else {
        document.getElementById('tanokoFormLogo').style.display = 'none';
        document.getElementById('tanokoFormLogoPlaceholder').style.display = 'block';
    }
    updateTanokoFilters();
    renderTanokoHeaderModels();
    renderTanokoTable();
    tanokoModal.show();
}

function updateTanokoFilters() {
    const area = document.getElementById('tanokoArea').value;
    const shiftSel = document.getElementById('tanokoShift');
    if (area === 'SMI Cibitung') {
        shiftSel.innerHTML = '<option value="Non-Shift">Non-Shift</option>';
        shiftSel.value = 'Non-Shift';
        shiftSel.disabled = true;
    } else if (area === 'SMI Karawang') {
        shiftSel.innerHTML = '<option value="Red">Red</option><option value="White">White</option>';
        if (shiftSel.value !== 'Red' && shiftSel.value !== 'White') shiftSel.value = 'Red';
        shiftSel.disabled = false;
    } else {
        shiftSel.innerHTML = '<option value="Red">Red</option><option value="White">White</option><option value="Non-Shift">Non-Shift</option>';
        if (!['Red','White','Non-Shift'].includes(shiftSel.value)) shiftSel.value = 'Red';
        shiftSel.disabled = false;
    }
}

function renderTanokoTable() {
    const tbody = document.getElementById('tanokoTableBody');
    tbody.innerHTML = '';

    const currentArea = document.getElementById('tanokoArea').value;
    const currentShift = document.getElementById('tanokoShift').value;
    
    let filteredEmployees = state.employees;
    if (currentArea !== 'Semua Area') {
        filteredEmployees = filteredEmployees.filter(e => (e.company || '').toLowerCase() === (currentArea || '').toLowerCase());
    }
    if (currentShift !== 'Non-Shift') {
        filteredEmployees = filteredEmployees.filter(e => e.shift === currentShift);
    }
    filteredEmployees.sort((a, b) => a.name.localeCompare(b.name));

    filteredEmployees.forEach((emp, index) => {
        let empSkill = state.tanokoSkills.find(s => s.empId === emp.id);
        if (!empSkill) empSkill = { empId: emp.id, skills: {} };

        const row = document.createElement('tr');
        
        let modelCells = '';
        let totalScore = 0;
        let countScore = 0;

        const models = getCurrentTanokoModels();
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
                <span class="fw-bold">${average}%</span>
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

function computeEmpStatus(emp) {
    const explicit = (emp.status || '').trim();
    if (explicit) return explicit;
    const s = ((emp.level || '') + ' ' + (emp.position || '') + ' ' + (emp.company || '')).toLowerCase();
    if (s.includes('permanent') || s.includes('pwtt')) return 'Permanent';
    if (s.includes('kontrak') || s.includes('pkwt') || s.includes('outsource') || s.includes('os')) return 'Kontrak';
    return '';
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
            <td>${computeEmpStatus(e) || '-'}</td>
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
    
    const shiftWhite = state.employees.filter(e => (e.shift || '').toLowerCase() === 'white').length;
    const shiftRed = state.employees.filter(e => (e.shift || '').toLowerCase() === 'red').length;
    const nonShift = state.employees.filter(e => {
        const s = (e.shift || '').toLowerCase();
        return s !== 'white' && s !== 'red';
    }).length;
    const permanent = state.employees.filter(e => computeEmpStatus(e) === 'Permanent').length;
    const kontrak = state.employees.filter(e => computeEmpStatus(e) === 'Kontrak').length;
    const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.innerText = val; };
    setVal('shiftWhiteDisplay', shiftWhite);
    setVal('shiftRedDisplay', shiftRed);
    setVal('nonShiftDisplay', nonShift);
    setVal('permanentDisplay', permanent);
    setVal('kontrakDisplay', kontrak);

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

// ==========================================
// 19. PERSONAL KARYAWAN LOGIC
// ==========================================
const btnDashboard = document.getElementById('btnDashboard');
const btnPersonalKaryawan = document.getElementById('btnPersonalKaryawan');
const personalKaryawanSection = document.getElementById('personalKaryawanSection');
const dashboardSectionEl = document.getElementById('dashboardSection'); // Renamed to avoid conflict with var name

let currentPersonalEmpId = null;
let pkSkillCharts = [];
let pkMultiSkillChart = null;

const btnPkMultiSkillEdit = document.getElementById('pkMultiSkillEditBtn');
if (btnPkMultiSkillEdit) {
    btnPkMultiSkillEdit.addEventListener('click', () => {
        if (!currentPersonalEmpId) return;
        openPkMultiSkillEditModal(currentPersonalEmpId);
    });
}

function openPkMultiSkillEditModal(empId) {
    const tbody = document.getElementById('pkMultiSkillEditBody');
    tbody.innerHTML = '';
    const rec = (state.msByPart || []).find(r => r.empId === empId) || { empId, data: {} };
    const tanokoData = state.tanokoSkills.find(t => t.empId === empId) || { skills: {} };
    modelsList.forEach((model, idx) => {
        const entry = rec.data[model] || {};
        const targetVal = typeof entry.target === 'number' ? entry.target : 20;
        const score = tanokoData.skills ? (tanokoData.skills[model] || 0) : 0;
        const actualDefault = Math.round((score / 100) * targetVal);
        const actualVal = typeof entry.actual === 'number' ? entry.actual : actualDefault;
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="text-center">${idx + 1}</td>
            <td>${model}</td>
            <td><input type="number" class="form-control form-control-sm" id="pkTarget_${idx}" min="0" max="50" value="${targetVal}"></td>
            <td><input type="number" class="form-control form-control-sm" id="pkActual_${idx}" min="0" max="50" value="${actualVal}"></td>
        `;
        tbody.appendChild(tr);
    });
    pkMultiSkillEditModal.show();
}

const pkMultiSkillSaveBtn = document.getElementById('pkMultiSkillSaveBtn');
if (pkMultiSkillSaveBtn) {
    pkMultiSkillSaveBtn.addEventListener('click', async () => {
        const empId = currentPersonalEmpId;
        if (!empId) return;
        const data = {};
        modelsList.forEach((model, idx) => {
            const tEl = document.getElementById(`pkTarget_${idx}`);
            const aEl = document.getElementById(`pkActual_${idx}`);
            let tVal = parseInt(tEl.value, 10);
            let aVal = parseInt(aEl.value, 10);
            if (isNaN(tVal) || tVal < 0) tVal = 0;
            if (isNaN(aVal) || aVal < 0) aVal = 0;
            data[model] = { target: tVal, actual: aVal };
        });
        const rec = { empId, data };
        const idx = (state.msByPart || []).findIndex(r => r.empId === empId);
        if (idx === -1) state.msByPart.push(rec);
        else state.msByPart[idx] = rec;
        try {
            await dbPut('ms_by_part', rec);
        } catch (e) {}
        pkMultiSkillEditModal.hide();
        renderMultiSkillByPartChart(empId);
    });
}
// Navigation
if (btnDashboard && btnPersonalKaryawan) {
    btnDashboard.addEventListener('click', (e) => {
        e.preventDefault();
        btnDashboard.classList.add('active');
        btnPersonalKaryawan.classList.remove('active');
        
        document.getElementById('dashboardSection').classList.remove('d-none');
        personalKaryawanSection.classList.add('d-none');
    });

    btnPersonalKaryawan.addEventListener('click', (e) => {
        e.preventDefault();
        btnPersonalKaryawan.classList.add('active');
        btnDashboard.classList.remove('active');

        document.getElementById('dashboardSection').classList.add('d-none');
        personalKaryawanSection.classList.remove('d-none');
        
        populatePkSearch();
    });
}

// Search Logic
const pkSearchInput = document.getElementById('pkSearchInput');
const btnSearchPersonal = document.getElementById('btnSearchPersonal');

function populatePkSearch() {
    const list = document.getElementById('pkEmployeeList');
    list.innerHTML = '';
    state.employees.forEach(emp => {
        const opt = document.createElement('option');
        opt.value = emp.nik; // Search by NIK primarily
        opt.label = emp.name;
        list.appendChild(opt);
    });
}

btnSearchPersonal.addEventListener('click', () => {
    const val = pkSearchInput.value;
    if (!val) return;
    
    // Find by NIK or Name
    const emp = state.employees.find(e => e.nik === val || e.name.toLowerCase() === val.toLowerCase());
    if (emp) {
        renderPersonalKaryawan(emp.id);
    } else {
        alert('Karyawan tidak ditemukan!');
    }
});

pkSearchInput.addEventListener('change', () => {
    const val = pkSearchInput.value;
    const emp = state.employees.find(e => e.nik === val || e.name === val); // Exact match from datalist
    if (emp) renderPersonalKaryawan(emp.id);
});

// Main Render Function
function renderPersonalKaryawan(empId) {
    currentPersonalEmpId = empId;
    const emp = state.employees.find(e => e.id === empId);
    if (!emp) return;

    // 1. Profile Card
    document.getElementById('pkName').innerText = emp.name;
    document.getElementById('pkCompany').innerText = emp.company;
    document.getElementById('pkNik').innerText = emp.nik;
    document.getElementById('pkJoinDate').innerText = emp.joinDate;
    document.getElementById('pkDept').innerText = emp.dept;
    document.getElementById('pkPhoto').src = emp.photo || 'https://via.placeholder.com/100';

    // 2. History Training
    const trainBody = document.getElementById('pkHistoryTrainingBody');
    trainBody.innerHTML = '';
    if (emp.trainings && emp.trainings.length > 0) {
        emp.trainings.forEach(t => {
            const row = document.createElement('tr');
            // Logic: If cert exists, complete (green). Else check date? Assume all entered are complete or pending.
            // Using 'cert' presence as check.
            const isComplete = !!t.cert; 
            const icon = isComplete 
                ? '<i class="fas fa-check-circle text-success fa-lg"></i>' 
                : '<i class="fas fa-times-circle text-danger fa-lg"></i>';
            
            row.innerHTML = `
                <td>${t.materi}</td>
                <td class="text-center">${icon}</td>
            `;
            trainBody.appendChild(row);
        });
    } else {
        trainBody.innerHTML = '<tr><td colspan="2" class="text-center text-muted">Belum ada data training</td></tr>';
    }

    // 3. History Multi Skill (Table)
    const msBody = document.getElementById('pkHistoryMultiSkillBody');
    msBody.innerHTML = '';
    const msData = state.multiSkills.find(m => m.empId === empId);
    if (msData && msData.parts && msData.parts.length > 0) {
        msData.parts.forEach((p, idx) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${idx + 1}</td>
                <td>${p.name}</td>
                <td>${p.dateTrain || '-'}</td>
                <td>${p.trainer || '-'}</td>
                <td><i class="fas fa-check-circle text-success"></i></td>
            `;
            msBody.appendChild(row);
        });
    } else {
        msBody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">Belum ada data multi skill</td></tr>';
    }

    // 4. Summary Tanoko
    const tanokoData = state.tanokoSkills.find(t => t.empId === empId);
    let avg = 0;
    if (tanokoData && tanokoData.skills) {
        const scores = Object.values(tanokoData.skills);
        if (scores.length > 0) {
            const total = scores.reduce((a, b) => a + b, 0);
            avg = Math.round(total / scores.length); // Use length of keys, or fixed 12? Use keys present.
            // Or better: divide by 12 (all models) if we want absolute coverage. 
            // The image says "Rata-rata Skill MP dari Semua Part instalasi dan model unit".
            // If they haven't done a model, it's 0.
            // Let's stick to the 12 models list.
        }
    }
    document.getElementById('pkTanokoPercent').innerText = avg + '%';
    document.getElementById('pkTanokoPhoto').src = emp.photo || 'https://via.placeholder.com/60';

    // 5. Skill By Model (Charts)
    renderSkillByModelCharts(empId);

    // 6. Multi Skill By Part (Bar Chart)
    renderMultiSkillByPartChart(empId);
}

const modelsList = ['FORTUNER', 'RAIZE', 'INNOVA REBORN', 'YARIS', 'INNOVA ZENIX', 'AGYA', 'HILUX DC', 'HIACE COMMUTER', 'ALPHARD', 'HILUX RANGGA', 'HIACE PREMIO', 'VELLFIRE'];

function normalizeDriveUrl(url) {
    if (!url) return '';
    if (url.includes('drive.google.com')) {
        const m = url.match(/\/file\/d\/([^/]+)/);
        if (m && m[1]) return `https://drive.google.com/uc?export=view&id=${m[1]}`;
        const q = url.match(/[?&]id=([^&]+)/);
        if (q && q[1]) return `https://drive.google.com/uc?export=view&id=${q[1]}`;
    }
    return url;
}

function renderSkillByModelCharts(empId) {
    const container = document.getElementById('pkSkillByModelContainer');
    container.innerHTML = '';
    
    // Destroy old charts
    pkSkillCharts.forEach(c => c.destroy());
    pkSkillCharts = [];

    const tanokoData = state.tanokoSkills.find(t => t.empId === empId) || { skills: {} };

    // Image Mapping for specific models
    const carImages = {
        'ALPHARD': 'https://drive.google.com/file/d/1ZHBrJCujG8EoaUVXHYT4Q8ET9NybFaH0/view?usp=sharing',
        'VELLFIRE': 'https://drive.google.com/file/d/1Bpp31tILgiDB1MRx9_w_68-O2sENbh7m/view?usp=sharing',
        'HIACE PREMIO': 'https://drive.google.com/file/d/105Ns6d6aN2zO_VVSvu6TjY9gz0fdDHGh/view?usp=sharing',
        'HIACE COMMUTER': 'https://drive.google.com/file/d/1DIo8UCGBkBkuroCsEPUhIHlNEpKRQeAp/view?usp=sharing',
        'HILUX DC': 'https://drive.google.com/file/d/1OXaVWx7ksmfkMg3VII7KtI6OrQoZymF5/view?usp=sharing',
        'YARIS': 'https://drive.google.com/file/d/1F2WhxP8D4WMLR8BUPcYP5Hie2zV4ZDJw/view?usp=sharing',
        'AGYA': 'https://drive.google.com/file/d/1i4TAoPfku4CbcwJ9T0wHWQCOf97uD3xb/view?usp=sharing',
        'INNOVA REBORN': 'https://drive.google.com/file/d/1qpbFBu1L-FX7FQx-p9Z64F6G12w320Hy/view?usp=sharing',
        'FORTUNER': 'https://drive.google.com/file/d/1U6L8M-riSrHERlp1BLWplWywObmU71dC/view?usp=sharing',
        'RAIZE': 'https://drive.google.com/file/d/1aZUfQLj9oksnbvJy1mLwsGTXs7PJ97NK/view?usp=sharing',
        'INNOVA ZENIX': 'https://drive.google.com/file/d/15pCSQPlsbgbQQFk3w_6vQg9IMemOUFE7/view?usp=sharing',
        'HILUX RANGGA': 'https://drive.google.com/file/d/1qwIUabScmN5jsZgNetky6lbiG9jbdn5L/view?usp=sharing'
    };

    modelsList.forEach((model, idx) => {
        const score = tanokoData.skills ? (tanokoData.skills[model] || 0) : 0;
        const rawUrl = carImages[model];
        const normalizedUrl = normalizeDriveUrl(rawUrl);
        const customImg = state.modelImages[model] || '';
        
        // Use a placeholder if no image mapping exists, or just keep it simple.
        // The layout requested is:
        // Left: Car Image
        // Right: Title (Top), Chart (Bottom) with % in center
        
        const imageSrc = customImg || normalizedUrl || 'https://via.placeholder.com/110x70?text=' + encodeURIComponent(model);
        const placeholderUrl = 'https://via.placeholder.com/110x70?text=' + encodeURIComponent(model);

        const col = document.createElement('div');
        col.className = 'col-md-4 col-sm-6 mb-3'; // Responsive grid
        col.innerHTML = `
            <div class="card h-100 shadow-sm border-0 rounded-3 position-relative">
                <input type="file" id="pkModelFile_${idx}" accept="image/*" style="display:none" onchange="handleModelFileChange('${model}', this)">
                <button type="button" class="btn btn-sm btn-light position-absolute top-0 end-0 m-1" style="right: 38px;" title="Edit Nilai" onclick="editPkModelScore('${model}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button type="button" class="btn btn-sm btn-light position-absolute top-0 end-0 m-1" title="Upload Gambar" onclick="document.getElementById('pkModelFile_${idx}').click()">
                    <i class="fas fa-upload"></i>
                </button>
                <div class="card-body p-2 d-flex align-items-center">
                    <!-- Left: Image -->
                    <div style="width: 45%; padding-right: 5px;">
                        <img src="${imageSrc}" class="img-fluid rounded" style="object-fit: contain; width: 100%; max-height: 80px;" alt="${model}" onerror="this.onerror=null;this.src='${placeholderUrl}'">
                    </div>
                    
                    <!-- Right: Title & Chart -->
                    <div style="width: 55%;" class="d-flex flex-column align-items-center justify-content-center">
                        <div class="fw-bold text-center text-dark mb-1" style="font-size: 0.75rem;">${model}</div>
                        <div style="height: 60px; width: 60px; position: relative;">
                            <canvas id="pkChart_${idx}"></canvas>
                            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 0.8rem; font-weight: bold; color: #333;">
                                ${score}%
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(col);

        const ctx = document.getElementById(`pkChart_${idx}`).getContext('2d');
        const chart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Actual', 'Remaining'],
                datasets: [{
                    data: [score, 100 - score],
                    backgroundColor: ['#ffc107', '#e9ecef'], // Yellow Actual, Gray remaining
                    borderWidth: 0,
                    cutout: '80%', // Thinner ring
                    borderRadius: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: false }
                },
                animation: {
                    animateScale: true,
                    animateRotate: true
                }
            }
        });
        pkSkillCharts.push(chart);
    });
}

window.editPkModelScore = async (model) => {
    const empId = currentPersonalEmpId;
    if (!empId) return;
    let val = prompt('Masukkan nilai (0-100):');
    if (val === null) return;
    val = parseInt(val, 10);
    if (isNaN(val)) { alert('Angka tidak valid'); return; }
    if (val < 0) val = 0;
    if (val > 100) val = 100;
    let idx = state.tanokoSkills.findIndex(t => t.empId === empId);
    if (idx === -1) {
        state.tanokoSkills.push({ empId: empId, skills: { [model]: val } });
    } else {
        if (!state.tanokoSkills[idx].skills) state.tanokoSkills[idx].skills = {};
        state.tanokoSkills[idx].skills[model] = val;
    }
    try {
        const dataToSave = state.tanokoSkills.find(t => t.empId === empId);
        await dbPut('tanoko_skills', dataToSave);
    } catch (e) {}
    renderSkillByModelCharts(empId);
    renderMultiSkillByPartChart(empId);
};
window.handleModelFileChange = async (model, inputEl) => {
    try {
        const file = inputEl.files && inputEl.files[0];
        if (!file) return;
        if (file.size > 800 * 1024) {
            alert('Ukuran gambar terlalu besar. Maksimal 800KB.');
            inputEl.value = '';
            return;
        }
        const base64 = await fileToBase64(file);
        state.modelImages[model] = base64;
        await dbPut('model_images', { model, data: base64 });
        renderSkillByModelCharts(currentPersonalEmpId);
    } catch (e) {
        console.error('Gagal upload gambar model:', e);
        alert('Gagal upload gambar model');
    } finally {
        inputEl.value = '';
    }
};

function renderMultiSkillByPartChart(empId) {
    const ctx = document.getElementById('pkMultiSkillChart').getContext('2d');
    
    if (pkMultiSkillChart) {
        pkMultiSkillChart.destroy();
    }

    const tanokoData = state.tanokoSkills.find(t => t.empId === empId) || { skills: {} };
    const msRec = (state.msByPart || []).find(r => r.empId === empId) || null;
    
    const targets = [];
    const actuals = [];

    modelsList.forEach(model => {
        const score = tanokoData.skills ? (tanokoData.skills[model] || 0) : 0;
        let target = 20;
        let actual = Math.round((score / 100) * target);
        if (msRec && msRec.data && msRec.data[model]) {
            const entry = msRec.data[model];
            if (typeof entry.target === 'number') target = entry.target;
            if (typeof entry.actual === 'number') actual = entry.actual;
            else actual = Math.round((score / 100) * target);
        }
        
        targets.push(target);
        actuals.push(actual);
    });

    pkMultiSkillChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: modelsList,
            datasets: [
                {
                    label: 'TARGET PART',
                    data: targets,
                    backgroundColor: '#ffc107', // Yellow
                    barPercentage: 0.6,
                    categoryPercentage: 0.8
                },
                {
                    label: 'ACTUAL PART',
                    data: actuals,
                    backgroundColor: '#001f3f', // Navy
                    barPercentage: 0.6,
                    categoryPercentage: 0.8
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        font: { size: 10 },
                        usePointStyle: true
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 25,
                    ticks: { font: { size: 10 } }
                },
                x: {
                    ticks: { 
                        font: { size: 8 },
                        autoSkip: false,
                        maxRotation: 45,
                        minRotation: 45
                    }
                }
            }
        }
    });
}
