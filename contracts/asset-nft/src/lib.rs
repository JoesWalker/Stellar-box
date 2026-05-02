#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, String};

#[contracttype]
pub enum DataKey {
    Admin,
    TotalSupply,
    Owner(u32),
    Metadata(u32),
    Approved(u32),
}

#[contracttype]
#[derive(Clone)]
pub struct AssetMetadata {
    pub name: String,
    pub asset_type: String,
    pub uri: String,
    pub creator: Address,
}

#[contract]
pub struct AssetNft;

#[contractimpl]
impl AssetNft {
    pub fn initialize(env: Env, admin: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("already initialized");
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::TotalSupply, &0u32);
    }

    pub fn mint(env: Env, to: Address, name: String, asset_type: String, uri: String) -> u32 {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();

        let token_id: u32 = env.storage().instance().get(&DataKey::TotalSupply).unwrap();
        let metadata = AssetMetadata { name, asset_type, uri, creator: to.clone() };

        env.storage().persistent().set(&DataKey::Owner(token_id), &to);
        env.storage().persistent().set(&DataKey::Metadata(token_id), &metadata);

        env.storage().instance().set(&DataKey::TotalSupply, &(token_id + 1));
        token_id
    }

    pub fn transfer(env: Env, from: Address, to: Address, token_id: u32) {
        from.require_auth();
        let owner: Address = env.storage().persistent().get(&DataKey::Owner(token_id))
            .expect("token does not exist");
        if owner != from {
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
        let meta: AssetMetadata = env.storage().persistent().get(&DataKey::Metadata(token_id))
            .expect("token does not exist");
        meta.uri
    }

    pub fn total_supply(env: Env) -> u32 {
        env.storage().instance().get(&DataKey::TotalSupply).unwrap_or(0)
    }
}
