#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, String};

#[contracttype]
pub enum DataKey {
    Admin,
    TotalSupply,
    Owner(u32),
    Metadata(u32),
    Approved(u32),
    OperatorApproval(Address, Address),
}

#[contracttype]
#[derive(Clone)]
pub struct LandMetadata {
    pub x: i32,
    pub y: i32,
    pub size: u32,
    pub uri: String,
}

#[contract]
pub struct LandNft;

#[contractimpl]
impl LandNft {
    pub fn initialize(env: Env, admin: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("already initialized");
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::TotalSupply, &0u32);
    }

    pub fn mint(env: Env, to: Address, x: i32, y: i32, size: u32, uri: String) -> u32 {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();

        let token_id: u32 = env.storage().instance().get(&DataKey::TotalSupply).unwrap();
        let metadata = LandMetadata { x, y, size, uri };

        env.storage().persistent().set(&DataKey::Owner(token_id), &to);
        env.storage().persistent().set(&DataKey::Metadata(token_id), &metadata);

        let new_supply = token_id + 1;
        env.storage().instance().set(&DataKey::TotalSupply, &new_supply);
        token_id
    }

    pub fn transfer(env: Env, from: Address, to: Address, token_id: u32) {
        from.require_auth();
        let owner: Address = env.storage().persistent().get(&DataKey::Owner(token_id))
            .expect("token does not exist");
        if owner != from {
            // check approval
            let approved: Option<Address> = env.storage().persistent().get(&DataKey::Approved(token_id));
            if approved.as_ref() != Some(&from) {
                panic!("not authorized");
            }
        }
        env.storage().persistent().set(&DataKey::Owner(token_id), &to);
        env.storage().persistent().remove(&DataKey::Approved(token_id));
    }

    pub fn approve(env: Env, approved: Address, token_id: u32) {
        let owner: Address = env.storage().persistent().get(&DataKey::Owner(token_id))
            .expect("token does not exist");
        owner.require_auth();
        env.storage().persistent().set(&DataKey::Approved(token_id), &approved);
    }

    pub fn owner_of(env: Env, token_id: u32) -> Address {
        env.storage().persistent().get(&DataKey::Owner(token_id))
            .expect("token does not exist")
    }

    pub fn token_uri(env: Env, token_id: u32) -> String {
        let meta: LandMetadata = env.storage().persistent().get(&DataKey::Metadata(token_id))
            .expect("token does not exist");
        meta.uri
    }

    pub fn total_supply(env: Env) -> u32 {
        env.storage().instance().get(&DataKey::TotalSupply).unwrap_or(0)
    }
}
