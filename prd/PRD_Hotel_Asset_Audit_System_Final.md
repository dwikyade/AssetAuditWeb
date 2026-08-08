# PRD --- Hotel Asset Audit System

**Versi:** 1.0 Final\
**Status:** Final / Ready for Development\
**Platform:** Web Dashboard Responsive\
**Backend:** Laravel 12\
**Frontend:** React + Inertia.js\
**Database:** MySQL 8\
**Deployment Target:** Hostinger\
**Target Pengguna:** Tim IT, Asset Management, Finance/Accounting,
Department/Unit, Management/Administrator Hotel

------------------------------------------------------------------------

# 1. Ringkasan Produk

## 1.1 Nama Produk

**Hotel Asset Audit System**

Sistem berbasis web untuk mengelola data aset hotel, melakukan
audit/stock opname aset, memantau kondisi dan keberadaan aset, mencatat
riwayat audit, mengelola data lokasi dan departemen, serta menghasilkan
laporan audit.

Sistem dirancang sebagai **dashboard internal hotel** dengan antarmuka
simple, modern, profesional, responsif, dan cepat digunakan pada
desktop, tablet, maupun smartphone.

## 1.2 Tujuan Utama

Sistem bertujuan untuk:

1.  Memusatkan seluruh data aset hotel ke dalam satu database.
2.  Mengurangi ketergantungan pada file Excel sebagai sumber data utama.
3.  Mempertahankan kode aset existing hotel tanpa memaksakan format
    baru.
4.  Mendukung import data aset massal dari Excel.
5.  Mendukung custom asset code/prefix dan auto-generate kode untuk aset
    baru.
6.  Memudahkan proses audit fisik aset.
7.  Mencatat kondisi, lokasi, keberadaan, dan hasil audit setiap aset.
8.  Menyimpan histori audit dari waktu ke waktu.
9.  Menyediakan dashboard monitoring aset secara
    real-time/semi-real-time.
10. Menyediakan laporan dan export data.
11. Menyediakan audit trail aktivitas pengguna.
12. Menjaga performa sistem agar tetap responsif ketika jumlah aset dan
    histori bertambah besar.

------------------------------------------------------------------------

# 2. Masalah yang Ingin Diselesaikan

Proses pengelolaan aset yang hanya mengandalkan Excel memiliki beberapa
masalah:

-   Data tersebar dalam file.
-   Sulit mengetahui data terbaru.
-   Risiko duplikasi kode aset.
-   Sulit melacak perubahan data.
-   Audit fisik membutuhkan pencarian manual.
-   Riwayat audit sulit ditelusuri.
-   Sulit mengetahui aset yang hilang, rusak, berpindah lokasi, atau
    belum diaudit.
-   Laporan membutuhkan proses manual.
-   Tidak ada dashboard monitoring.
-   Tidak ada audit trail perubahan data.
-   Data aset dengan format kode berbeda dapat sulit dikelola jika
    sistem menggunakan satu format hardcoded.
-   Import data dalam jumlah besar dapat menyebabkan browser timeout
    jika tidak menggunakan proses yang benar.

Sistem ini harus mengubah proses tersebut menjadi sistem terstruktur
namun tetap mempertahankan kompatibilitas dengan data aset hotel yang
sudah ada.

------------------------------------------------------------------------

# 3. Prinsip Desain Sistem

Sistem harus mengikuti prinsip:

### 3.1 Simple

Pengguna hotel tidak membutuhkan UI yang rumit.

### 3.2 Modern

Menggunakan gaya dashboard SaaS modern dengan visual bersih dan
profesional.

### 3.3 Fast

Interaksi pengguna harus terasa cepat dan tidak melakukan
request/database query yang tidak diperlukan.

### 3.4 Responsive

Sistem harus usable pada:

-   Desktop
-   Laptop
-   Tablet
-   Smartphone

### 3.5 Data Integrity

Data aset, kode aset, audit, dan histori harus konsisten.

### 3.6 Existing Data First

Kode dan data aset existing hotel tidak boleh diubah secara otomatis
hanya agar mengikuti format sistem baru.

### 3.7 Auditability

Setiap perubahan penting harus dapat dilacak.

### 3.8 Scalable

Arsitektur harus memungkinkan jumlah aset dan histori bertambah tanpa
perlu membangun ulang sistem.

------------------------------------------------------------------------

# 4. Scope Sistem

## 4.1 In Scope

Sistem mencakup:

1.  Authentication
2.  User Management
3.  Role & Permission
4.  Dashboard
5.  Asset Management
6.  Asset Category
7.  Asset Code / Prefix Management
8.  Department Management
9.  Location Management
10. Asset Status Management
11. Asset Condition Management
12. Asset Detail
13. Asset History
14. Audit Session
15. Asset Audit
16. Audit History
17. QR Code
18. Bulk Import Excel
19. Import Validation
20. Import Preview
21. Import History
22. Export Excel
23. Export PDF
24. Reports
25. Dashboard Analytics
26. Activity Log / Audit Trail
27. Notification/Alert
28. Search, Filter, Sort, Pagination
29. Backup-oriented data export
30. System Settings

## 4.2 Out of Scope Versi Awal

Fitur berikut tidak wajib pada MVP:

-   Integrasi ERP/accounting otomatis.
-   Integrasi RFID.
-   Integrasi IoT.
-   Predictive maintenance AI.
-   Mobile native application.
-   Integrasi barcode hardware khusus.
-   Automatic depreciation accounting engine yang menggantikan sistem
    Finance.
-   Automatic purchase/order management.

Arsitektur harus tetap memungkinkan integrasi tersebut pada fase
berikutnya.

------------------------------------------------------------------------

# 5. Target User

## 5.1 Super Admin

Mengelola seluruh sistem.

Hak akses:

-   Semua modul.
-   User.
-   Role.
-   Permission.
-   System Settings.
-   Import.
-   Export.
-   Asset.
-   Audit.
-   Reports.
-   Activity Log.

## 5.2 Asset Admin / IT Admin

Mengelola master data aset dan proses audit.

Hak akses:

-   Dashboard
-   Asset
-   Import
-   QR
-   Audit
-   Reports
-   Location
-   Department
-   Category
-   Asset Code
-   Activity Log terbatas

## 5.3 Auditor

Melakukan proses audit.

Hak akses:

-   Dashboard
-   Melihat aset
-   Audit
-   Scan QR
-   Input hasil audit
-   Melihat histori audit sesuai kewenangan
-   Tidak dapat mengubah master asset tanpa permission.

## 5.4 Department/User

Hak akses terbatas:

-   Melihat aset yang terkait.
-   Melihat status audit jika diberikan akses.
-   Melakukan konfirmasi/validasi jika workflow membutuhkan.
-   Tidak dapat menghapus data.

## 5.5 Management

Read-only:

-   Dashboard
-   Statistik
-   Reports
-   Audit Summary
-   Asset Summary

------------------------------------------------------------------------

# 6. Authentication & Authorization

## 6.1 Login

Field:

-   Email/username
-   Password
-   Remember Me
-   Login button

Fitur:

-   Password hashing.
-   Session management.
-   Logout.
-   Login attempt protection.
-   Optional password reset.
-   Optional email verification.

## 6.2 Role-Based Access Control

Gunakan permission granular.

Contoh:

``` text
asset.view
asset.create
asset.update
asset.delete
asset.import
asset.export

audit.view
audit.create
audit.update
audit.delete
audit.approve

report.view
report.export

user.view
user.create
user.update
user.delete

system.manage
activity-log.view
```

Jangan hanya melakukan pengecekan berdasarkan nama role di frontend.

Authorization wajib diverifikasi di backend Laravel.

------------------------------------------------------------------------

# 7. Dashboard

Dashboard adalah halaman utama sistem.

## 7.1 Statistik Utama

Minimal menampilkan:

-   Total Asset
-   Asset Aktif
-   Asset Tidak Aktif
-   Total Nilai Perolehan
-   Total Nilai Buku
-   Sudah Diaudit
-   Belum Diaudit
-   Asset Bermasalah
-   Asset Hilang
-   Asset Rusak

## 7.2 Audit Progress

