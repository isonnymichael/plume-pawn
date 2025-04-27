export interface LoanType {
    key: React.Key;
    asset: string;
    loanAmount: string;
    interest?: string;
    dueDate: string;
    status: 'Active' | 'Liquidated';
}

export interface LoanInterfaceProps {
  loans: LoanType[];
}