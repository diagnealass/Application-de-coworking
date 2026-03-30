<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $data = $request->validate([
            'name'                  => 'required|string|max:255',
            'email'                 => 'required|email|unique:users',
            'phone'                 => 'nullable|string',
            'company'               => 'nullable|string',
            'password'              => 'required|min:8|confirmed',
        ]);

        $user = User::create([
            ...$data,
            'password' => bcrypt($data['password']),
        ]);
        $user->assignRole('member');

        return response()->json([
            'message' => 'Compte créé avec succès',
            'user'    => new UserResource($user->load('roles')),
        ], 201);
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        if (!Auth::attempt($credentials)) {
            return response()->json([
                'message' => 'Email ou mot de passe incorrect',
            ], 401);
        }

        $request->session()->regenerate();

        return response()->json([
            'message' => 'Connecté avec succès',
            'user'    => new UserResource(Auth::user()->load('roles')),
        ]);
    }

    public function logout(Request $request)
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['message' => 'Déconnecté avec succès']);
    }

    public function me(Request $request)
    {
        return response()->json([
            'user' => new UserResource($request->user()->load('roles')),
        ]);
    }
}
