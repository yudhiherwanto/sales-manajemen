export interface Lead {
  id: string;
  name: string;
  company: string;
  status: 'Prospecting' | 'Qualification' | 'Proposal' | 'Negotiation' | 'Closed Won' | 'Closed Lost';
  potentialAmount: number;
  realizationAmount: number;
  salespersonId: string;
  lastVisitDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface Visit {
  id: string;
  leadId: string;
  salespersonId: string;
  date: string;
  notes: string;
  amountReported?: number;
}

export interface AppUser {
  uid: string;
  name: string;
  email: string;
  role: 'sales' | 'manager';
}
