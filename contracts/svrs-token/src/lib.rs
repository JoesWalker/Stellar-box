#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Env, String};

#[contracttype]
pub enum DataKey {
    Admin,
    Name,
    Symbol,
    Decimals,
    Balance(Address),
    Allowance(Address, Address),
    AllowanceExpiry(Address, Address),
}

#[contract]
pub struct SvrsToken;

fn get_balance(env: &Env, addr: &Address) -> i128 {
    env.storage().persistent().get(&DataKey::Balance(addr.clone())).unwrap_or(0)
}

fn set_balance(env: &Env, addr: &Address, amount: i128) {
    env.storage().persistent().set(&DataKey::Balance(addr.clone()), &amount);
}

#[contractimpl]
impl SvrsToken {
    pub fn initialize(env: Env, admin: Address, name: String, symbol: String, decimals: u32) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("already initialized");
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::Name, &name);
        env.storage().instance().set(&DataKey::Symbol, &symbol);
        env.storage().instance().set(&DataKey::Decimals, &decimals);
    }

    pub fn mint(env: Env, to: Address, amount: i128) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();
        assert!(amount > 0, "amount must be positive");
        let bal = get_balance(&env, &to);
        set_balance(&env, &to, bal + amount);
        env.events().publish((symbol_short!("mint"), to), amount);
    }

    pub fn burn(env: Env, from: Address, amount: i128) {
        from.require_auth();
        assert!(amount > 0, "amount must be positive");
        let bal = get_balance(&env, &from);
        assert!(bal >= amount, "insufficient balance");
        set_balance(&env, &from, bal - amount);
        env.events().publish((symbol_short!("burn"), from), amount);
    }

    pub fn transfer(env: Env, from: Address, to: Address, amount: i128) {
        from.require_auth();
        assert!(amount > 0, "amount must be positive");
        let from_bal = get_balance(&env, &from);
        assert!(from_bal >= amount, "insufficient balance");
        set_balance(&env, &from, from_bal - amount);
        let to_bal = get_balance(&env, &to);
        set_balance(&env, &to, to_bal + amount);
        env.events().publish((symbol_short!("transfer"), from, to), amount);
    }

    pub fn approve(env: Env, from: Address, spender: Address, amount: i128, expiration_ledger: u32) {
        from.require_auth();
        env.storage().persistent().set(&DataKey::Allowance(from.clone(), spender.clone()), &amount);
        env.storage().persistent().set(&DataKey::AllowanceExpiry(from.clone(), spender.clone()), &expiration_ledger);
        env.events().publish((symbol_short!("approve"), from, spender), (amount, expiration_ledger));
    }

    pub fn transfer_from(env: Env, spender: Address, from: Address, to: Address, amount: i128) {
        spender.require_auth();
        let expiry: u32 = env.storage().persistent()
            .get(&DataKey::AllowanceExpiry(from.clone(), spender.clone()))
            .unwrap_or(0);
        assert!(env.ledger().sequence() <= expiry, "allowance expired");
        let allowance: i128 = env.storage().persistent()
            .get(&DataKey::Allowance(from.clone(), spender.clone()))
            .unwrap_or(0);
        assert!(allowance >= amount, "insufficient allowance");
        env.storage().persistent().set(&DataKey::Allowance(from.clone(), spender.clone()), &(allowance - amount));

        let from_bal = get_balance(&env, &from);
        assert!(from_bal >= amount, "insufficient balance");
        set_balance(&env, &from, from_bal - amount);
        let to_bal = get_balance(&env, &to);
        set_balance(&env, &to, to_bal + amount);
        env.events().publish((symbol_short!("transfer"), from, to), amount);
    }

    pub fn balance(env: Env, id: Address) -> i128 {
        get_balance(&env, &id)
    }

    pub fn allowance(env: Env, from: Address, spender: Address) -> i128 {
        let expiry: u32 = env.storage().persistent()
            .get(&DataKey::AllowanceExpiry(from.clone(), spender.clone()))
            .unwrap_or(0);
        if env.ledger().sequence() > expiry {
            return 0;
        }
        env.storage().persistent()
            .get(&DataKey::Allowance(from, spender))
            .unwrap_or(0)
    }

    pub fn name(env: Env) -> String {
        env.storage().instance().get(&DataKey::Name).unwrap()
    }

    pub fn symbol(env: Env) -> String {
        env.storage().instance().get(&DataKey::Symbol).unwrap()
    }

    pub fn decimals(env: Env) -> u32 {
        env.storage().instance().get(&DataKey::Decimals).unwrap()
    }
}
