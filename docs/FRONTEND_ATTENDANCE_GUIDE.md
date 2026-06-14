# Frontend Implementation Guide — Hybrid Attendance System

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Lecturer UI                          │
│  ┌──────────────┐  ┌────────────────────────────────┐  │
│  │ Barcode Mode  │  │    Manual Roll Call Mode       │  │
│  │ (hidden       │  │  ┌────┬────┬────┬────┬────┐   │  │
│  │  input        │  │  │ No │NIM │Name│ H│I│S│A│   │  │
│  │  listener)    │  │  ├────┼────┼────┼────┼────┤   │  │
│  │               │  │  │ 1  │... │... │○│ │ │ │   │  │
│  │               │  │  │ 2  │... │... │ │○│ │ │   │  │
│  │               │  │  └────┴────┴────┴────┴────┘   │  │
│  └──────────────┘  │         [Save Session]          │  │
│                    └────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
         │                           │
         ▼                           ▼
  POST /akademik/presensi-    POST /akademik/presensi-
  mahasiswa/barcode           mahasiswa/batch
```

---

## 1. Barcode / QR Scanner Listener

### Concept

USB barcode scanners emulate a keyboard — they "type" the scanned string rapidly followed by an `Enter` key. We intercept these keystrokes with a hidden input field.

### Implementation

```html
<!-- Hidden input that always has focus in barcode mode -->
<input
    id="barcode-input"
    type="text"
    autocomplete="off"
    style="position: fixed; top: -100px; left: -100px; opacity: 0;"
/>
```

```typescript
// barcode-listener.ts
const BARCODE_SCAN_TIMEOUT_MS = 50; // max ms between keystrokes
const BARCODE_MIN_LENGTH = 5; // ignore short strings
const SCAN_RESET_DELAY_MS = 1500; // auto-clear after success

let barcodeBuffer = "";
let lastKeyTime = 0;
let scanTimer: ReturnType<typeof setTimeout> | null = null;

const input = document.getElementById("barcode-input") as HTMLInputElement;

input.addEventListener("keydown", (e: KeyboardEvent) => {
    const now = Date.now();

    // If gap between keystrokes is too large, it's manual typing — reset
    if (now - lastKeyTime > BARCODE_SCAN_TIMEOUT_MS) {
        barcodeBuffer = "";
    }
    lastKeyTime = now;

    if (e.key === "Enter") {
        e.preventDefault();
        if (barcodeBuffer.length >= BARCODE_MIN_LENGTH) {
            submitBarcode(barcodeBuffer);
        }
        barcodeBuffer = "";
    } else if (e.key.length === 1) {
        barcodeBuffer += e.key;
    }
});

// Keep focus on the hidden input in barcode mode
function enableBarcodeMode() {
    input.focus();
    input.value = "";
}

async function submitBarcode(barcodeString: string) {
    try {
        const res = await fetch("/api/akademik/presensi-mahasiswa/barcode", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                barcode_string: barcodeString,
                ID_KELAS_MK: currentKelasMkId,
                PERTEMUAN_KE: currentPertemuanKe,
            }),
        });

        const data = await res.json();

        if (res.ok) {
            showToast(`✔ ${data.message}`, "success");
            // Optionally highlight the student row green in the manual roster
            highlightStudentRow(data.data.nim);
        } else {
            showToast(`✘ ${data.message}`, "error");
        }
    } catch {
        showToast("Gagal terhubung ke server.", "error");
    } finally {
        // Clear after delay, re-focus
        setTimeout(() => {
            input.value = "";
            input.focus();
        }, SCAN_RESET_DELAY_MS);
    }
}
```

### Key points

- The input must **always** have focus in barcode mode. Re-focus after every scan.
- Barcode string is expected to be the student's **NIM** (11 characters).
- The backend resolves `barcode → NIM → KelasMaster (enrollment) → PresensiMahasiswa`.

---

## 2. Manual Roll Call UI

### Data Flow

1. Lecturer selects a **Kelas MK** (schedule) and **Pertemuan Ke** (meeting number).
2. Frontend calls `GET /akademik/kelas-master?ID_KELAS=<id>` to fetch the roster.
3. Renders a table with radio buttons for each student.

### Roster Fetch

```
GET /api/akademik/kelas-master?ID_KELAS=<kelasId>
```

The response includes `kelas` (with `kelas_nama`), `tahun_akademik`, and optionally eager-loaded presensi data. Each row has:

- `id_kelas_master` — the enrollment PK (sent back in batch)
- `nim` — student ID
- `no_absen` — absence number for sorting

### Radio Button State Management

```typescript
interface AttendanceRow {
    id_kelas_master: number;
    nim: string;
    no_absen: number;
    status_presensi: "H" | "I" | "S" | "A" | null;
}

