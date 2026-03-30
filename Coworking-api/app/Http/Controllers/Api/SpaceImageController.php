<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Space;
use App\Models\SpaceImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SpaceImageController extends Controller
{
    public function index(Space $space)
    {
        $images = $space->images()->get()->map(fn($img) => [
            'id'       => $img->id,
            'url'      => $img->url,
            'caption'  => $img->caption,
            'is_cover' => $img->is_cover,
        ]);

        return response()->json(['images' => $images]);
    }

    public function store(Request $request, Space $space)
    {
        if (!auth()->user()->hasRole('admin')) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $request->validate([
            'images'          => 'required|array|max:10',
            'images.*'        => 'image|mimes:jpeg,png,jpg,webp|max:5120',
            'caption'         => 'nullable|string|max:255',
        ]);

        $uploaded = [];

        foreach ($request->file('images') as $file) {
            $path = $file->store("spaces/{$space->id}", 'public');

            // Première image = cover si aucune n'existe
            $isCover = $space->images()->count() === 0;

            $image = SpaceImage::create([
                'space_id' => $space->id,
                'path'     => $path,
                'caption'  => $request->caption,
                'is_cover' => $isCover,
            ]);

            $uploaded[] = [
                'id'       => $image->id,
                'url'      => $image->url,
                'caption'  => $image->caption,
                'is_cover' => $image->is_cover,
            ];
        }

        return response()->json([
            'message' => count($uploaded) . ' photo(s) ajoutée(s)',
            'images'  => $uploaded,
        ], 201);
    }

    public function setCover(Space $space, SpaceImage $image)
    {
        if (!auth()->user()->hasRole('admin')) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        // Retirer cover des autres
        $space->images()->update(['is_cover' => false]);
        $image->update(['is_cover' => true]);

        return response()->json(['message' => 'Photo de couverture mise à jour']);
    }

    public function destroy(Space $space, SpaceImage $image)
    {
        if (!auth()->user()->hasRole('admin')) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        Storage::disk('public')->delete($image->path);
        $image->delete();

        // Si c'était la cover, définir la suivante
        if ($image->is_cover) {
            $next = $space->images()->first();
            if ($next) $next->update(['is_cover' => true]);
        }

        return response()->json(['message' => 'Photo supprimée']);
    }
}
