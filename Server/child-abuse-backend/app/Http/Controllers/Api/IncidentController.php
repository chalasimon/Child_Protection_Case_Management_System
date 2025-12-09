<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Incident;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class IncidentController extends Controller
{
    //
    // ==============================
    //  LIST INCIDENTS
    // ==============================
    //
    public function index()
    {
        return response()->json(Incident::all());
    }

    //
    // ==============================
    //  SHOW INCIDENT
    // ==============================
    //
    public function show($id)
    {
        $incident = Incident::find($id);

        if (!$incident) {
            return response()->json(['message' => 'Incident not found'], 404);
        }

        return response()->json($incident);
    }

    //
    // ==============================
    //  CREATE INCIDENT (WITH FILES)
    // ==============================
    //
    public function store(Request $request)
    {
        $validated = $request->validate([
            'case_id' => 'required|exists:abuse_cases,id',
            'report_datetime' => 'required|date',
            'incident_datetime' => 'required|date',
            'incident_end_datetime' => 'nullable|date',
            'location' => 'required|string',
            'location_type' => [
                'required',
                Rule::in(['home', 'school', 'online', 'public_place', 'other'])
            ],
            'abuse_type' => [
                'required',
                Rule::in(['sexual_abuse', 'physical_abuse', 'emotional_abuse', 'neglect', 'exploitation', 'other'])
            ],
            'detailed_description' => 'required|string',
            'prior_reports_count' => 'integer|min:0',
            'evidence_files.*' => 'file|max:10240', // 10MB
        ]);

        $incident = Incident::create($validated);

        // ============= SAVE FILES =============
        $uploadedFiles = [];
        if ($request->hasFile('evidence_files')) {
            foreach ($request->file('evidence_files') as $file) {
                $filename = time() . "_" . $file->getClientOriginalName();
                $path = $file->storeAs("incidents/{$incident->id}", $filename);
                $uploadedFiles[] = $filename;
            }
        }

        $incident->evidence_files = $uploadedFiles;
        $incident->save();

        return response()->json($incident, 201);
    }

    //
    // ==============================
    //  UPDATE INCIDENT (NO FILES)
    //  File uploads use separate endpoint
    // ==============================
    //
    public function update(Request $request, $id)
    {
        $incident = Incident::find($id);
        if (!$incident) return response()->json(['message' => 'Incident not found'], 404);

        $validated = $request->validate([
            'case_id' => 'nullable|exists:abuse_cases,id',
            'report_datetime' => 'nullable|date',
            'incident_datetime' => 'nullable|date',
            'incident_end_datetime' => 'nullable|date',
            'location' => 'nullable|string',
            'location_type' => Rule::in(['home', 'school', 'online', 'public_place', 'other']),
            'abuse_type' => Rule::in(['sexual_abuse', 'physical_abuse', 'emotional_abuse', 'neglect', 'exploitation', 'other']),
            'detailed_description' => 'nullable|string',
            'prior_reports_count' => 'nullable|integer|min:0',
        ]);

        $incident->update($validated);

        return response()->json($incident);
    }


    // =====================================================
    //  ATTACHMENT API — Upload Files to Existing Incident
    // =====================================================
    public function uploadAttachments(Request $request, $id)
    {
        $incident = Incident::find($id);
        if (!$incident) {
            return response()->json(['message' => 'Incident not found'], 404);
        }

        $request->validate([
            'evidence_files.*' => 'required|file|max:10240',
        ]);

        $uploaded = [];
        $existing = $incident->evidence_files ?? [];

        foreach ($request->file('evidence_files') as $file) {
            $filename = time() . "_" . $file->getClientOriginalName();
            $file->storeAs("incidents/{$id}", $filename);
            $uploaded[] = $filename;
        }

        $incident->evidence_files = array_merge($existing, $uploaded);
        $incident->save();

        return response()->json([
            'message' => 'Files uploaded successfully',
            'uploaded' => $uploaded,
        ]);
    }

    // =====================================================
    //  REMOVE FILE FROM INCIDENT
    // =====================================================
    public function removeAttachment(Request $request, $id)
    {
        $incident = Incident::find($id);
        if (!$incident) return response()->json(['message' => 'Incident not found'], 404);

        $request->validate(['filename' => 'required|string']);

        $filename = $request->filename;

        // Remove from array
        $incident->evidence_files = array_values(
            array_filter($incident->evidence_files, fn($f) => $f !== $filename)
        );
        $incident->save();

        // Delete physical file
        $path = "incidents/{$id}/{$filename}";
        if (Storage::exists($path)) {
            Storage::delete($path);
        }

        return response()->json(['message' => 'File removed']);
    }

    // =====================================================
    //  DOWNLOAD ATTACHMENT
    // =====================================================
    public function downloadAttachment(Request $request, $id)
    {
        $request->validate(['filename' => 'required|string']);

        $filename = $request->filename;
        $path = "incidents/{$id}/{$filename}";

        if (!Storage::exists($path)) {
            return response()->json(['message' => 'File not found'], 404);
        }

        return Storage::download($path);
    }



    //
    // ==============================
    //  DELETE INCIDENT
    // ==============================
    //
    public function destroy($id)
    {
        $incident = Incident::find($id);

        if (!$incident) {
            return response()->json(['message' => 'Incident not found'], 404);
        }

        // Delete folder containing evidence files
        Storage::deleteDirectory("incidents/{$id}");

        $incident->delete();

        return response()->json(['message' => 'Incident deleted']);
    }
}
