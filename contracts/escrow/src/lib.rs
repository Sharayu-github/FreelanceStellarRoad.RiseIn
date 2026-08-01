#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, Address, Env, String, Vec,
    log, symbol_short, token, InvokeContract
};
use shared::types::{ProjectStatus, Project};

#[derive(Clone)]
#[contracttype]
pub struct DataKey {
    pub project_id: u64,
}

#[contracttype]
pub enum StorageKey {
    Project(u64),
    NextProjectId,
    Admin,
    ReputationContract,
}

#[contract]
pub struct EscrowContract;

#[contractimpl]
impl EscrowContract {
    /// Initialize the contract with admin and reputation contract addresses
    pub fn initialize(
        env: Env,
        admin: Address,
        reputation_contract: Address,
    ) -> Result<(), &'static str> {
        if env.storage().instance().has(&StorageKey::Admin) {
            return Err("Already initialized");
        }

        env.storage().instance().set(&StorageKey::Admin, &admin);
        env.storage().instance().set(&StorageKey::ReputationContract, &reputation_contract);
        env.storage().instance().set(&StorageKey::NextProjectId, &1u64);

        log!(&env, "Escrow contract initialized");
        Ok(())
    }

    /// Create a new project with escrow deposit
    pub fn create_project(
        env: Env,
        client: Address,
        title: String,
        meta_hash: String,
        amount: i128,
        token: Address,
        deadline: u64,
    ) -> Result<u64, &'static str> {
        client.require_auth();

        if amount <= 0 {
            return Err("Amount must be positive");
        }

        let current_ledger = env.ledger().sequence();
        if deadline <= current_ledger {
            return Err("Deadline must be in the future");
        }

        // Get next project ID
        let project_id: u64 = env.storage().instance()
            .get(&StorageKey::NextProjectId)
            .unwrap_or(1);

        // Transfer tokens to contract
        let token_client = token::Client::new(&env, &token);
        token_client.transfer(&client, &env.current_contract_address(), &amount);

        // Create project
        let project = Project {
            id: project_id,
            client: client.clone(),
            freelancer: None,
            title: title.clone(),
            amount,
            token: token.clone(),
            deadline,
            work_ref: None,
            meta_hash: meta_hash.clone(),
            status: ProjectStatus::Open,
        };

        // Store project
        env.storage().persistent().set(&StorageKey::Project(project_id), &project);
        env.storage().instance().set(&StorageKey::NextProjectId, &(project_id + 1));

        // Emit event
        env.events().publish(
            (symbol_short!("project"), symbol_short!("created")),
            (project_id, client, title, amount, deadline)
        );

        log!(&env, "Project created: {}", project_id);
        Ok(project_id)
    }

    /// Accept an open project
    pub fn accept_project(
        env: Env,
        project_id: u64,
        freelancer: Address,
    ) -> Result<(), &'static str> {
        freelancer.require_auth();

        let mut project: Project = env.storage().persistent()
            .get(&StorageKey::Project(project_id))
            .ok_or("Project not found")?;

        if project.status != ProjectStatus::Open {
            return Err("Project is not open");
        }

        // Update project
        project.freelancer = Some(freelancer.clone());
        project.status = ProjectStatus::InProgress;

        env.storage().persistent().set(&StorageKey::Project(project_id), &project);

        // Emit event
        env.events().publish(
            (symbol_short!("project"), symbol_short!("accepted")),
            (project_id, freelancer.clone())
        );

        log!(&env, "Project accepted: {} by {}", project_id, freelancer);
        Ok(())
    }

    /// Submit work for review
    pub fn submit_work(
        env: Env,
        project_id: u64,
        freelancer: Address,
        work_ref: String,
    ) -> Result<(), &'static str> {
        freelancer.require_auth();

        let mut project: Project = env.storage().persistent()
            .get(&StorageKey::Project(project_id))
            .ok_or("Project not found")?;

        if project.status != ProjectStatus::InProgress {
            return Err("Project is not in progress");
        }

        if project.freelancer.as_ref() != Some(&freelancer) {
            return Err("Not the assigned freelancer");
        }

        // Update project
        project.work_ref = Some(work_ref.clone());
        project.status = ProjectStatus::Submitted;

        env.storage().persistent().set(&StorageKey::Project(project_id), &project);

        // Emit event
        env.events().publish(
            (symbol_short!("work"), symbol_short!("submitted")),
            (project_id, freelancer, work_ref)
        );

        log!(&env, "Work submitted for project: {}", project_id);
        Ok(())
    }

    /// Approve work and release funds (with cross-contract reputation update)
    pub fn approve_and_release(
        env: Env,
        project_id: u64,
        client: Address,
    ) -> Result<(), &'static str> {
        client.require_auth();

        let mut project: Project = env.storage().persistent()
            .get(&StorageKey::Project(project_id))
            .ok_or("Project not found")?;

        if project.client != client {
            return Err("Not the project client");
        }

        if project.status != ProjectStatus::Submitted {
            return Err("Project work not submitted");
        }

        let freelancer = project.freelancer.as_ref()
            .ok_or("No freelancer assigned")?;

        // Update reputation via cross-contract call BEFORE releasing funds
        let reputation_contract: Address = env.storage().instance()
            .get(&StorageKey::ReputationContract)
            .ok_or("Reputation contract not set")?;

        env.invoke_contract::<()>(
            &reputation_contract,
            &symbol_short!("record"),
            Vec::from_array(&env, [
                client.clone().into_val(&env),
                freelancer.clone().into_val(&env),
                project_id.into_val(&env),
            ])
        );

        // Release funds to freelancer
        let token_client = token::Client::new(&env, &project.token);
        token_client.transfer(
            &env.current_contract_address(),
            freelancer,
            &project.amount
        );

        // Update project status
        project.status = ProjectStatus::Completed;
        env.storage().persistent().set(&StorageKey::Project(project_id), &project);

        // Emit events
        env.events().publish(
            (symbol_short!("funds"), symbol_short!("released")),
            (project_id, freelancer.clone(), project.amount)
        );
        
        env.events().publish(
            (symbol_short!("project"), symbol_short!("completed")),
            (project_id, client, freelancer.clone())
        );

        log!(&env, "Project completed and funds released: {}", project_id);
        Ok(())
    }

    /// Refund client after deadline (if work not submitted)
    pub fn refund(
        env: Env,
        project_id: u64,
        client: Address,
    ) -> Result<(), &'static str> {
        client.require_auth();

        let mut project: Project = env.storage().persistent()
            .get(&StorageKey::Project(project_id))
            .ok_or("Project not found")?;

        if project.client != client {
            return Err("Not the project client");
        }

        if project.status == ProjectStatus::Completed || project.status == ProjectStatus::Refunded {
            return Err("Project already finalized");
        }

        let current_ledger = env.ledger().sequence();
        if current_ledger <= project.deadline {
            return Err("Deadline has not passed");
        }

        // Refund to client
        let token_client = token::Client::new(&env, &project.token);
        token_client.transfer(
            &env.current_contract_address(),
            &client,
            &project.amount
        );

        // Update project status
        project.status = ProjectStatus::Refunded;
        env.storage().persistent().set(&StorageKey::Project(project_id), &project);

        // Emit event
        env.events().publish(
            (symbol_short!("project"), symbol_short!("refunded")),
            (project_id, client, project.amount)
        );

        log!(&env, "Project refunded: {}", project_id);
        Ok(())
    }

    /// Get project details
    pub fn get_project(env: Env, project_id: u64) -> Option<Project> {
        env.storage().persistent().get(&StorageKey::Project(project_id))
    }

    /// Get projects by client
    pub fn get_client_projects(env: Env, client: Address) -> Vec<u64> {
        let mut projects = Vec::new(&env);
        let max_id: u64 = env.storage().instance()
            .get(&StorageKey::NextProjectId)
            .unwrap_or(1);

        for id in 1..max_id {
            if let Some(project) = env.storage().persistent().get::<_, Project>(&StorageKey::Project(id)) {
                if project.client == client {
                    projects.push_back(id);
                }
            }
        }

        projects
    }

    /// Get projects by freelancer
    pub fn get_freelancer_projects(env: Env, freelancer: Address) -> Vec<u64> {
        let mut projects = Vec::new(&env);
        let max_id: u64 = env.storage().instance()
            .get(&StorageKey::NextProjectId)
            .unwrap_or(1);

        for id in 1..max_id {
            if let Some(project) = env.storage().persistent().get::<_, Project>(&StorageKey::Project(id)) {
                if let Some(ref assigned_freelancer) = project.freelancer {
                    if *assigned_freelancer == freelancer {
                        projects.push_back(id);
                    }
                }
            }
        }

        projects
    }

    /// Get all open projects
    pub fn get_open_projects(env: Env) -> Vec<u64> {
        let mut projects = Vec::new(&env);
        let max_id: u64 = env.storage().instance()
            .get(&StorageKey::NextProjectId)
            .unwrap_or(1);

        for id in 1..max_id {
            if let Some(project) = env.storage().persistent().get::<_, Project>(&StorageKey::Project(id)) {
                if project.status == ProjectStatus::Open {
                    projects.push_back(id);
                }
            }
        }

        projects
    }
}