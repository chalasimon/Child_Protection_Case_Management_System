<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\AbuseCase;

class ReportController extends Controller
{
    public function generateReport(Request $request)
    {
        $start = $request->input('start_date', config('app.report_default_start_date', now()->subYear()->toDateString()));
        $end = $request->input('end_date', config('app.report_default_end_date', now()->toDateString()));

        $cases = AbuseCase::whereDate('created_at', '>=', $start)
            ->whereDate('created_at', '<=', $end)
            ->with(['victims','perpetrators'])
            ->get();

        $summary = [
            'total_cases' => $cases->count(),
            'by_type' => $cases->groupBy('abuse_type')->map->count(),
            'by_status' => $cases->groupBy('status')->map->count(),
        ];

        return response()->json(['summary' => $summary, 'cases' => $cases]);
    }
}
