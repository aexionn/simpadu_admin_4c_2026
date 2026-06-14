<?php

namespace App\Extensions;

use Dedoc\Scramble\Extensions\OperationExtension;
use Dedoc\Scramble\Support\Generator\Operation;
use Dedoc\Scramble\Support\RouteInfo;
use Illuminate\Support\Str;

class ApiOperationDescriptionExtension extends OperationExtension
{
    private array $descriptions = [
        'GET api/data-master/tahun-akademik' => [
            'summary' => 'Display all academic years',
            'description' => 'Returns a list of all academic year records ordered by the newest ID first.',
        ],
        'GET api/data-master/tahun-akademik/active' => [
            'summary' => 'Display the active academic year',
            'description' => 'Returns the academic year where AKTIF = Y. If no active academic year is found, all academic year records are returned as a fallback.',
        ],
        'POST api/data-master/tahun-akademik' => [
            'summary' => 'Create a new academic year',
            'description' => 'Creates a new academic year record. If AKTIF = Y is provided, this record becomes the only active academic year.',
        ],
        'GET api/akademik/kelas' => [
            'summary' => 'Display all classes',
            'description' => 'Returns a list of all class records, including their program class and academic year data when available.',
        ],
        'POST api/akademik/kelas' => [
            'summary' => 'Create a new class',
            'description' => 'Creates a new class record. The academic year is assigned automatically from the currently active academic year where AKTIF = Y.',
        ],
        'GET api/akademik/kelas/{id}' => [
            'summary' => 'Display a specific class',
            'description' => 'Returns the detail of one class record by ID, including its program class and academic year data when available.',
        ],
        'PATCH api/akademik/kelas/{id}' => [
            'summary' => 'Update a class',
            'description' => 'Updates an existing class record. The academic year cannot be changed after the class is created.',
        ],
        'PUT api/akademik/kelas/{id}' => [
            'summary' => 'Update a class',
            'description' => 'Updates an existing class record. The academic year cannot be changed after the class is created.',
        ],
        'DELETE api/akademik/kelas/{id}' => [
            'summary' => 'Delete a class',
            'description' => 'Deletes a class record by ID.',
        ],
        'GET api/mahasiswa/presensi/available' => [
            'summary' => 'Display available student attendance sessions',
            'description' => 'Returns currently active attendance sessions that can be accessed by authenticated users with the mahasiswa role.',
        ],
        'POST api/mahasiswa/presensi/submit' => [
            'summary' => 'Submit student attendance',
            'description' => 'Allows an authenticated mahasiswa user to submit attendance for an active class meeting session. The backend records the attendance as Hadir with Manual method while the session is open.',
        ],
        'POST api/akademik/presensi-mahasiswa/session/open' => [
            'summary' => 'Open a student attendance session',
            'description' => 'Opens a student attendance session for a class meeting. Only super admins, academic admins, and dosen users can open sessions.',
        ],
        'POST api/akademik/presensi-mahasiswa/session/{id}/close' => [
            'summary' => 'Close a student attendance session',
            'description' => 'Closes an active student attendance session so students can no longer submit attendance for that session.',
        ],
        'GET api/akademik/presensi-mahasiswa' => [
            'summary' => 'Display all student attendance records',
            'description' => 'Returns a list of student attendance records.',
        ],
        'GET api/akademik/presensi-mahasiswa/roster' => [
            'summary' => 'Display class roster with attendance status',
            'description' => 'Returns the class roster for a specific class schedule and meeting, including the current attendance status for each student.',
        ],
        'POST api/akademik/presensi-mahasiswa/batch-roll-call' => [
            'summary' => 'Submit batch manual roll-call attendance',
            'description' => 'Creates or updates multiple student attendance records for a class meeting using manual roll call.',
        ],
        'GET api/akademik/presensi-mahasiswa/{id}' => [
            'summary' => 'Display a specific student attendance record',
            'description' => 'Returns the detail of one student attendance record by ID.',
        ],
        'PATCH api/akademik/presensi-mahasiswa/{id}' => [
            'summary' => 'Update a student attendance record',
            'description' => 'Updates a student attendance record for correction by authorized staff.',
        ],
        'GET api/akademik/nilai' => [
            'summary' => 'Display grade records',
            'description' => 'Returns grade records with optional filters for lecturer, class, course, and student NIM.',
        ],
        'POST api/akademik/nilai' => [
            'summary' => 'Create a grade record',
            'description' => 'Creates a new grade record and automatically calculates final score and letter grade using the configured grade weights.',
        ],
        'POST api/akademik/nilai/batch' => [
            'summary' => 'Create grade records in batch',
            'description' => 'Creates multiple grade records for one class and course. Each final score and letter grade is calculated automatically.',
        ],
        'PATCH api/akademik/nilai/{id}' => [
            'summary' => 'Update a grade record',
            'description' => 'Updates a grade record and recalculates final score and letter grade.',
        ],
        'GET api/akademik/setting-nilai' => [
            'summary' => 'Display grade weight settings',
            'description' => 'Returns grade weight settings with optional filters for lecturer, class, and course.',
        ],
        'POST api/akademik/setting-nilai' => [
            'summary' => 'Create grade weight settings',
            'description' => 'Creates grade weight settings for a lecturer, class, and course. The total weight must equal 100.',
        ],
        'PATCH api/akademik/setting-nilai/{id}' => [
            'summary' => 'Update grade weight settings',
            'description' => 'Updates grade weight settings and validates that the total weight equals 100.',
        ],
    ];

