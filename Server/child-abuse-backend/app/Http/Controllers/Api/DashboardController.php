<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\AbuseCase;

class DashboardController extends Controller
{
    public function getStats()
    {
        $totalCases = AbuseCase::count();
        $openCases = AbuseCase::whereNotIn('status', ['resolved','closed'])->count();
        $closedCases = AbuseCase::whereIn('status', ['resolved','closed'])->count();

        $byType = AbuseCase::selectRaw('abuse_type, count(*) as total')->groupBy('abuse_type')->get();

        return response()->json([
            'total_cases' => $totalCases,
            'open_cases' => $openCases,
            'closed_cases' => $closedCases,
            'by_type' => $byType,
        ]);
    }

    public function getYearlyStats(Request $request)
    {
        $year = $request->input('year', now()->year);
        $counts = AbuseCase::whereYear('created_at', $year)
            ->selectRaw('MONTH(created_at) as month, count(*) as total')
            ->groupByRaw('MONTH(created_at)')
            ->orderByRaw('MONTH(created_at)')
            ->get();

        return response()->json(['year' => $year, 'monthly_counts' => $counts]);
    }

    public function getMonthlyStats(Request $request)
    {
        $year = $request->input('year', now()->year);
        $month = $request->input('month', now()->month);
        $counts = AbuseCase::whereYear('created_at', $year)
            ->whereMonth('created_at', $month)
            ->count();

        return response()->json(['year' => $year, 'month' => $month, 'count' => $counts]);
    }

    public function getAbuseTypeStats()
    {
        $byType = AbuseCase::selectRaw('abuse_type, count(*) as total')->groupBy('abuse_type')->get();
        return response()->json($byType);
    }

    public function getRecentCases()
    {
        $cases = AbuseCase::with('assignedTo:id,name')->orderBy('created_at','desc')->limit(10)->get();
        return response()->json($cases);
    }
}