Menampilkan:

``` text
Total Asset
Sudah Audit
Belum Audit
Progress %
```

Contoh:

``` text
1.284 Total Asset

1.102 Sudah Audit

182 Belum Audit

85.8%
```

## 7.3 Chart

Minimal:

-   Audit progress.
-   Asset per department.
-   Asset per category.
-   Asset condition.
-   Asset status.
-   Audit trend per bulan.

## 7.4 Recent Activity

Contoh:

``` text
Asset CLD001 berhasil diaudit
2 minutes ago

Asset ELE002 mengalami perubahan lokasi
10 minutes ago

Import 2.350 asset selesai
30 minutes ago
```

## 7.5 Alert

Dashboard menampilkan:

-   Asset belum diaudit.
-   Asset hilang.
-   Asset rusak.
-   Duplicate code.
-   Import gagal.
-   Audit session belum selesai.

------------------------------------------------------------------------

# 8. Asset Management

## 8.1 Tujuan

Menjadi master data seluruh aset hotel.

## 8.2 Data Asset

Field minimum:

``` text
id
asset_code
asset_name
description
category_id
department_id
location_id
quantity
acquisition_date
depreciation_end_date
acquisition_value
previous_accumulated_depreciation
accumulated_depreciation
depreciation_per_period
book_value
status_id
condition_id
serial_number
brand
model
unit
notes
created_at
updated_at
deleted_at
```

Field akuntansi dapat dibuat nullable karena tidak semua aset/hasil
import memiliki seluruh informasi.

## 8.3 Asset Code

`asset_code` adalah kode resmi aset yang digunakan sistem.

Contoh existing:

``` text
CLD001
CLD002
CLD003

CSB001
CSB002
CSB003
```

Sistem **tidak boleh menganggap semua kode harus memiliki prefix yang
sama**.

Asset code harus:

-   Unique.
-   Bisa berasal dari data existing.
-   Bisa diinput manual.
-   Bisa dibuat otomatis.
-   Bisa mengikuti custom prefix.
-   Bisa mengikuti custom format.
-   Bisa diubah hanya oleh user dengan permission khusus.
-   Perubahan kode harus tercatat di Activity Log.

## 8.4 Internal ID

Setiap asset tetap memiliki numeric/UUID internal ID.

Contoh:

``` text
id = 12839
asset_code = CLD001
```

Relasi audit harus menggunakan `asset_id`, bukan string `asset_code`.

Tujuannya agar jika kode berubah:

``` text
CLD001 -> CUSH-001
```

riwayat audit tetap terhubung.

------------------------------------------------------------------------

# 9. Asset Code / Prefix Management

## 9.1 Tujuan

Memungkinkan hotel mempertahankan sistem penomoran aset existing dan
membuat kode baru dengan format yang dapat disesuaikan.

## 9.2 Mode

### Mode A --- Manual

Admin memasukkan kode secara langsung.

Contoh:

``` text
CLD001
```

### Mode B --- Auto Generate

Admin memilih prefix dan sistem membuat nomor berikutnya.

Contoh:

``` text
Prefix: CLD
Number Length: 3
Starting Number: 1
Format: {PREFIX}{NUMBER}
```

Output:

``` text
CLD001
CLD002
CLD003
```

## 9.3 Custom Format

Contoh:

``` text
{PREFIX}{NUMBER}

{PREFIX}-{NUMBER}

{PREFIX}/{NUMBER}

{LOCATION}-{PREFIX}-{NUMBER}
```

## 9.4 Prefix Table

Field:

``` text
id
prefix
name
description
format
number_length
next_number
is_active
created_by
created_at
updated_at
```

## 9.5 Aturan

-   Prefix tidak boleh duplicate jika case-insensitive.
-   Generated code harus unique.
-   Jika terjadi collision, sistem harus menolak generation dan mencari
    nomor aman berikutnya.
-   Nomor sequence harus atomic/transaction-safe.
-   Kode existing dari import tidak boleh diubah.
-   Prefix tidak boleh dihapus jika masih digunakan; gunakan deactivate.
-   Perubahan konfigurasi prefix dicatat di activity log.

------------------------------------------------------------------------

# 10. Category Management

Field:

``` text
id
code
name
description
is_active
created_at
updated_at
```

Contoh:

``` text
Furniture
Electronics
IT Equipment
Housekeeping
F&B Equipment
Office Equipment
```

Kategori dapat dibuat/custom oleh admin.

------------------------------------------------------------------------

# 11. Department Management

Field:

``` text
id
code
name
description
manager/user optional
is_active
created_at
updated_at
```

Contoh:

``` text
IT
Front Office
Housekeeping
F&B
Engineering
Finance
HR
Sales
```

------------------------------------------------------------------------

# 12. Location Management

Lokasi harus dapat dibuat bertingkat.

Contoh:

``` text
Hotel
├── Lobby
├── Front Office
├── Restaurant
├── Kitchen
├── Floor 1
│   ├── Room 101
│   ├── Room 102
│   └── Room 103
├── Floor 2
└── Back Office
```

Field:

``` text
id
parent_id
code
name
description
is_active
```

`parent_id` nullable.

------------------------------------------------------------------------

# 13. Asset Status

Status default:

``` text
Active
Inactive
Disposed
Lost
Under Repair
Transferred
```

Status dapat dikonfigurasi sesuai kebutuhan hotel.

------------------------------------------------------------------------

# 14. Asset Condition

Kondisi default:

``` text
Good
Minor Damage
Major Damage
Broken
Missing
Under Repair
```

Condition dapat dikustomisasi.

------------------------------------------------------------------------

# 15. Asset Detail

Halaman detail aset harus menampilkan:

## 15.1 Informasi Identitas

-   Asset Code
-   Asset Name
-   Category
-   Serial Number
-   Brand
-   Model

## 15.2 Lokasi

-   Department
-   Location
-   Last Known Location

## 15.3 Informasi Kuantitas

-   Quantity
-   Unit

## 15.4 Informasi Akuntansi

-   Acquisition Date
-   Depreciation End Date
-   Acquisition Value
-   Previous Accumulated Depreciation
-   Accumulated Depreciation
-   Depreciation per Period
-   Book Value

## 15.5 Kondisi

-   Status
-   Condition

## 15.6 Audit Summary

-   Last Audit
-   Last Auditor
-   Last Audit Result
-   Audit Count
-   Audit Status

## 15.7 QR Code

Menampilkan QR asset.

## 15.8 History

Menampilkan timeline perubahan:

``` text
Created
Imported
Location Changed
Condition Changed
Audited
Code Changed
Status Changed
```

------------------------------------------------------------------------

# 16. Asset Photo

Sistem dapat mendukung foto aset.

Field:

``` text
asset_id
file_path
file_name
mime_type
file_size
uploaded_by
created_at
```

Aturan:

-   Validasi MIME type.
-   Maksimum ukuran file configurable.
-   Gunakan storage Laravel.
-   Jangan menyimpan binary image langsung dalam MySQL.
-   Thumbnail dapat digunakan untuk mempercepat tampilan.

------------------------------------------------------------------------

# 17. QR Code

Setiap aset dapat memiliki QR Code unik.

QR tidak harus menyimpan seluruh data aset.

QR sebaiknya berisi identifier/token:

``` text
asset/{secure-token}
```

Saat discan:

``` text
Scan QR
↓
Login jika diperlukan
↓
Asset Detail
↓
Audit Asset
```

## 17.1 QR Features

-   Generate QR.
-   Regenerate QR.
-   Download QR.
-   Print QR.
-   Bulk generate QR.
-   Print label.
-   Scan QR via browser smartphone.

## 17.2 Security

Jangan menjadikan sequential database ID sebagai satu-satunya informasi
publik dalam QR jika endpoint dapat diakses tanpa autentikasi.

Gunakan secure random token/public identifier.

------------------------------------------------------------------------

# 18. Audit Management

## 18.1 Konsep

Audit harus menggunakan konsep **Audit Session**.

Contoh:

``` text
Audit Session:
Stock Opname Hotel 2026

Tanggal:
01 August 2026 - 15 August 2026

Auditor:
IT Team

Scope:
All Hotel Assets
```

