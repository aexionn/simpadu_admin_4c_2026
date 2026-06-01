<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'id_user'   => 'sometimes|integer|unique:users,id_user',
            'email'     => 'required|string|email|max:255|unique:users,email',
            'name'      => 'required|string|max:255',
            'password'  => 'required|string|min:8',
            'is_active' => 'sometimes|in:Y,T',
            'role'      => 'required'
        ];
    }

    public function attributes(): array
    {
        return [
            'email'     => 'Email address',
            'name'      => 'Full name',
            'is_active' => 'Active status (Y or T)',
            'role'      => 'Role name (must exist in roles table)',
        ];
    }
}
