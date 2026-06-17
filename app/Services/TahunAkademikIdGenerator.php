<?php

namespace App\Services;

use App\Models\TahunAkademik;

/**
 * Generates the next ID_TAHUN_AKADEMIK using a semester-aware sequence.
 *
 * ID format:  PPPPS  (P = "year" prefix, S = semester suffix)
 *
 *   - The last digit (S) cycles 1 → 2 (Ganjil → Genap).
 *   - When S reaches 2, the prefix (all preceding digits) increments by 1
 *     and S resets to 1.
 *
 * Examples: 20251 → 20252 → 20261 → 20262 → 20271 → …
 */
class TahunAkademikIdGenerator
{
    /**
     * The very first ID used when the table is empty.
     */
    public const DEFAULT_START = 20251;

    /**
     * Maximum value the suffix can reach before the prefix increments.
     */
    public const SUFFIX_MAX = 2;

    /**
     * The suffix value to reset to after a carry.
     */
    public const SUFFIX_RESET = 1;

    /**
     * Get the next available ID_TAHUN_AKADEMIK.
     */
    public function next(): int
    {
        $last = TahunAkademik::max('ID_TAHUN_AKADEMIK');

        if ($last === null) {
            return self::DEFAULT_START;
        }

        $id     = (int) $last;
        $suffix = $id % 10;
        $prefix = intdiv($id, 10);

        if ($suffix >= self::SUFFIX_MAX) {
            $prefix += 1;
            $suffix  = self::SUFFIX_RESET;
        } else {
            $suffix += 1;
        }

        return ($prefix * 10) + $suffix;
    }
}