## 18.2 Audit Session Field

``` text
id
code
name
description
start_date
end_date
status
scope_type
created_by
started_at
completed_at
created_at
updated_at
```

Status:

``` text
Draft
Scheduled
In Progress
Completed
Cancelled
```

## 18.3 Scope

Audit dapat mencakup:

-   Semua asset.
-   Department tertentu.
-   Location tertentu.
-   Category tertentu.
-   Asset selection tertentu.

------------------------------------------------------------------------

# 19. Asset Audit Record

Setiap audit terhadap aset membuat record terpisah.

Field minimum:

``` text
id
audit_session_id
asset_id
auditor_id
audit_time
found_status
condition_id
location_id
quantity_found
notes
photo_path
latitude
longitude
verification_method
result
created_at
updated_at
```

## 19.1 Found Status

``` text
Found
Not Found
Partially Found
```

## 19.2 Verification Method

``` text
Manual
QR Scan
Barcode
```

## 19.3 Result

``` text
Match
Mismatch
Issue
```

------------------------------------------------------------------------

# 20. Audit Workflow

## 20.1 Workflow Utama

``` text
Create Audit Session
        ↓
Select Scope
        ↓
Start Audit
        ↓
Select/Scan Asset
        ↓
Verify Asset
        ↓
Check Location
        ↓
Check Quantity
        ↓
Check Condition
        ↓
Add Note/Photo
        ↓
Save Audit
        ↓
Next Asset
        ↓
Complete Audit
        ↓
Generate Report
```

## 20.2 Audit melalui QR

``` text
Open Scanner
↓
Scan QR
↓
Asset Found
↓
Display Asset
↓
Verify
↓
Condition
↓
Location
↓
Quantity
↓
Photo/Notes
↓
Submit
```

## 20.3 Jika QR Tidak Ditemukan

Tampilkan:

``` text
Asset tidak ditemukan.

[Search Asset]
[Cancel]
```

Jangan otomatis membuat asset baru kecuali user memiliki permission.

------------------------------------------------------------------------

# 21. Audit Mismatch

Sistem harus dapat mendeteksi:

### Location mismatch

Database:

``` text
Room 501
```

Audit:

``` text
Room 503
```

### Quantity mismatch

Database:

``` text
Qty 10
```

Audit:

``` text
Qty 8
```

### Condition mismatch

Database:

``` text
Good
```

Audit:

``` text
Damaged
```

### Asset missing

Database memiliki asset tetapi tidak ditemukan saat audit.

Dashboard harus dapat menampilkan mismatch.

------------------------------------------------------------------------

# 22. Audit History

Audit history tidak boleh overwrite data audit sebelumnya.

Contoh:

``` text
2026
CLD001 → Good

2027
CLD001 → Minor Damage

2028
CLD001 → Under Repair
```

Semua histori tetap tersedia.

------------------------------------------------------------------------

# 23. Asset Movement History

Jika asset berpindah lokasi:

``` text
Room 101
↓
Room 205
↓
Storage
```

sistem menyimpan history.

Field:

``` text
asset_id
from_location_id
to_location_id
from_department_id
to_department_id
reason
changed_by
changed_at
```

------------------------------------------------------------------------

# 24. Bulk Import Excel

## 24.1 Tujuan

Memungkinkan admin mengimpor data aset existing hotel secara massal.

Format yang didukung:

``` text
.xlsx
.xls
```

## 24.2 Struktur Data Berdasarkan Excel Existing

Kolom utama yang terlihat dari file contoh:

    No Nama Kolom
  ---- -----------------
     1 No
     2 Kode
     3 Barang
     4 Lokasi
     5 Qty
     6 Tgl. Oleh
     7 Tgl Susut Akhir
     8 Nilai Perolehan
     9 Prev. Akum
    10 Akum. Total
    11 Nilai Per-Akum
    12 Nilai Buku

Sistem harus menyediakan mapping yang dapat dikonfigurasi sehingga nama
kolom Excel tidak harus selalu identik.

Mapping default:

``` text
Kode                -> asset_code
Barang              -> asset_name
Lokasi              -> location
Qty                 -> quantity
Tgl. Oleh           -> acquisition_date
Tgl Susut Akhir     -> depreciation_end_date
Nilai Perolehan     -> acquisition_value
Prev. Akum          -> previous_accumulated_depreciation
Akum. Total         -> accumulated_depreciation
Nilai Per-Akum      -> depreciation_per_period
Nilai Buku          -> book_value
```

Kolom `No` tidak dijadikan primary key.

## 24.3 Existing Code

Jika Excel memiliki:

``` text
CLD001
CLD002
CLD003
CSB001
CSB002
```

kode harus dipertahankan.

Sistem tidak boleh mengubahnya menjadi:

``` text
AST001
AST002
```

## 24.4 Import Flow

``` text
Upload File
↓
Check File
↓
Read Header
↓
Map Column
↓
Preview
↓
Validate
↓
Show Valid / Warning / Error
↓
Admin Confirmation
↓
Create Import Job
↓
Queue
↓
Chunk Processing
↓
Insert/Update
↓
Import Summary
```

------------------------------------------------------------------------

# 25. Import Validation

## 25.1 File Validation

-   File harus `.xlsx` atau `.xls`.
-   File tidak corrupt.
-   Ukuran file memiliki configurable limit.
-   Header wajib tersedia.

## 25.2 Required Data

Minimal:

``` text
Kode
Barang
```

Field lain dapat dikonfigurasi required/optional.

## 25.3 Data Validation

### Kode

-   Tidak boleh kosong.
-   Harus unique dalam file.
-   Harus unique terhadap database jika mode Create Only.
-   Trim whitespace.
-   Case sensitivity harus ditentukan secara konsisten.
-   Karakter yang tidak diperbolehkan harus divalidasi.

### Quantity

Harus numeric dan \>= 0.

Contoh valid:

``` text
1
1.00
10
```

### Currency

Harus dapat membaca:

``` text
400000
400,000.00
400.000,00
```

berdasarkan locale/configuration.

Nilai internal disimpan sebagai DECIMAL, bukan floating point.

### Date

Harus mampu menangani tanggal Excel dan format tanggal umum.

Contoh:

``` text
01/01/2021
31/01/2025
```

Sistem harus normalisasi ke format database.

------------------------------------------------------------------------

# 26. Import Duplicate Handling

Admin memilih mode:

### Create Only

Jika asset code sudah ada:

``` text
ERROR / SKIP
```

### Update Existing

Jika asset code sudah ada:

``` text
UPDATE
```

### Upsert

Jika belum ada:

``` text
CREATE
```

Jika sudah ada:

``` text
UPDATE
```

Mode harus ditampilkan jelas sebelum import.

Default:

**Create Only** untuk mencegah perubahan massal tidak sengaja.

------------------------------------------------------------------------

# 27. Import Preview

Sebelum import, tampilkan:

``` text
Total Rows: 2,350
Valid: 2,320
Warning: 20
Error: 10
```

Tabel:

``` text
No
Kode
Barang
Lokasi
Qty
Status
Message
```

Contoh:

``` text
CLD001  ✓ Valid
CLD002  ✓ Valid
CLD003  ⚠ Duplicate
CLD004  ❌ Invalid Date
```

Admin dapat:

-   Import semua data valid.
-   Batalkan.
-   Download error report.
-   Kembali ke mapping.

------------------------------------------------------------------------

# 28. Import Processing

Import besar tidak boleh diproses dalam satu request HTTP.

Gunakan:

-   Laravel Queue.
-   Chunk reading.
-   Batch insert/upsert.
-   Database transaction per chunk.

Contoh konsep:

``` text
2,350 rows

Chunk 1 -> 500
Chunk 2 -> 500
Chunk 3 -> 500
Chunk 4 -> 500
Chunk 5 -> 350
```

Tujuannya:

-   Mencegah timeout.
-   Mencegah memory spike.
-   Menjaga browser tetap responsif.
-   Memudahkan progress tracking.

------------------------------------------------------------------------

# 29. Import Progress

Tampilkan:

``` text
Importing...

1,500 / 2,350

64%

[████████████░░░░]
```

