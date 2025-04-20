export interface LoanType {
    key: React.Key;
    asset: string;
    loanAmount: string;
    interest?: string;
    dueDate: string;
    status: 'Active' | 'Liquidated';
}
  
export interface LiquidityPosition {
    key: React.Key;
    token: string;
    amount: string;
    apr: string;
}

export interface LoanInterfaceProps {
  loans: LoanType[];
}