// Initialize all rows with null (unset)
const [roster, setRoster] = useState<AttendanceRow[]>([]);

function setStatus(index: number, status: "H" | "I" | "S" | "A") {
    setRoster((prev) =>
        prev.map((row, i) =>
            i === index ? { ...row, status_presensi: status } : row,
        ),
    );
}
```

### Rendering (React example)

```tsx
<table>
    <thead>
        <tr>
            <th>No</th>
            <th>NIM</th>
            <th>Nama</th>
            <th>H</th>
            <th>I</th>
            <th>S</th>
            <th>A</th>
        </tr>
    </thead>
    <tbody>
        {roster.map((row, i) => (
            <tr
                key={row.id_kelas_master}
                className={row.status_presensi ? "row-set" : "row-pending"}
            >
                <td>{row.no_absen}</td>
                <td>{row.nim}</td>
                <td>{/* student name from KelasMaster.kelas lookup */}</td>
                {(["H", "I", "S", "A"] as const).map((s) => (
                    <td key={s}>
                        <input
                            type="radio"
                            name={`att-${row.id_kelas_master}`}
                            checked={row.status_presensi === s}
                            onChange={() => setStatus(i, s)}
                        />
                    </td>
                ))}
            </tr>
        ))}
    </tbody>
</table>
```

---

## 3. Batch Submission ("Save Session")

### When to submit

The lecturer clicks **"Simpan Presensi"** after setting all radio buttons.

### Building the payload

```typescript
function buildBatchPayload(): object {
    return {
        presensi: roster
            .filter((row) => row.status_presensi !== null)
            .map((row) => ({
                id_kelas_master: row.id_kelas_master,
                nim: row.nim,
                id_kelas_mk: currentKelasMkId,
                pertemuan_ke: currentPertemuanKe,
                status_presensi: row.status_presensi,
                metode: "Manual",
            })),
    };
}
```

### Sending

```typescript
async function saveSession() {
    const payload = buildBatchPayload();

    if (payload.presensi.length === 0) {
        showToast("Tidak ada data presensi untuk disimpan.", "warning");
        return;
    }

    try {
        const res = await fetch("/api/akademik/presensi-mahasiswa/batch", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (res.ok) {
            showToast(`✔ ${data.message}`, "success");
            setRoster((prev) =>
                prev.map((r) => ({ ...r, status_presensi: null })),
            ); // reset
        } else {
            showToast(`✘ ${data.message}`, "error");
        }
    } catch {
        showToast("Gagal terhubung ke server.", "error");
    }
}
```

### Backend behavior (for reference)

- Uses Laravel `upsert()` — if a record already exists for the same `(ID_KELAS_MASTER, ID_KELAS_MK, PERTEMUAN_KE)`, it updates `STATUS_PRESENSI` instead of creating a duplicate.
- All records are inserted/updated inside a single `DB::transaction()` — atomic.
- Returns `{ success: true, message: "Batch presensi berhasil disimpan (N data)." }`.

---

## API Reference Summary

| Method   | Endpoint                               | Roles                                  | Description                      |
| -------- | -------------------------------------- | -------------------------------------- | -------------------------------- |
| `GET`    | `/akademik/presensi-mahasiswa`         | All read roles                         | List all attendance records      |
| `GET`    | `/akademik/presensi-mahasiswa/{id}`    | All read roles                         | Detail of one record             |
| `POST`   | `/akademik/presensi-mahasiswa`         | super_admin, admin_akademik            | Create single record (admin use) |
| `PATCH`  | `/akademik/presensi-mahasiswa/{id}`    | super_admin, admin_akademik            | Update single record             |
| `DELETE` | `/akademik/presensi-mahasiswa/{id}`    | super_admin, admin_akademik            | Delete record                    |
| `POST`   | `/akademik/presensi-mahasiswa/barcode` | super_admin, admin_akademik, **dosen** | Barcode/QR scan attendance       |
| `POST`   | `/akademik/presensi-mahasiswa/batch`   | super_admin, admin_akademik, **dosen** | Batch manual roll call           |

### Barcode endpoint payload

```json
{
    "barcode_string": "12345678901",
    "ID_KELAS_MK": 5,
    "PERTEMUAN_KE": 3
}
```

### Batch endpoint payload

```json
{
    "presensi": [
        {
            "id_kelas_master": 10,
            "nim": "12345678901",
            "id_kelas_mk": 5,
            "pertemuan_ke": 3,
            "status_presensi": "H",
            "metode": "Manual"
        },
        {
            "id_kelas_master": 11,
            "nim": "12345678902",
            "id_kelas_mk": 5,
            "pertemuan_ke": 3,
            "status_presensi": "A",
            "metode": "Manual"
        }
    ]
}
```