Status:

``` text
Queued
Processing
Completed
Completed With Errors
Failed
Cancelled
```

------------------------------------------------------------------------

# 30. Import History

Setiap import memiliki record:

``` text
id
file_name
file_size
total_rows
valid_rows
warning_rows
error_rows
created_rows
updated_rows
skipped_rows
failed_rows
mode
status
uploaded_by
started_at
completed_at
error_file_path
created_at
```

Admin dapat melihat:

-   File.
-   Waktu.
-   User.
-   Jumlah data.
-   Status.
-   Error.
-   Download error report.

------------------------------------------------------------------------

# 31. Import Error Report

Jika terdapat error, sistem menyediakan file Excel/CSV:

``` text
Row
Kode
Field
Value
Error
```

Contoh:

``` text
125
CLD125
Qty
abc
Quantity harus numeric
```

------------------------------------------------------------------------

# 32. Excel Template

Sistem menyediakan tombol:

**Download Template Excel**

Template berisi:

``` text
No
Kode
Barang
Lokasi
Qty
Tgl. Oleh
Tgl Susut Akhir
Nilai Perolehan
Prev. Akum
Akum. Total
Nilai Per-Akum
Nilai Buku
```

Tambahkan sheet:

``` text
Instructions
```

berisi petunjuk pengisian.

------------------------------------------------------------------------

# 33. Asset Import Mapping

Selain template default, admin dapat melakukan mapping:

``` text
Excel Column
      ↓
System Field
```

Contoh:

``` text
Kode Aset -> asset_code
Nama Barang -> asset_name
Jumlah -> quantity
Lokasi Asset -> location
```

Mapping dapat disimpan sebagai preset:

``` text
Hotel Asset Existing
```

------------------------------------------------------------------------

# 34. Data Normalization

Saat import:

-   Trim whitespace.
-   Normalisasi tanggal.
-   Normalisasi numeric.
-   Normalisasi currency.
-   Mapping lokasi.
-   Mapping department.
-   Mapping category.
-   Mapping status.
-   Mapping condition.

Jika lokasi belum ada, sistem harus menawarkan:

``` text
Create Missing Master Data
```

atau:

``` text
Reject Row
```

Default: **Reject/Warning**, bukan otomatis membuat master data tanpa
konfirmasi.

------------------------------------------------------------------------

# 35. Export

Export tersedia untuk:

-   Asset List
-   Audit Result
-   Audit History
-   Asset Movement
-   Issue List
-   Missing Asset
-   Department Summary
-   Category Summary
-   Financial Summary

Format:

``` text
.xlsx
.csv
.pdf
```

Export besar menggunakan queue.

------------------------------------------------------------------------

# 36. Reports

## 36.1 Asset Register

Menampilkan:

-   Code
-   Name
-   Location
-   Department
-   Qty
-   Acquisition Value
-   Book Value
-   Status
-   Condition

## 36.2 Audit Report

Menampilkan:

-   Audit session
-   Asset
-   Auditor
-   Date
-   Result
-   Condition
-   Location
-   Notes

## 36.3 Missing Asset Report

Asset yang seharusnya ada tetapi tidak ditemukan.

## 36.4 Mismatch Report

Asset dengan:

-   Location mismatch.
-   Quantity mismatch.
-   Condition mismatch.

## 36.5 Asset Condition Report

Summary kondisi:

``` text
Good
Minor Damage
Major Damage
Broken
Missing
```

## 36.6 Department Report

Summary aset per department.

## 36.7 Location Report

Summary aset per lokasi.

## 36.8 Financial Summary

Menampilkan:

-   Total acquisition value.
-   Total accumulated depreciation.
-   Total book value.

Catatan: sistem tidak boleh mengklaim sebagai sistem accounting utama
kecuali logic accounting memang disetujui Finance.

------------------------------------------------------------------------

# 37. Search

Search global dapat mencari:

-   Asset code.
-   Asset name.
-   Serial number.
-   Brand.
-   Model.
-   Location.
-   Department.

Search harus menggunakan debounce pada frontend.

------------------------------------------------------------------------

# 38. Filter

Asset filter:

``` text
Category
Department
Location
Status
Condition
Audit Status
Acquisition Date
Last Audit Date
Value Range
```

Filter dapat dikombinasikan.

------------------------------------------------------------------------

# 39. Sort

Kolom yang dapat di-sort:

-   Code
-   Name
-   Location
-   Department
-   Quantity
-   Acquisition Date
-   Acquisition Value
-   Book Value
-   Last Audit
-   Status

Sorting dilakukan di database untuk dataset besar.

------------------------------------------------------------------------

# 40. Pagination

Default:

``` text
25 rows
```

Pilihan:

``` text
25
50
100
```

Jangan memuat seluruh data aset ke browser.

------------------------------------------------------------------------

# 41. Activity Log / Audit Trail

Sistem wajib mencatat aktivitas penting.

Contoh:

``` text
User login
User logout
Create asset
Update asset
Delete asset
Import asset
Export report
Create audit
Submit audit
Change asset code
Change location
Change condition
Change status
Create user
Change permission
```

Field:

``` text
id
user_id
action
module
entity_type
entity_id
old_values
new_values
ip_address
user_agent
created_at
```

Untuk `old_values/new_values`, gunakan JSON.

Sensitive information tidak boleh dicatat sembarangan.

------------------------------------------------------------------------

# 42. Soft Delete

Master asset menggunakan soft delete jika memungkinkan.

Tujuannya:

-   Mencegah kehilangan histori.
-   Menjaga referential integrity.
-   Asset yang sudah disposed dapat tetap memiliki histori.

Penghapusan permanen hanya untuk Super Admin dan harus sangat dibatasi.

------------------------------------------------------------------------

# 43. Notification

Notification minimal:

-   Import selesai.
-   Import gagal.
-   Audit session selesai.
-   Asset issue.
-   Missing asset.
-   System warning.

Untuk MVP dapat menggunakan in-app notification.

Email/WhatsApp dapat ditambahkan pada fase berikutnya.

------------------------------------------------------------------------

# 44. UI/UX

## 44.1 Design Direction

Style:

**Modern Hotel Enterprise Dashboard**

Karakter:

-   Clean.
-   Minimal.
-   Professional.
-   Premium.
-   Banyak whitespace.
-   Tidak terlalu banyak gradient.
-   Tidak terlalu banyak animasi.

## 44.2 Layout

``` text
Sidebar
    +
Top Navigation
    +
Main Content
```

Sidebar:

``` text
Dashboard

Assets
  All Assets
  Categories
  Locations
  Departments
  Asset Codes

Audit
  Audit Sessions
  Audit History

Reports

Import / Export

Users

Activity Log

Settings
```

Menu ditampilkan berdasarkan permission.

------------------------------------------------------------------------

# 45. Dashboard Animation

Animasi harus subtle.

Contoh:

-   Fade-in.
-   Slide-up.
-   Count-up statistic.
-   Chart animation.
-   Hover interaction.
-   Skeleton loading.
-   Page transition ringan.

Hindari:

-   Animasi berlebihan.
-   Parallax berat.
-   Video background.
-   Animasi yang menghambat interaction.

------------------------------------------------------------------------

# 46. Frontend Stack

Gunakan:

``` text
React
Inertia.js
Tailwind CSS
shadcn/ui
Framer Motion
Lucide React
Recharts
TanStack Table
```

## 46.1 Alasan Inertia

Laravel tetap menjadi backend utama tanpa harus membuat REST API
terpisah untuk seluruh halaman dashboard.

Arsitektur:

``` text
React
  ↓
Inertia.js
  ↓
Laravel
  ↓
MySQL
```

------------------------------------------------------------------------

# 47. Backend Stack

``` text
Laravel 12
PHP 8.3/8.4 compatible
MySQL 8
Laravel Queue
Laravel Cache
Laravel Storage
Spatie Permission
Laravel Excel
```

PHP version harus mengikuti versi yang stabil dan didukung oleh versi
Laravel yang digunakan saat implementasi.

------------------------------------------------------------------------

# 48. Database Design

Database menggunakan MySQL 8.

## 48.1 Core Tables

Minimal:

