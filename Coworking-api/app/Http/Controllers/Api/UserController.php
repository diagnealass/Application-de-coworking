<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller
{
    private function checkAdmin()
    {
        if (!Auth::user()->hasRole('admin')) {
            abort(response()->json(['message' => 'Accès non autorisé'], 403));
        }
    }

    public function index()
    {
        $this->checkAdmin();
        $users = User::with('roles')->latest()->get();
        return UserResource::collection($users);
    }

    public function show(User $user)
    {
        $this->checkAdmin();
        return new UserResource($user->load('roles'));
    }

    public function store(Request $request)
    {
        $this->checkAdmin();

        $data = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users',
            'phone'    => 'nullable|string',
            'company'  => 'nullable|string',
            'password' => 'required|min:8',
            'role'     => 'required|in:admin,member',
        ]);

        $user = User::create([
            'name'     => $data['name'],
            'email'    => $data['email'],
            'phone'    => $data['phone'] ?? null,
            'company'  => $data['company'] ?? null,
            'password' => bcrypt($data['password']),
        ]);

        $user->assignRole($data['role']);

        return response()->json([
            'message' => 'Utilisateur créé avec succès',
            'user'    => new UserResource($user->load('roles')),
        ], 201);
    }

    public function update(Request $request, User $user)
    {
        $this->checkAdmin();

        $data = $request->validate([
            'name'    => 'sometimes|string|max:255',
            'email'   => 'sometimes|email|unique:users,email,'.$user->id,
            'phone'   => 'nullable|string',
            'company' => 'nullable|string',
            'role'    => 'sometimes|in:admin,member',
        ]);

        if (isset($data['role'])) {
            $user->syncRoles([$data['role']]);
            unset($data['role']);
        }

        $user->update($data);

        return response()->json([
            'message' => 'Utilisateur mis à jour',
            'user'    => new UserResource($user->load('roles')),
        ]);
    }

    public function destroy(User $user)
    {
        $this->checkAdmin();

        if ($user->id === Auth::id()) {
            return response()->json([
                'message' => 'Vous ne pouvez pas supprimer votre propre compte',
            ], 403);
        }

        $user->delete();
        return response()->json(['message' => 'Utilisateur supprimé']);
    }
}
