export interface Fighter {
    Fighter: string;
    totalRoundsFought: string;
    winsByDecisionSplit: string;
    WinsByDecisionSplit: string;
    WinsByDecisionUnanimous: string;
    WinsByKO: string;
    WinsBySubmission: string;
    WinsByTKODoctorStoppage: string;
    Draws: string;
    Wins: string;
    Stance: string;
    HeightCms: string;
    Losses: string;
    ReachCms: string;
    WeightLbs: string;
    Age: string;
    CurrentWinStreak: string;
    CurrentLoseStreak: string;
    LongestWinStreak: string;
    TotalTitleBouts: string;
    BestRank: string;
    BeenInTitleFight: string;
    Picture: string;
    Nationality: string;
    OctagonDebut: string;
    Id: number;
}

export interface Filter {
    id: number,
    filter_image: string | null,
    filter_text: string,
    filter_no_image_text: string | null,
    filter_fighters: Fighter[];
}

export interface FilterDifficulty {
    easy: Filter[],
    medium: Filter[],
    hard: Filter[],
}
