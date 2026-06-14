# Frontend Implementation Guide - Student Attendance

## Flow Overview

1. Dosen or academic admin opens an attendance session for a class schedule and meeting.
2. The backend creates one `presensi_sesi` row.
3. The backend generates one `presensi_mahasiswa` row for each enrolled student in the selected class.
4. Generated rows start with `status_presensi = "A"` and `metode = "Manual"`.
5. Manual roll call and mahasiswa self-submit update those generated rows.

QR and barcode attendance endpoints are not part of this flow.

## Open Session

```
POST /api/akademik/presensi-mahasiswa/session/open
```

Payload:

```json
{
    "ID_KELAS_MK": 5,
    "PERTEMUAN_KE": 3,
    "duration_minutes": 15
}
```

Use this before rendering the roll-call roster. Opening a session generates the initial `presensi_mahasiswa` rows from `kelas_master` for the class attached to `kelas_mk`.

## Roster Fetch

```
GET /api/akademik/presensi-mahasiswa/roster?id_kelas_mk=5&pertemuan_ke=3
```

The roster is read directly from `presensi_mahasiswa`.

Each row includes:

- `id_presensi`
- `id_kelas_master`
- `id_kelas_mk`
- `id_sesi`
- `nim`
- `pertemuan_ke`
- `status_presensi`
- `metode`
- `waktu_presensi`

Student names are not returned by this endpoint unless a reliable student profile source is added outside the `users` table.

## Manual Roll Call

Keep local UI state keyed by `id_presensi` or `id_kelas_master`. Render status controls for `H`, `I`, `S`, and `A`.

```typescript
interface AttendanceRow {
    id_presensi: number;
    id_kelas_master: number;
    id_kelas_mk: number;
    id_sesi: number | null;
    nim: string;
    pertemuan_ke: number;
    status_presensi: "H" | "I" | "S" | "A";
    metode: "Manual" | string;
    waktu_presensi: string | null;
}
```

Batch save endpoint:

```
POST /api/akademik/presensi-mahasiswa/batch-roll-call
```

Payload:

```json
{
    "presensi": [
        {
            "id_kelas_master": 10,
            "nim": "12345678901",
            "id_kelas_mk": 5,
            "pertemuan_ke": 3,
            "status_presensi": "H"
        },
        {
            "id_kelas_master": 11,
            "nim": "12345678902",
            "id_kelas_mk": 5,
            "pertemuan_ke": 3,
            "status_presensi": "A"
        }
    ]
}
```

The backend updates existing generated rows or creates missing rows for the same `(ID_KELAS_MASTER, ID_KELAS_MK, PERTEMUAN_KE)` key.

## Mahasiswa Self-Submit

```
POST /api/mahasiswa/presensi/submit
```

Payload:

```json
{
    "id_kelas_master": 10,
    "id_kelas_mk": 5,
    "nim": "12345678901",
    "pertemuan_ke": 3
}
```

The backend checks the session and updates the generated row to:

- `status_presensi = "H"`
- `metode = "Manual"`
- `id_sesi = current session ID`
- `waktu_presensi = now`

If the generated row does not exist, the backend returns `404` and the session must be opened first.

## API Reference Summary

| Method | Endpoint | Roles | Description |
| --- | --- | --- | --- |
| `POST` | `/api/akademik/presensi-mahasiswa/session/open` | `super_admin`, `admin_akademik`, `dosen` | Open a session and generate attendance rows |
| `POST` | `/api/akademik/presensi-mahasiswa/session/{id}/close` | `super_admin`, `admin_akademik`, `dosen` | Close an active session |
| `GET` | `/api/akademik/presensi-mahasiswa/roster` | authorized academic attendance roles | Read generated attendance rows |
| `POST` | `/api/akademik/presensi-mahasiswa/batch-roll-call` | authorized academic attendance roles | Save manual roll call |
| `POST` | `/api/mahasiswa/presensi/submit` | `mahasiswa` | Mark generated row as present |
| `GET` | `/api/mahasiswa/presensi/available` | `mahasiswa` | List active attendance sessions |