``` text
users
roles
permissions
model_has_roles
role_has_permissions

assets
asset_categories
asset_statuses
asset_conditions

departments
locations

asset_code_prefixes

audit_sessions
asset_audits

asset_movements
asset_photos

import_jobs
import_errors

activity_logs

notifications
system_settings
```

------------------------------------------------------------------------

# 49. Relationship

``` text
Department
    └── Assets

Location
    └── Assets

Category
    └── Assets

Asset
    ├── Asset Photos
    ├── Asset Movements
    ├── Asset Audits
    └── Activity Logs

Audit Session
    └── Asset Audits

User
    ├── Assets Created
    ├── Audits
    ├── Imports
    └── Activity Logs
```

------------------------------------------------------------------------

# 50. Database Indexing

Index wajib untuk field yang sering digunakan:

``` text
assets.asset_code
assets.category_id
assets.department_id
assets.location_id
assets.status_id
assets.condition_id
assets.created_at

asset_audits.asset_id
asset_audits.audit_session_id
asset_audits.auditor_id
asset_audits.audit_time

asset_movements.asset_id
activity_logs.user_id
activity_logs.created_at

import_jobs.created_at
```

Unique:

``` text
assets.asset_code
```

Jika requirement bisnis tidak memungkinkan global uniqueness, gunakan
unique strategy yang disepakati sejak awal. Default sistem: global
unique.

------------------------------------------------------------------------

# 51. Data Types

Contoh:

``` text
id              BIGINT UNSIGNED
quantity        DECIMAL(15,2)
money           DECIMAL(18,2)
dates           DATE
timestamps      TIMESTAMP/DATETIME
boolean         BOOLEAN
JSON            JSON
```

Jangan menggunakan FLOAT untuk nilai uang.

------------------------------------------------------------------------

# 52. Transactions

Gunakan transaction untuk:

-   Create asset + related records.
-   Update asset code.
-   Move asset.
-   Submit audit.
-   Import chunk.
-   Generate asset code.

Jika salah satu proses gagal, data harus rollback sesuai batas
transaction.

------------------------------------------------------------------------

# 53. Performance Requirements

Target:

-   Initial dashboard render: target \< 2--3 detik pada koneksi normal.
-   CRUD sederhana: target response \< 1 detik pada kondisi server
    normal.
-   Search/filter: target \< 1 detik untuk dataset terindeks.
-   UI interaction tidak boleh freeze.
-   Import besar tidak boleh menggunakan single long-running HTTP
    request.
-   Export besar menggunakan queue.
-   Dataset list selalu menggunakan pagination.

Angka adalah target engineering, bukan SLA absolut.

------------------------------------------------------------------------

# 54. Performance Optimization

Wajib menerapkan:

1.  Database indexing.
2.  Pagination.
3.  Eager loading.
4.  Select only required columns.
5.  Query optimization.
6.  Cache dashboard metrics.
7.  Queue untuk proses berat.
8.  Chunk import.
9.  Batch insert.
10. Image thumbnail.
11. Lazy loading komponen.
12. Frontend code splitting jika diperlukan.
13. Debounced search.
14. Avoid N+1 queries.
15. OPcache di production.

------------------------------------------------------------------------

# 55. Caching

Data yang dapat di-cache:

-   Dashboard counters.
-   Category list.
-   Department list.
-   Location tree.
-   Status.
-   Condition.
-   Prefix configuration.

Cache harus di-invalidasi saat master data berubah.

------------------------------------------------------------------------

# 56. Queue

Queue digunakan untuk:

-   Import Excel.
-   Export Excel.
-   Export PDF.
-   Bulk QR generation.
-   Bulk QR label generation.
-   Heavy report generation.

Status job harus dapat dilihat user yang menjalankannya.

------------------------------------------------------------------------

# 57. Security

## 57.1 Authentication

-   Password hashing.
-   Session protection.
-   CSRF.
-   Rate limiting.
-   Secure cookie.

## 57.2 Authorization

Backend wajib melakukan authorization.

Frontend hanya menyembunyikan menu; frontend bukan security boundary.

## 57.3 Input Validation

Semua input divalidasi menggunakan Laravel Form Request/validation.

## 57.4 SQL Injection

Gunakan Eloquent/Query Builder dengan parameter binding.

## 57.5 XSS

Escape user-generated content.

## 57.6 File Upload

Validasi:

-   Extension.
-   MIME.
-   Size.
-   File integrity.

Jangan mempercayai extension saja.

## 57.7 Audit Log

Perubahan data penting wajib tercatat.

------------------------------------------------------------------------

# 58. Backup

Backup harus tersedia melalui hosting/infrastruktur.

Minimal:

-   Database backup.
-   Asset photo backup.
-   Import file penting jika diperlukan.

Backup schedule mengikuti kemampuan hosting.

Sistem menyediakan export data sebagai tambahan, bukan pengganti backup
server.

------------------------------------------------------------------------

# 59. Responsive Requirements

Desktop:

``` text
Sidebar expanded
Multi-column dashboard
Full table
```

Tablet:

``` text
Sidebar collapsible
Responsive cards
Scrollable table
```

Mobile:

``` text
Sidebar drawer
Stacked cards
Responsive form
Mobile-friendly QR scanner
Horizontal table scrolling atau mobile card mode
```

------------------------------------------------------------------------

# 60. Accessibility

Minimal:

-   Keyboard navigable.
-   Form labels jelas.
-   Contrast memadai.
-   Focus state terlihat.
-   Error message jelas.
-   Button memiliki label.
-   Icon-only button memiliki tooltip/aria-label.

------------------------------------------------------------------------

# 61. Error Handling

Error harus menggunakan pesan yang manusiawi.

Contoh:

``` text
Gagal menyimpan aset.

Silakan periksa data yang dimasukkan.
```

Bukan:

``` text
SQLSTATE[23000]...
```

Detail teknis disimpan dalam log server.

------------------------------------------------------------------------

# 62. Empty State

Jika belum ada data:

``` text
Belum ada asset.

[Tambah Asset]
[Import Excel]
```

Untuk audit:

``` text
Belum ada Audit Session.

[Create Audit Session]
```

------------------------------------------------------------------------

# 63. Loading State

Gunakan:

-   Skeleton.
-   Spinner hanya jika diperlukan.
-   Disabled state saat submit.
-   Progress indicator untuk job.

Jangan membuat user tidak tahu apakah action sedang berjalan.

------------------------------------------------------------------------

# 64. Confirmation

Action berisiko harus menggunakan confirmation:

-   Delete.
-   Bulk delete.
-   Change status.
-   Complete audit.
-   Import.
-   Update existing.
-   Change asset code.

Contoh:

``` text
Import 2,350 records?

Mode:
Create Only

[Cancel]
[Start Import]
```

------------------------------------------------------------------------

# 65. Audit Completion Rules

Audit Session tidak boleh dianggap selesai hanya karena user membuka
halaman.

Completion harus berdasarkan business rule yang dipilih.

Contoh:

### Mode Strict

Semua asset dalam scope harus memiliki audit record.

### Mode Flexible

Audit dapat diselesaikan walaupun masih ada asset belum diaudit, tetapi
sistem memberikan warning.

Admin dapat menentukan mode saat membuat Audit Session.

------------------------------------------------------------------------

# 66. Asset State vs Audit State

Jangan mencampur:

**Asset Status**

``` text
Active
Lost
Disposed
```

dengan:

**Audit Result**

``` text
Match
Mismatch
Issue
```

dan:

**Audit Session Status**

``` text
Draft
In Progress
Completed
```

Ketiganya harus dipisahkan.

------------------------------------------------------------------------

# 67. Financial Data Rules

Data:

``` text
Nilai Perolehan
Prev. Akum
Akum. Total
Nilai Per-Akum
Nilai Buku
```

disimpan sebagai data historis/financial reference dari sumber existing.

Sistem tidak boleh otomatis mengubah nilai accounting hanya karena audit
fisik.

Audit fisik hanya mencatat kondisi dan keberadaan aset kecuali terdapat
workflow khusus untuk perubahan data Finance.

------------------------------------------------------------------------

# 68. Business Rules

