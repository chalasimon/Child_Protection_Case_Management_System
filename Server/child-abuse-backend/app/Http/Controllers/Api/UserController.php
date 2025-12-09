<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::query();

        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }

        $users = $query->paginate($request->input('per_page', 15));
        return response()->json($users);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required','string'],
            'email' => ['required','email','unique:users,email'],
            'password' => ['required','min:8','confirmed'],
            'role' => ['nullable', Rule::in(['system_admin','director','focal_person'])],
        ]);

        $data['password'] = bcrypt($data['password']);
        $user = User::create($data);

        return response()->json($user, 201);
    }

    public function show($id)
    {
        $user = User::findOrFail($id);
        return response()->json($user);
    }

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);
        $data = $request->validate([
            'name' => ['sometimes','string'],
            'email' => ['sometimes','email', Rule::unique('users','email')->ignore($user->id)],
            'role' => ['nullable', Rule::in(['system_admin','director','focal_person'])],
            'is_active' => ['nullable','boolean'],
        ]);

        $user->update($data);
        return response()->json($user);
    }

    public function destroy($id)
    {
        $user = User::findOrFail($id);
        $user->delete();
        return response()->json(['message' => 'Deleted']);
    }

    public function getRoles()
    {
        return response()->json([
            'roles' => ['system_admin','director','focal_person']
        ]);
    }

    public function getFocalPersons()
    {
        $persons = User::where('role', 'focal_person')->where('is_active', true)->get();
        return response()->json($persons);
    }

    public function activateUser($id)
    {
        $user = User::findOrFail($id);
        $user->is_active = true;
        $user->save();
        return response()->json(['message' => 'Activated', 'user' => $user]);
    }

    public function deactivateUser($id)
    {
        $user = User::findOrFail($id);
        $user->is_active = false;
        $user->save();
        return response()->json(['message' => 'Deactivated', 'user' => $user]);
    }
}
