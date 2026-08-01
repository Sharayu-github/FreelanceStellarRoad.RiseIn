#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, Address, Env, Map,
    log, symbol_short
};
use shared::types::ReputationScore;

#[contracttype]
pub enum StorageKey {
    Reputation(Address),
    EscrowContract,
    Admin,
}

#[contract]
pub struct ReputationContract;

#[contractimpl]
impl ReputationContract {
    /// Initialize the contract with escrow contract address (only caller that can write)
    pub fn initialize(
        env: Env,
        admin: Address,
        escrow_contract: Address,
    ) -> Result<(), &'static str> {
        if env.storage().instance().has(&StorageKey::Admin) {
            return Err("Already initialized");
        }

        env.storage().instance().set(&StorageKey::Admin, &admin);
        env.storage().instance().set(&StorageKey::EscrowContract, &escrow_contract);

        log!(&env, "Reputation contract initialized");
        Ok(())
    }

    /// Record completion (only callable by escrow contract)
    pub fn record_completion(
        env: Env,
        client: Address,
        freelancer: Address,
        project_id: u64,
    ) -> Result<(), &'static str> {
        // Verify caller is the authorized escrow contract
        let escrow_contract: Address = env.storage().instance()
            .get(&StorageKey::EscrowContract)
            .ok_or("Escrow contract not set")?;

        if env.invoker() != escrow_contract {
            return Err("Unauthorized: only escrow contract can record completions");
        }

        // Update client reputation (as employer)
        let mut client_score: ReputationScore = env.storage().persistent()
            .get(&StorageKey::Reputation(client.clone()))
            .unwrap_or_default();
        
        client_score.projects_as_client += 1;
        client_score.total_projects += 1;
        
        env.storage().persistent().set(&StorageKey::Reputation(client.clone()), &client_score);

        // Update freelancer reputation
        let mut freelancer_score: ReputationScore = env.storage().persistent()
            .get(&StorageKey::Reputation(freelancer.clone()))
            .unwrap_or_default();
        
        freelancer_score.projects_as_freelancer += 1;
        freelancer_score.total_projects += 1;
        freelancer_score.successful_completions += 1;
        
        // Calculate success rate
        if freelancer_score.projects_as_freelancer > 0 {
            freelancer_score.success_rate = (freelancer_score.successful_completions * 100) / freelancer_score.projects_as_freelancer;
        }

        env.storage().persistent().set(&StorageKey::Reputation(freelancer.clone()), &freelancer_score);

        // Emit event
        env.events().publish(
            (symbol_short!("rep"), symbol_short!("updated")),
            (client.clone(), freelancer.clone(), project_id)
        );

        log!(&env, "Reputation updated for project: {}", project_id);
        Ok(())
    }

    /// Get reputation score for an address
    pub fn get_score(env: Env, user: Address) -> ReputationScore {
        env.storage().persistent()
            .get(&StorageKey::Reputation(user))
            .unwrap_or_default()
    }

    /// Get top freelancers by success rate
    pub fn get_top_freelancers(env: Env, limit: u32) -> Map<Address, ReputationScore> {
        let mut top_freelancers = Map::new(&env);
        
        // In a real implementation, you'd maintain an index of all users
        // For now, this is a placeholder that would need to be enhanced
        // with proper indexing mechanisms
        
        top_freelancers
    }

    /// Update the authorized escrow contract (admin only)
    pub fn update_escrow_contract(
        env: Env,
        admin: Address,
        new_escrow_contract: Address,
    ) -> Result<(), &'static str> {
        admin.require_auth();

        let stored_admin: Address = env.storage().instance()
            .get(&StorageKey::Admin)
            .ok_or("Admin not set")?;

        if admin != stored_admin {
            return Err("Unauthorized: not admin");
        }

        env.storage().instance().set(&StorageKey::EscrowContract, &new_escrow_contract);

        log!(&env, "Escrow contract updated");
        Ok(())
    }

    /// Get the current escrow contract address
    pub fn get_escrow_contract(env: Env) -> Option<Address> {
        env.storage().instance().get(&StorageKey::EscrowContract)
    }
}