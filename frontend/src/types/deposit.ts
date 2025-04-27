export type PrepareLiquidityArgs = {
    amount: string;
};

export interface LiquidityPosition {
    depositId: number;
    amount: number;
    apr: string;
    unclaimedReward: string;
    real_amount: string;
}