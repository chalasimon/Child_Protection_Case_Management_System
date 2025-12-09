<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Victim;

class VictimController extends Controller
{
    public function index(Request $request)
    {
        $query = Victim::query()->with('case:id,case_number,case_title');

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function($q) use ($s) {
                $q->where('first_name','like',"%{$s}%")
                  ->orWhere('last_name','like',"%{$s}%")
                  ->orWhere('contact_number','like',"%{$s}%");
            });
        }

        $victims = $query->orderBy('created_at','desc')->paginate($request->input('per_page', 15));
        return response()->json($victims);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'case_id' => ['required','exists:abuse_cases,id'],
            'first_name' => ['required','string'],
            'last_name' => ['required','string'],
            'gender' => ['required'],
            'age' => ['nullable','integer'],
            'date_of_birth' => ['nullable','date'],
            'contact_number' => ['nullable','string'],
            'address' => ['nullable','string'],
            'relationship_to_perpetrator' => ['nullable','string'],
            'description' => ['nullable','string'],
            'additional_info' => ['nullable','array'],
        ]);

        $victim = Victim::create($data);

        return response()->json($victim, 201);
    }

    public function show($id)
    {
        $victim = Victim::with('case')->findOrFail($id);
        return response()->json($victim);
    }

    public function update(Request $request, $id)
    {
        $victim = Victim::findOrFail($id);
        $data = $request->validate([
            'first_name' => ['sometimes','string'],
            'last_name' => ['sometimes','string'],
            'gender' => ['sometimes'],
            'age' => ['nullable','integer'],
            'date_of_birth' => ['nullable','date'],
            'contact_number' => ['nullable','string'],
            'address' => ['nullable','string'],
            'relationship_to_perpetrator' => ['nullable','string'],
            'description' => ['nullable','string'],
            'additional_info' => ['nullable','array'],
        ]);
        $victim->update($data);
        return response()->json($victim);
    }

    public function destroy($id)
    {
        $victim = Victim::findOrFail($id);
        $victim->delete();
        return response()->json(['message' => 'Deleted']);
    }

    public function search(Request $request)
    {
        return $this->index($request);
    }
}
