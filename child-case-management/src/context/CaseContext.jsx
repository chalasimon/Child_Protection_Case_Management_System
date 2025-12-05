// src/context/CaseContext.jsx
import React, { createContext, useCallback } from 'react';
import { useCases } from '../hooks/useCases';

// Create Case Context
export const CaseContext = createContext(null);

export const CaseProvider = ({ children }) => {
  const caseHook = useCases();

  // Add additional context-specific functionality
  const assignCase = useCallback((caseId, assigneeId) => {
    return caseHook.updateCase(caseId, {
      assignedTo: assigneeId,
      assignedAt: new Date().toISOString(),
      status: 'Assigned'
    });
  }, [caseHook]);

  const closeCase = useCallback((caseId, closureData) => {
    return caseHook.updateCase(caseId, {
      ...closureData,
      closedAt: new Date().toISOString(),
      status: 'Closed'
    });
  }, [caseHook]);

  const escalateCase = useCallback((caseId, reason) => {
    return caseHook.updateCase(caseId, {
      escalated: true,
      escalationReason: reason,
      escalatedAt: new Date().toISOString(),
      status: 'Escalated'
    });
  }, [caseHook]);

  // Get dashboard statistics
  const getDashboardStats = useCallback(() => {
    const stats = caseHook.getCaseStats();
    
    return {
      totalCases: stats.total,
      casesThisYear: stats.byYear[new Date().getFullYear()] || 0,
      casesThisMonth: stats.byMonth[new Date().getMonth()] || 0,
      byType: stats.byType,
      byStatus: stats.byStatus
    };
  }, [caseHook]);

  const contextValue = {
    ...caseHook,
    assignCase,
    closeCase,
    escalateCase,
    getDashboardStats
  };

  return (
    <CaseContext.Provider value={contextValue}>
      {children}
    </CaseContext.Provider>
  );
};

export default CaseProvider;