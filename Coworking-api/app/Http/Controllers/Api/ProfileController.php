<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class ProfileController extends Controller
{
    public function show()
    {
        return response()->json([
            'user' => new UserResource(Auth::user()->load('roles')),
        ]);
    }

    public function update(Request $request)
    {
        $user = Auth::user();

        $data = $request->validate([
            'name'    => 'required|string|max:255',
            'email'   => 'required|email|unique:users,email,'.$user->id,
            'phone'   => 'nullable|string|max:20',
            'company' => 'nullable|string|max:255',
        ]);

        $user->update($data);

        return response()->json([
            'message' => 'Profil mis à jour avec succès',
            'user'    => new UserResource($user->load('roles')),
        ]);
    }

    public function updatePassword(Request $request)
    {
        $user = Auth::user();

        $request->validate([
            'current_password' => 'required',
            'password'         => 'required|min:8|confirmed',
        ]);

        // Vérifier l'ancien mot de passe
        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'message' => 'Le mot de passe actuel est incorrect',
                'errors'  => [
                    'current_password' => ['Le mot de passe actuel est incorrect'],
                ],
            ], 422);
        }

        $user->update([
            'password' => bcrypt($request->password),
        ]);

        return response()->json([
            'message' => 'Mot de passe modifié avec succès',
        ]);
    }
}