    private array $entityNames = [
        'auth' => ['authentication action', 'authentication actions'],
        'user-management' => ['user', 'users'],
        'users' => ['user', 'users'],
        'roles' => ['role', 'roles'],
        'role' => ['role', 'roles'],
        'profile' => ['profile', 'profiles'],
        'presensi-pegawai' => ['employee attendance record', 'employee attendance records'],
        'presensi-mahasiswa' => ['student attendance record', 'student attendance records'],
        'hari' => ['day', 'days'],
        'ruang' => ['room', 'rooms'],
        'jurusan' => ['department', 'departments'],
        'prodi' => ['study program', 'study programs'],
        'program-kelas' => ['class program', 'class programs'],
        'mata-kuliah' => ['course', 'courses'],
        'tahun-akademik' => ['academic year', 'academic years'],
        'kurikulum' => ['curriculum', 'curricula'],
        'provinsi' => ['province', 'provinces'],
        'kabupaten' => ['regency', 'regencies'],
        'kelas' => ['class', 'classes'],
        'kelas-master' => ['class master', 'class masters'],
        'kelas-mk' => ['class course', 'class courses'],
        'khs' => ['grade report', 'grade reports'],
        'krs' => ['study plan', 'study plans'],
        'nilai' => ['grade', 'grades'],
        'setting-nilai' => ['grade weight setting', 'grade weight settings'],
        'prodi-dosen' => ['lecturer study program assignment', 'lecturer study program assignments'],
        'kurikulum-mata-kuliah' => ['curriculum course', 'curriculum courses'],
    ];

    private array $ignoredUriSegments = [
        'api',
        'data-master',
        'akademik',
        'admin',
        'auth',
        'mahasiswa',
    ];

    private array $actionUriSegments = [
        'active',
        'aktif',
        'trashed',
        'restore',
        'force',
        'toggle',
        'login',
        'logout',
        'refresh',
        'masuk',
        'keluar',
        'hari-ini',
        'rekap',
        'change-password',
        'mata-kuliah',
        'generate',
        'close',
        'roster',
        'batch-roll-call',
        'batch',
    ];

