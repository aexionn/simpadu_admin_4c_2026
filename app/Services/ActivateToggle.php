<?php

namespace App\Services;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class ActivateToggle
{
    /**
     * Atomically activate $model and deactivate all siblings on the same column.
     */
    public function activateExclusive(Model $model, string $column, string $activeValue = 'Y', string $inactiveValue = 'T'): void
    {
        DB::transaction(function () use ($model, $column, $activeValue, $inactiveValue) {
            $model->newQuery()
                ->where($column, $activeValue)
                ->where($model->getKeyName(), '!=', $model->getKey())
                ->update([$column => $inactiveValue]);

            $model->{$column} = $activeValue;
            $model->save();
        });
    }
}