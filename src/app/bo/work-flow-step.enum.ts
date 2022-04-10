export enum WorkFlowStep {

    GetBranches = 1,
    GetLastCommit = 2,
    Fetch = 3,
    SwitchBranch = 4,
    PullBranch = 5,
    BuildProject = 6,
    SendBuildComment = 7,
    TestProject = 8,
    SendTestComment = 9,
    GetHeadBranch = 10,
    Deploy = 11,
    Finished = 12,
    None = 13,
}