1.  Asset code harus unique.
2.  Asset code existing tidak boleh diubah saat import.
3.  Asset ID internal tidak berubah.
4.  Asset tidak boleh benar-benar dihapus jika sudah memiliki histori
    penting.
5.  Audit record tidak boleh overwrite record audit sebelumnya.
6.  Setiap audit membuat histori baru.
7.  Asset movement membuat movement history.
8.  Perubahan kode dicatat.
9.  Perubahan lokasi dicatat.
10. Perubahan condition/status penting dicatat.
11. Import besar harus menggunakan queue/chunk.
12. Create Only adalah default import mode.
13. Semua permission diverifikasi di backend.
14. User tanpa permission tidak dapat melakukan import/export/delete.
15. QR harus mengarah ke asset yang benar.
16. Asset missing harus tetap tersedia dalam histori.
17. Audit session dapat memiliki scope.
18. Data financial tidak boleh diubah oleh auditor kecuali diberi
    permission.
19. Master data yang sedang digunakan tidak boleh dihapus sembarangan.
20. Prefix yang sudah digunakan tidak boleh dihapus permanen.

------------------------------------------------------------------------

# 69. Main Navigation

``` text
Dashboard

Asset Management
├── All Assets
├── Add Asset
├── Categories
├── Departments
├── Locations
├── Asset Codes
└── QR Management

Audit
├── Audit Sessions
├── Start Audit
└── Audit History

Reports
├── Asset Register
├── Audit Report
├── Missing Assets
├── Mismatch
├── Condition
├── Department
├── Location
└── Financial Summary

Import / Export
├── Import Excel
├── Import History
└── Export

Administration
├── Users
├── Roles & Permissions
├── Activity Log
└── Settings
```

------------------------------------------------------------------------

# 70. Dashboard User Flow

``` text
Login
↓
Dashboard
↓
View Statistics
↓
Choose Module
↓
Perform Action
↓
Return Dashboard
```

------------------------------------------------------------------------

# 71. Add Asset Flow

``` text
Add Asset
↓
Choose Code Mode
├── Manual
└── Auto Generate
↓
Fill Asset Data
↓
Validate
↓
Save
↓
Generate QR
↓
Asset Detail
```

------------------------------------------------------------------------

# 72. Import Flow

``` text
Import Excel
↓
Upload
↓
Mapping
↓
Preview
↓
Validation
↓
Review Errors
↓
Select Import Mode
↓
Confirm
↓
Queue
↓
Progress
↓
Completed
↓
Summary
```

------------------------------------------------------------------------

# 73. Audit Flow

``` text
Create Session
↓
Define Scope
↓
Start
↓
Search/Scan
↓
Verify
↓
Condition
↓
Location
↓
Quantity
↓
Photo/Note
↓
Submit
↓
Next
↓
Complete
↓
Report
```

------------------------------------------------------------------------

# 74. Report Flow

``` text
Reports
↓
Choose Report
↓
Choose Filter
↓
Preview
↓
Export
├── Excel
├── CSV
└── PDF
```

------------------------------------------------------------------------

# 75. Suggested Database Schema Detail

## assets

``` text
id
asset_code
asset_name
description
category_id
department_id
location_id
quantity
unit
acquisition_date
depreciation_end_date
acquisition_value
previous_accumulated_depreciation
accumulated_depreciation
depreciation_per_period
book_value
serial_number
brand
model
status_id
condition_id
qr_token
notes
created_by
updated_by
created_at
updated_at
deleted_at
```

## asset_categories

``` text
id
code
name
description
is_active
created_at
updated_at
```

## departments

``` text
id
code
name
description
is_active
created_at
updated_at
```

## locations

``` text
id
parent_id
code
name
description
is_active
created_at
updated_at
```

## asset_code_prefixes

``` text
id
prefix
name
description
format
number_length
next_number
is_active
created_by
created_at
updated_at
```

## audit_sessions

``` text
id
code
name
description
scope_type
start_date
end_date
status
completion_mode
created_by
started_at
completed_at
created_at
updated_at
```

## asset_audits

``` text
id
audit_session_id
asset_id
auditor_id
audit_time
found_status
condition_id
location_id
quantity_found
result
verification_method
notes
photo_path
latitude
longitude
created_at
updated_at
```

## asset_movements

``` text
id
asset_id
from_department_id
to_department_id
from_location_id
to_location_id
reason
moved_by
moved_at
created_at
```

## import_jobs

``` text
id
file_name
file_path
file_size
mode
total_rows
valid_rows
warning_rows
error_rows
created_rows
updated_rows
skipped_rows
failed_rows
status
uploaded_by
started_at
completed_at
error_file_path
created_at
updated_at
```

## import_errors

``` text
id
import_job_id
row_number
asset_code
field
value
error_type
message
created_at
```

## activity_logs

``` text
id
user_id
action
module
entity_type
entity_id
old_values
new_values
ip_address
user_agent
created_at
```

------------------------------------------------------------------------

# 76. API / Internal Data Architecture

Meskipun menggunakan Inertia, backend harus memiliki service layer yang
jelas.

Struktur konsep:

``` text
Controller
    ↓
Request Validation
    ↓
Service
    ↓
Repository/Query Layer bila diperlukan
    ↓
Model
    ↓
MySQL
```

Business logic jangan ditumpuk seluruhnya di Controller.

------------------------------------------------------------------------

# 77. Suggested Laravel Structure

``` text
app/
├── Http/
│   ├── Controllers/
│   ├── Requests/
│   └── Resources/
├── Models/
├── Services/
├── Actions/
├── Jobs/
├── Policies/
├── Notifications/
└── Support/

resources/
├── js/
│   ├── Components/
│   ├── Layouts/
│   ├── Pages/
│   ├── Hooks/
│   └── Lib/
└── css/

database/
├── migrations/
├── seeders/
└── factories/
```

------------------------------------------------------------------------

# 78. Suggested React Structure

``` text
resources/js/

Components/
├── UI/
├── Dashboard/
├── Asset/
├── Audit/
├── Import/
├── Reports/
└── Shared/

Layouts/
├── AppLayout
├── AuthLayout
└── DashboardLayout

Pages/
├── Dashboard/
├── Assets/
├── Categories/
├── Departments/
├── Locations/
├── AssetCodes/
├── Audits/
├── Reports/
├── Imports/
├── Users/
├── ActivityLogs/
└── Settings/

Hooks/
├── useDebounce
├── usePermission
└── useFilters

Lib/
├── utils
└── formatters
```

------------------------------------------------------------------------

# 79. Component Requirements

Reusable components:

``` text
StatCard
DataTable
SearchInput
FilterPanel
DateRangePicker
ConfirmDialog
AssetForm
AssetStatusBadge
ConditionBadge
AuditProgress
QRCodeDisplay
QRCodeScanner
ImportUploader
ImportPreview
ImportProgress
ReportFilter
ChartCard
EmptyState
LoadingSkeleton
Toast
```

------------------------------------------------------------------------

# 80. Testing Requirements

## 80.1 Unit Test

Test:

-   Asset code generation.
-   Prefix sequence.
-   Validation.
-   Financial calculation/display logic if any.
-   Audit result.
-   Permission.

## 80.2 Feature Test

Test:

-   Login.
-   Asset CRUD.
-   Import.
-   Audit.
-   QR.
-   Export.
-   User permissions.

## 80.3 Import Test

Minimal test cases:

-   Empty file.
-   Invalid extension.
-   Missing header.
-   Duplicate code.
-   Duplicate within same file.
-   Invalid date.
-   Invalid number.
-   Empty required field.
-   Large file.
-   Existing code in Create Only.
-   Existing code in Upsert.
-   Partial failure.
-   Queue failure.

## 80.4 UI Test

Test:

-   Desktop.
-   Tablet.
-   Mobile.
-   Scanner.
-   Modal.
-   Forms.
-   Table.
-   Loading.
-   Error states.

------------------------------------------------------------------------

# 81. Acceptance Criteria

## Authentication

-   User dapat login.
-   User tanpa permission tidak dapat membuka modul.
-   Logout berfungsi.
-   Session aman.

## Asset