    public function handle(Operation $operation, RouteInfo $routeInfo): void
    {
        $route = $routeInfo->route ?? null;

        if (! $route) {
            return;
        }

        $method = strtoupper($routeInfo->method ?: $operation->method ?: 'GET');
        $uri = $this->normalizeUri($route->uri() ?: $operation->path);
        $key = "{$method} {$uri}";

        if (isset($this->descriptions[$key])) {
            $this->applyDescription($operation, $this->descriptions[$key], force: true);

            return;
        }

        $action = $routeInfo->methodName();

        if (! $action) {
            return;
        }

        [$singular, $plural] = $this->resolveEntityNames($uri, $routeInfo->className());
        [$summary, $description] = $this->makeDescription($action, $singular, $plural);

        $this->applyDescription($operation, [
            'summary' => $summary,
            'description' => $description,
        ]);
    }

    private function applyDescription(Operation $operation, array $description, bool $force = false): void
    {
        if ($force || $this->shouldReplaceText($operation->summary, $operation)) {
            $operation->summary($description['summary']);
        }

        if ($force || $this->shouldReplaceText($operation->description, $operation)) {
            $operation->description($description['description']);
        }
    }

    private function shouldReplaceText(?string $text, Operation $operation): bool
    {
        $text = trim((string) $text);

        if ($text === '') {
            return true;
        }

        $operationId = $operation->operationId ?? $operation->getAttribute('operationId', '');
        $operationId = is_string($operationId) ? $operationId : '';

        if ($operationId !== '' && $text === $operationId) {
            return true;
        }

        if (str_contains($text, 'Controller.')) {
            return true;
        }

        if (preg_match('/^[A-Za-z0-9_\\\\]+\\.(index|store|show|update|destroy|active|aktif)$/', $text)) {
            return true;
        }

        return in_array($text, [
            'index',
            'store',
            'show',
            'update',
            'destroy',
            'active',
            'aktif',
        ], true);
    }

    private function normalizeUri(string $uri): string
    {
        return trim(preg_replace('#/+#', '/', $uri), '/');
    }

    private function resolveEntityNames(string $uri, ?string $controller): array
    {
        if ($controller) {
            $controllerKey = Str::of(class_basename($controller))
                ->beforeLast('Controller')
                ->kebab()
                ->toString();

            if (isset($this->entityNames[$controllerKey])) {
                return $this->entityNames[$controllerKey];
            }
        }

        foreach ($this->resourceSegments($uri) as $segment) {
            if (isset($this->entityNames[$segment])) {
                return $this->entityNames[$segment];
            }
        }

        if ($controller) {
            $name = Str::of(class_basename($controller))
                ->beforeLast('Controller')
                ->snake(' ')
                ->lower()
                ->toString();

            return [$name, Str::plural($name)];
        }

        return ['resource', 'resources'];
    }

    private function resourceSegments(string $uri): array
    {
        $segments = array_values(array_filter(explode('/', $uri), function (string $segment) {
            return $segment !== ''
                && ! str_starts_with($segment, '{')
                && ! in_array($segment, $this->ignoredUriSegments, true)
                && ! in_array($segment, $this->actionUriSegments, true);
        }));

        return array_reverse($segments);
    }

    private function makeDescription(string $action, string $singular, string $plural): array
    {
        return match ($action) {
            'index' => [
                "Display all {$plural}",
                "Returns a list of {$plural}.",
            ],
            'store' => [
                "Create a new {$singular}",
                "Creates a new {$singular} record.",
            ],
            'show' => [
                "Display a specific {$singular}",
                "Returns the detail of one {$singular} record by ID.",
            ],
            'update' => [
                "Update a {$singular}",
                "Updates an existing {$singular} record by ID.",
            ],
            'destroy' => [
                "Delete a {$singular}",
                "Deletes a {$singular} record by ID.",
            ],
            'active', 'aktif' => [
                "Display the active {$singular}",
                "Returns the active {$singular} record.",
            ],
            default => [
                Str::headline($action),
                'Performs the '.Str::of($action)->snake(' ')->lower()->toString().' operation.',
            ],
        };
    }
}
