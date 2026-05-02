#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Env};

#[contracttype]
#[derive(Clone)]
pub struct Listing {
    pub seller: Address,
    pub nft_contract: Address,
    pub token_id: u32,
    pub price: i128,
    pub active: bool,
}

#[contracttype]
pub enum DataKey {
    Admin,
    SvrsToken,
    NextListingId,
    Listing(u32),
}

#[contract]
pub struct Marketplace;

fn get_next_id(env: &Env) -> u32 {
    env.storage().instance().get(&DataKey::NextListingId).unwrap_or(0)
}

#[contractimpl]
impl Marketplace {
    pub fn initialize(env: Env, admin: Address, svrs_token: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("already initialized");
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::SvrsToken, &svrs_token);
        env.storage().instance().set(&DataKey::NextListingId, &0u32);
    }

    pub fn list_asset(env: Env, seller: Address, nft_contract: Address, token_id: u32, price: i128) -> u32 {
        seller.require_auth();
        assert!(price > 0, "price must be positive");

        // Verify seller owns the token
        let owner: Address = env.invoke_contract(
            &nft_contract,
            &symbol_short!("owner_of"),
            soroban_sdk::vec![&env, token_id.into()],
        );
        assert!(owner == seller, "seller does not own token");

        let listing_id = get_next_id(&env);
        let listing = Listing { seller, nft_contract, token_id, price, active: true };
        env.storage().persistent().set(&DataKey::Listing(listing_id), &listing);
        env.storage().instance().set(&DataKey::NextListingId, &(listing_id + 1));

        env.events().publish((symbol_short!("listed"), listing_id), price);
        listing_id
    }

    pub fn buy_asset(env: Env, buyer: Address, listing_id: u32) {
        buyer.require_auth();

        let mut listing: Listing = env.storage().persistent()
            .get(&DataKey::Listing(listing_id))
            .expect("listing not found");
        assert!(listing.active, "listing not active");

        let svrs_token: Address = env.storage().instance().get(&DataKey::SvrsToken).unwrap();

        // Transfer SVRS from buyer to seller
        env.invoke_contract::<()>(
            &svrs_token,
            &symbol_short!("transfer"),
            soroban_sdk::vec![&env, buyer.clone().into(), listing.seller.clone().into(), listing.price.into()],
        );

        // Transfer NFT from seller to buyer
        env.invoke_contract::<()>(
            &listing.nft_contract,
            &symbol_short!("transfer"),
            soroban_sdk::vec![&env, listing.seller.clone().into(), buyer.clone().into(), listing.token_id.into()],
        );

        listing.active = false;
        env.storage().persistent().set(&DataKey::Listing(listing_id), &listing);

        env.events().publish((symbol_short!("sold"), listing_id), buyer);
    }

    pub fn cancel_listing(env: Env, seller: Address, listing_id: u32) {
        seller.require_auth();

        let mut listing: Listing = env.storage().persistent()
            .get(&DataKey::Listing(listing_id))
            .expect("listing not found");
        assert!(listing.active, "listing not active");
        assert!(listing.seller == seller, "not the seller");

        listing.active = false;
        env.storage().persistent().set(&DataKey::Listing(listing_id), &listing);

        env.events().publish((symbol_short!("cancel"), listing_id), seller);
    }

    pub fn get_listing(env: Env, listing_id: u32) -> Listing {
        env.storage().persistent()
            .get(&DataKey::Listing(listing_id))
            .expect("listing not found")
    }
}