-   Admin dapat CRUD asset.
-   Asset code unique.
-   Existing code dapat dipertahankan.
-   Asset detail menampilkan informasi lengkap.
-   Asset history tersedia.

## Asset Code

-   Prefix dapat dibuat.
-   Prefix dapat dinonaktifkan.
-   Format dapat dikustomisasi.
-   Manual code tersedia.
-   Auto generate tersedia.
-   Sequence aman dari collision.

## Import

-   Excel dapat diupload.
-   Mapping tersedia.
-   Preview tersedia.
-   Validation tersedia.
-   Duplicate detection tersedia.
-   Error report tersedia.
-   Import dapat diproses async.
-   Progress tersedia.
-   Import history tersedia.
-   Existing code tidak diubah secara otomatis.

## Audit

-   Audit session dapat dibuat.
-   Scope dapat ditentukan.
-   Auditor dapat melakukan audit.
-   QR scanning tersedia.
-   Condition dapat dicatat.
-   Location dapat diverifikasi.
-   Quantity dapat diverifikasi.
-   Missing/mismatch dapat terdeteksi.
-   Audit history tersimpan.

## Reports

-   Report dapat difilter.
-   Report dapat diekspor.
-   Export besar tidak memblokir browser.

## Performance

-   Pagination diterapkan.
-   Query utama memiliki index.
-   Dashboard tidak melakukan query berat berulang.
-   Import besar menggunakan queue/chunk.

------------------------------------------------------------------------

# 82. Definition of Done

Sebuah modul dianggap selesai jika:

1.  UI selesai.
2.  Backend selesai.
3.  Validation selesai.
4.  Authorization selesai.
5.  Database migration selesai.
6.  Error handling selesai.
7.  Loading state selesai.
8.  Empty state selesai.
9.  Responsive selesai.
10. Activity log sesuai kebutuhan.
11. Test utama lulus.
12. Tidak ada error console kritis.
13. Tidak ada query N+1 yang diketahui pada halaman utama.
14. Tidak ada endpoint sensitif tanpa authorization.
15. Dokumentasi penggunaan tersedia.

------------------------------------------------------------------------

# 83. Development Phases

## Phase 1 --- Foundation

-   Laravel setup.
-   React/Inertia.
-   Tailwind.
-   shadcn/ui.
-   Authentication.
-   RBAC.
-   MySQL.
-   Base layout.

## Phase 2 --- Master Data

-   Asset.
-   Category.
-   Department.
-   Location.
-   Status.
-   Condition.
-   Asset Code Prefix.

## Phase 3 --- Import

-   Excel upload.
-   Mapping.
-   Validation.
-   Preview.
-   Queue.
-   Chunk.
-   Error report.
-   Import history.

## Phase 4 --- Dashboard

-   Statistics.
-   Charts.
-   Recent activity.
-   Alerts.
-   Performance optimization.

## Phase 5 --- Audit

-   Audit session.
-   Scope.
-   Audit record.
-   QR scanner.
-   Missing/mismatch.
-   Photos.
-   History.

## Phase 6 --- Reports

-   Asset register.
-   Audit report.
-   Missing.
-   Mismatch.
-   Condition.
-   Department.
-   Financial summary.
-   Export.

## Phase 7 --- Hardening

-   Security.
-   Performance.
-   Testing.
-   Backup.
-   Production deployment.
-   Monitoring.

------------------------------------------------------------------------

# 84. Production Deployment

Target environment:

``` text
Hostinger
PHP
MySQL
Laravel
Node build output
```

Production requirements:

-   HTTPS.
-   Production environment variables.
-   `APP_DEBUG=false`.
-   Secure session configuration.
-   Database credentials outside repository.
-   Storage symlink/configuration.
-   Queue worker according to hosting capability.
-   Cron/scheduler if required.
-   Cache configuration.
-   OPcache.
-   Error logging.

Jika paket hosting tidak mendukung long-running queue worker, queue
dapat disesuaikan dengan scheduler/cron atau deployment ke VPS pada fase
berikutnya.

------------------------------------------------------------------------

# 85. Environment Variables

Contoh:

``` env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://domain-hotel.com

DB_CONNECTION=mysql
DB_HOST=
DB_PORT=3306
DB_DATABASE=
DB_USERNAME=
DB_PASSWORD=

CACHE_STORE=
QUEUE_CONNECTION=

FILESYSTEM_DISK=
```

Jangan commit `.env` ke Git.

------------------------------------------------------------------------

# 86. Git & Version Control

Repository harus memiliki:

``` text
main
develop
feature/*
bugfix/*
```

Commit message konsisten:

``` text
feat: add asset import
fix: prevent duplicate asset code
refactor: optimize dashboard query
docs: update import guide
```

------------------------------------------------------------------------

# 87. Logging & Monitoring

Production log harus mencatat:

-   Application errors.
-   Queue failures.
-   Import failures.
-   Critical exceptions.

Jangan menampilkan stack trace kepada user.

------------------------------------------------------------------------

# 88. Data Migration Strategy

Jika data awal berasal dari Excel:

``` text
Existing Excel
↓
Clean Data
↓
Map Fields
↓
Validate
↓
Preview
↓
Import
↓
Verify Count
↓
Verify Sample
↓
Production
```

Sebelum migrasi production:

-   Backup database.
-   Backup Excel original.
-   Jalankan dry-run.
-   Cocokkan jumlah baris.
-   Cek duplicate.
-   Cek total nilai.
-   Cek sample asset.
-   Dokumentasikan hasil.

------------------------------------------------------------------------

# 89. Data Reconciliation

Setelah import, sistem/admin harus dapat membandingkan:

``` text
Total Excel Rows
vs
Total Imported Assets
```

Contoh:

``` text
Excel: 2,350
Imported: 2,330
Skipped: 10
Failed: 10
```

Harus jelas alasan perbedaannya.

Untuk data financial, lakukan sampling:

``` text
Excel Acquisition Value
vs
Database Acquisition Value
```

agar tidak terjadi perubahan nilai saat proses import.

------------------------------------------------------------------------

# 90. Important Existing Excel Compatibility

Sistem harus mempertimbangkan bahwa data existing dapat memiliki:

-   Nama barang panjang.
-   Deskripsi dengan ukuran barang.
-   Kode prefix berbeda-beda.
-   Lokasi generik seperti `HOTEL`.
-   Nilai dengan format angka/currency.
-   Decimal quantity.
-   Tanggal lama.
-   Kolom kosong.
-   Baris kosong.
-   Formatting Excel yang tidak konsisten.

Parser import harus robust terhadap kondisi tersebut.

------------------------------------------------------------------------

# 91. Handling Existing Location

Jika Excel:

``` text
HOTEL
```

tetapi database belum memiliki location `HOTEL`, sistem tidak boleh
diam-diam membuat banyak duplicate location.

Gunakan proses:

``` text
Existing Location Mapping

HOTEL
↓
Location: Hotel
```

Admin dapat memilih mapping sebelum import.

------------------------------------------------------------------------

# 92. Handling Existing Category/Department

Jika Excel belum memiliki kategori/department yang eksplisit, sistem
tidak boleh menebak secara otomatis dari prefix kecuali mapping tersebut
memang dikonfigurasi.

Contoh:

``` text
CLD
↓
Category?
```

Sistem tidak boleh mengasumsikan arti `CLD`.

Admin yang menentukan mapping.

------------------------------------------------------------------------

# 93. Import Idempotency

Import harus dirancang agar file yang sama tidak mudah menyebabkan
duplicate data.

Sistem dapat menyimpan:

-   File name.
-   File hash.
-   User.
-   Timestamp.

Jika file identik diupload kembali, tampilkan warning:

``` text
File dengan isi identik pernah diimport.

Lanjutkan?
```

------------------------------------------------------------------------

# 94. Concurrency

Sistem harus aman ketika dua admin membuat asset bersamaan.

Contoh:

``` text
Admin A -> generate CLD025
Admin B -> generate CLD026
```

Tidak boleh keduanya mendapatkan:

``` text
CLD025
```

Gunakan database transaction/locking pada sequence.

------------------------------------------------------------------------

# 95. Audit Concurrency

