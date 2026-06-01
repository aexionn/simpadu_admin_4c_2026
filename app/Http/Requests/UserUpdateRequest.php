<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UserUpdateRequest extends FormRequest
{
   
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        $userId = $this->route('id_user');

        return [
            'name'      => 'sometimes|string|max:255',
            'email'     => 'sometimes|string|email|max:255|unique:users,email,' . $userId . ',id_user',
            'is_active' => 'sometimes|in:Y,T',
        ];
    }

    public function attributes(): array
    {
        return [
            'name'      => 'Full name',
            'email'     => 'Email address',
            'is_active' => 'Active status (Y = Active, T = Inactive)',
        ];
    }
}
