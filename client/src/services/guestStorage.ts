// Guest storage service using sessionStorage
// Data is lost when the tab is closed

class GuestStorageService {
  private readonly KEYS = {
    MICROPLASTIC_ENTRIES: 'guestMicroplasticEntries',
    PFA_ENTRIES: 'guestPfaEntries',
    USER_PROFILE: 'guestUserProfile',
  };

  // Microplastic entries
  getMicroplasticEntries(): any[] {
    const data = sessionStorage.getItem(this.KEYS.MICROPLASTIC_ENTRIES);
    return data ? JSON.parse(data) : [];
  }

  saveMicroplasticEntry(entry: any): void {
    const entries = this.getMicroplasticEntries();
    entries.push({
      ...entry,
      id: `guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    });
    sessionStorage.setItem(this.KEYS.MICROPLASTIC_ENTRIES, JSON.stringify(entries));
  }

  // PFA entries
  getPfaEntries(): any[] {
    const data = sessionStorage.getItem(this.KEYS.PFA_ENTRIES);
    return data ? JSON.parse(data) : [];
  }

  savePfaEntry(entry: any): void {
    const entries = this.getPfaEntries();
    entries.push({
      ...entry,
      id: `guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    });
    sessionStorage.setItem(this.KEYS.PFA_ENTRIES, JSON.stringify(entries));
  }

  // User profile
  getUserProfile(): any | null {
    const data = sessionStorage.getItem(this.KEYS.USER_PROFILE);
    return data ? JSON.parse(data) : null;
  }

  saveUserProfile(profile: any): void {
    sessionStorage.setItem(this.KEYS.USER_PROFILE, JSON.stringify({
      ...profile,
      id: `guest-profile`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
  }

  // Dashboard stats for guest
  getDashboardStats(): any {
    const entries = this.getMicroplasticEntries();
    
    if (entries.length === 0) {
      return {
        currentRiskLevel: "No Data",
        currentParticleCount: 0,
        weeklyIntake: 0,
        monthlyAverage: 0,
        dataCompleteness: 0,
        weeklyChange: 0,
        totalEntries: 0,
      };
    }

    const latest = entries[entries.length - 1];
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const lastMonthEntries = entries.filter(entry => 
      new Date(entry.createdAt) >= thirtyDaysAgo
    );
    
    const monthlyAverage = lastMonthEntries.length > 0
      ? lastMonthEntries.reduce((sum, entry) => sum + entry.totalParticles, 0) / lastMonthEntries.length
      : 0;

    return {
      currentRiskLevel: latest.riskLevel || "No Data",
      currentParticleCount: latest.totalParticles || 0,
      weeklyIntake: latest.totalParticles || 0,
      monthlyAverage: Math.round(monthlyAverage * 100) / 100,
      dataCompleteness: Math.min(100, (entries.length / 4) * 100),
      weeklyChange: 0,
      totalEntries: entries.length,
    };
  }

  getPfaDashboardStats(): any {
    const entries = this.getPfaEntries();
    
    if (entries.length === 0) {
      return {
        currentRiskLevel: "No Data",
        currentPfaCount: 0,
        weeklyIntake: 0,
        monthlyAverage: 0,
        dataCompleteness: 0,
        weeklyChange: 0,
        totalEntries: 0,
      };
    }

    const latest = entries[entries.length - 1];
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const lastMonthEntries = entries.filter(entry => 
      new Date(entry.createdAt) >= thirtyDaysAgo
    );
    
    const monthlyAverage = lastMonthEntries.length > 0
      ? lastMonthEntries.reduce((sum, entry) => sum + entry.totalPfas, 0) / lastMonthEntries.length
      : 0;

    return {
      currentRiskLevel: latest.riskLevel || "No Data",
      currentPfaCount: latest.totalPfas || 0,
      weeklyIntake: latest.totalPfas || 0,
      monthlyAverage: Math.round(monthlyAverage * 1000) / 1000,
      dataCompleteness: Math.min(100, (entries.length / 4) * 100),
      weeklyChange: 0,
      totalEntries: entries.length,
    };
  }

  // Check if guest has data
  hasData(): boolean {
    return this.getMicroplasticEntries().length > 0 || 
           this.getPfaEntries().length > 0 || 
           this.getUserProfile() !== null;
  }

  // Clear all guest data
  clearAll(): void {
    sessionStorage.removeItem(this.KEYS.MICROPLASTIC_ENTRIES);
    sessionStorage.removeItem(this.KEYS.PFA_ENTRIES);
    sessionStorage.removeItem(this.KEYS.USER_PROFILE);
  }
}

export const guestStorage = new GuestStorageService();