Jika dua auditor mengaudit asset yang sama dalam session yang sama,
sistem harus memiliki aturan.

Default:

-   Sistem memberi warning bahwa asset sudah diaudit.
-   User dapat melihat siapa yang terakhir mengaudit.
-   Pengubahan audit lama dibatasi.
-   Jika override diperlukan, dicatat dalam activity log.

------------------------------------------------------------------------

# 96. Data Ownership

Master asset dimiliki oleh organisasi/hotel.

User hanya melakukan action berdasarkan permission.

Asset tidak boleh bergantung pada user sebagai owner kecuali business
requirement memang membutuhkan.

------------------------------------------------------------------------

# 97. UX untuk Auditor

Mode audit harus berbeda dari mode administrasi.

Audit mode harus:

-   Fokus pada satu asset.
-   Tombol besar.
-   Form singkat.
-   QR scanner mudah diakses.
-   Minim navigasi.
-   Bisa kembali ke asset berikutnya.
-   Menampilkan progress.

Contoh:

``` text
Audit Session
Hotel Asset Audit 2026

Progress
128 / 1,284

[ Scan QR ]

Asset
CLD001

Cushion 22

Location
HOTEL

Condition
[ Good ▼ ]

Quantity Found
[ 1 ]

[ Add Photo ]

[ Submit Audit ]
```

------------------------------------------------------------------------

# 98. Mobile Audit

Karena audit fisik kemungkinan dilakukan sambil berjalan di hotel,
mobile UX harus diprioritaskan untuk halaman:

-   QR Scanner.
-   Asset detail.
-   Audit form.
-   Photo upload.
-   Audit progress.

Dashboard administrasi tetap dioptimalkan untuk desktop.

------------------------------------------------------------------------

# 99. Offline Consideration

MVP tidak wajib offline-first.

Namun arsitektur dapat dikembangkan untuk offline audit di masa depan.

Jika hotel memiliki area dengan jaringan buruk, fase berikutnya dapat
menggunakan:

``` text
PWA
+
Local Storage/IndexedDB
+
Sync Queue
```

------------------------------------------------------------------------

# 100. Future Roadmap

Fase berikutnya dapat menambahkan:

1.  PWA.
2.  Offline Audit.
3.  Approval workflow.
4.  Finance integration.
5.  ERP integration.
6.  RFID.
7.  Barcode.
8.  WhatsApp notification.
9.  Email notification.
10. Predictive maintenance.
11. Asset depreciation engine.
12. Multi-property hotel.
13. Multi-tenant architecture.
14. SSO.
15. Advanced analytics.

------------------------------------------------------------------------

# 101. Multi-Hotel Consideration

Versi awal dapat fokus pada satu hotel.

Namun database sebaiknya tidak membuat asumsi yang menyulitkan ekspansi.

Jika nanti sistem digunakan untuk beberapa property:

``` text
Hotel A
Hotel B
Hotel C
```

dapat ditambahkan:

``` text
properties
property_id
```

pada tabel yang relevan.

Jangan mengimplementasikan multi-tenant kompleks jika belum diperlukan
MVP.

------------------------------------------------------------------------

# 102. Non-Functional Requirements

## Performance

Sistem harus responsif.

## Reliability

Data tidak boleh hilang karena request timeout.

## Security

Authorization dan validation wajib.

## Maintainability

Code modular dan terdokumentasi.

## Scalability

Mampu menangani pertumbuhan data.

## Usability

User non-teknis dapat menggunakan sistem tanpa training panjang.

## Compatibility

Browser modern:

-   Chrome
-   Edge
-   Firefox
-   Safari modern

------------------------------------------------------------------------

# 103. Success Metrics

Sistem dianggap berhasil jika:

1.  Data aset dapat dipusatkan.
2.  Import Excel berhasil tanpa mengubah kode existing.
3.  Admin dapat menambah asset baru dengan manual/auto code.
4.  Auditor dapat melakukan audit melalui smartphone.
5.  Missing/mismatch dapat diketahui.
6.  Histori audit dapat ditelusuri.
7.  Dashboard dapat menunjukkan progress.
8.  Laporan dapat dibuat tanpa proses manual berat.
9.  Tidak terjadi duplicate asset code.
10. User dapat mengetahui siapa yang mengubah data.
11. Sistem tetap usable ketika data bertambah.
12. Proses import besar tidak menyebabkan browser freeze/timeout.

------------------------------------------------------------------------

# 104. Prioritas Fitur

## P0 --- Wajib

-   Authentication.
-   RBAC.
-   Dashboard.
-   Asset Management.
-   Category.
-   Department.
-   Location.
-   Asset Code.
-   Excel Import.
-   Import Validation.
-   Audit Session.
-   Asset Audit.
-   QR.
-   Audit History.
-   Activity Log.
-   Basic Reports.

## P1 --- Penting

-   Photo.
-   Export Excel.
-   Export PDF.
-   Advanced Filters.
-   Notifications.
-   Asset Movement.
-   Import Mapping Preset.

## P2 --- Future

-   Offline.
-   PWA.
-   RFID.
-   ERP.
-   AI.
-   Multi-property.
-   Advanced accounting.

------------------------------------------------------------------------

# 105. Final Product Architecture

``` text
                       USER
                        │
                        ▼
              ┌───────────────────┐
              │ React Dashboard   │
              │ Tailwind + shadcn │
              │ Framer Motion     │
              └─────────┬─────────┘
                        │
                    Inertia.js
                        │
                        ▼
              ┌───────────────────┐
              │ Laravel 12        │
              │                   │
              │ Controllers       │
              │ Requests          │
              │ Services          │
              │ Policies          │
              │ Jobs              │
              └───────┬───────────┘
                      │
          ┌───────────┼────────────┐
          │           │            │
          ▼           ▼            ▼
       MySQL       Queue        Storage
          │           │            │
          │           ▼            │
          │       Import/Export    │
          │                        │
          └──────────┬─────────────┘
                     ▼
              Hotel Asset Data
```

------------------------------------------------------------------------

# 106. Final Technology Decision

## Backend

**Laravel 12**

## Frontend

**React + Inertia.js**

## UI

**Tailwind CSS + shadcn/ui**

## Animation

**Framer Motion**

## Icon

**Lucide React**

## Chart

**Recharts**

## Data Table

**TanStack Table**

## Database

**MySQL 8**

## Permission

**Spatie Laravel Permission**

## Excel

**Laravel Excel**

## Queue

**Laravel Queue**

## Deployment

**Hostinger**

------------------------------------------------------------------------

# 107. Final Core Modules

``` text
1. Authentication
2. Dashboard
3. Asset Management
4. Asset Code Management
5. Category Management
6. Department Management
7. Location Management
8. Status & Condition Management
9. QR Code Management
10. Audit Session
11. Asset Audit
12. Audit History
13. Asset Movement
14. Bulk Excel Import
15. Import Validation
16. Import History
17. Export
18. Reports
19. User Management
20. Role & Permission
21. Activity Log
22. Notification
23. System Settings
```

------------------------------------------------------------------------

# 108. Final Business Principle

Sistem ini **bukan sekadar mengganti Excel menjadi website**.

Sistem harus menjadikan Excel sebagai **sumber migrasi/import**,
sementara database menjadi **single source of truth** setelah data
masuk.

Konsep akhirnya:

``` text
                 EXISTING EXCEL
                       │
                       ▼
                 IMPORT ENGINE
                       │
                VALIDATION
                       │
                       ▼
                 MYSQL DATABASE
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
      ASSET           AUDIT          REPORT
        │              │              │
        ▼              ▼              ▼
       QR           HISTORY        DASHBOARD
        │              │              │
        └──────────────┴──────────────┘
                       │
                       ▼
                HOTEL MANAGEMENT
```

**Excel = sumber migrasi/data awal**

**MySQL = sumber data utama sistem**

**Audit = histori pemeriksaan fisik**

**Dashboard = monitoring**

**Report = output**

Dengan prinsip tersebut, sistem tetap kompatibel dengan data aset hotel
yang sudah ada, tetapi tidak terjebak menjadi sekadar aplikasi Excel
berbasis web.
