// src/hooks/useCases.js
import { useState, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';

/**
 * Custom hook for managing abuse cases
 */
export const useCases = () => {
  // Store cases in localStorage
  const { 
    value: cases, 
    setValue: setCases,
    update: updateCase,
    remove: removeCase,
    push: addCase
  } = useLocalStorageArray('abuse_cases', []);

  // Current case being viewed/edited
  const [currentCase, setCurrentCase] = useState(null);
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  /**
   * Create a new case
   */
  const createCase = useCallback((caseData) => {
    const newCase = {
      id: `CASE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...caseData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'Reported',
      caseNumber: `C${cases.length + 1}`.padStart(6, '0')
    };
    
    addCase(newCase);
    return newCase;
  }, [addCase, cases.length]);

  /**
   * Update an existing case
   */
  const updateCaseById = useCallback((id, updates) => {
    const index = cases.findIndex(c => c.id === id);
    if (index !== -1) {
      updateCase(index, {
        ...cases[index],
        ...updates,
        updatedAt: new Date().toISOString()
      });
    }
  }, [cases, updateCase]);

  /**
   * Delete a case
   */
  const deleteCase = useCallback((id) => {
    const index = cases.findIndex(c => c.id === id);
    if (index !== -1) {
      removeCase(index);
    }
  }, [cases, removeCase]);

  /**
   * Search cases
   */
  const searchCases = useCallback((term) => {
    setSearchTerm(term);
    
    if (!term.trim()) {
      setSearchResults([]);
      return [];
    }
    
    const results = cases.filter(caseItem => {
      const searchLower = term.toLowerCase();
      return (
        caseItem.childName?.toLowerCase().includes(searchLower) ||
        caseItem.perpetratorName?.toLowerCase().includes(searchLower) ||
        caseItem.caseNumber?.toLowerCase().includes(searchLower) ||
        caseItem.status?.toLowerCase().includes(searchLower) ||
        caseItem.id?.toLowerCase().includes(searchLower)
      );
    });
    
    setSearchResults(results);
    return results;
  }, [cases]);

  /**
   * Get case statistics
   */
  const getCaseStats = useCallback(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    const stats = {
      total: cases.length,
      byYear: {},
      byMonth: {},
      byType: {},
      byStatus: {}
    };
    
    cases.forEach(caseItem => {
      const date = new Date(caseItem.createdAt);
      const year = date.getFullYear();
      const month = date.getMonth();
      const abuseType = caseItem.abuseType || 'Unknown';
      const status = caseItem.status || 'Unknown';
      
      // Count by year
      stats.byYear[year] = (stats.byYear[year] || 0) + 1;
      
      // Count by month for current year
      if (year === currentYear) {
        stats.byMonth[month] = (stats.byMonth[month] || 0) + 1;
      }
      
      // Count by abuse type
      stats.byType[abuseType] = (stats.byType[abuseType] || 0) + 1;
      
      // Count by status
      stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;
    });
    
    return stats;
  }, [cases]);

  /**
   * Get cases by status
   */
  const getCasesByStatus = useCallback((status) => {
    return cases.filter(caseItem => caseItem.status === status);
  }, [cases]);

  /**
   * Get recent cases
   */
  const getRecentCases = useCallback((limit = 10) => {
    return [...cases]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);
  }, [cases]);

  return {
    // Data
    cases,
    currentCase,
    searchTerm,
    searchResults,
    
    // Actions
    createCase,
    updateCase: updateCaseById,
    deleteCase,
    setCurrentCase,
    
    // Search
    searchCases,
    clearSearch: () => {
      setSearchTerm('');
      setSearchResults([]);
    },
    
    // Statistics
    getCaseStats,
    getCasesByStatus,
    getRecentCases,
    
    // Helper
    getCaseById: useCallback((id) => 
      cases.find(c => c.id === id), [cases]
    ),
  };
};

export default useCases;