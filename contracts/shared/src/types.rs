#![no_std]
use soroban_sdk::{contracttype, Address, String};

#[derive(Clone, Debug, Eq, PartialEq)]
#[contracttype]
pub enum ProjectStatus {
    Open,
    InProgress,
    Submitted,
    Completed,
    Refunded,
}

#[derive(Clone, Debug)]
#[contracttype]
pub struct Project {
    pub id: u64,
    pub client: Address,
    pub freelancer: Option<Address>,
    pub title: String,
    pub amount: i128,
    pub token: Address,
    pub deadline: u64,
    pub work_ref: Option<String>,
    pub meta_hash: String,
    pub status: ProjectStatus,
}

#[derive(Clone, Debug, Default)]
#[contracttype]
pub struct ReputationScore {
    pub total_projects: u32,
    pub projects_as_client: u32,
    pub projects_as_freelancer: u32,
    pub successful_completions: u32,
    pub success_rate: u32, // percentage
}