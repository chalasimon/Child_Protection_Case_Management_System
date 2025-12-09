<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Perpetrator;

class PerpetratorController extends Controller
{
    public function index(Request $request)
    {
        $query = Perpetrator::query();

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function($q) use ($s) {
                $q->where('first_name','like',"%{$s}%")
                  ->orWhere('last_name','like',"%{$s}%")
                  ->orWhere('contact_number','like',"%{$s}%");
            });
        }

        $perpetrators = $query->orderBy('created_at','desc')->paginate($request->input('per_page', 15));

        return response()->json($perpetrators);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'first_name' => ['required','string'],
            'last_name' => ['required','string'],
            'gender' => ['required'],
            'age' => ['nullable','integer'],
            'date_of_birth' => ['nullable','date'],
            'contact_number' => ['nullable','string'],
            'address' => ['nullable','string'],
            'occupation' => ['nullable','string'],
            'relationship_to_victim' => ['nullable','string'],
            'previous_records' => ['nullable','boolean'],
            'description' => ['nullable','string'],
            'additional_info' => ['nullable','array'],
        ]);

        $perp = Perpetrator::create($data);
        return response()->json($perp, 201);
    }

    public function show($id)
    {
        $perp = Perpetrator::with('cases')->findOrFail($id);
        return response()->json($perp);
    }

    public function update(Request $request, $id)
    {
        $perp = Perpetrator::findOrFail($id);
        $data = $request->validate([
            'first_name' => ['sometimes','string'],
            'last_name' => ['sometimes','string'],
            'gender' => ['sometimes'],
            'age' => ['nullable','integer'],
            'date_of_birth' => ['nullable','date'],
            'contact_number' => ['nullable','string'],
            'address' => ['nullable','string'],
            'occupation' => ['nullable','string'],
            'relationship_to_victim' => ['nullable','string'],
            'previous_records' => ['nullable','boolean'],
            'description' => ['nullable','string'],
            'additional_info' => ['nullable','array'],
        ]);
        $perp->update($data);
        return response()->json($perp);
    }

    public function destroy($id)
    {
        $perp = Perpetrator::findOrFail($id);
        $perp->delete();
        return response()->json(['message' => 'Deleted']);
    }

    public function search(Request $request)
    {
        return $this->index($request);
    }
}
