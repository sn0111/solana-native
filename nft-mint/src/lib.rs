use solana_program::{entrypoint::ProgramResult,entrypoint, pubkey::Pubkey, account_info::{AccountInfo, next_account_info}, msg, program::invoke, system_instruction, native_token::LAMPORTS_PER_SOL};
use spl_token::instruction as token_instruction;
use spl_associated_token_account::instruction as spl_associated_token_instruction;
entrypoint!(start_nft_mint);

pub fn start_nft_mint(
    program_id:&Pubkey,
    accounts:&[AccountInfo],
    input:&[u8]
)->ProgramResult{
    let iter = &mut accounts.iter();

    let mint_account = next_account_info(iter)?;
    let token_account = next_account_info(iter)?;
    let mint_authority = next_account_info(iter)?;
    let system_program = next_account_info(iter)?;
    let token_program = next_account_info(iter)?;
    let rent = next_account_info(iter)?;
    let associated_account = next_account_info(iter)?;

    msg!("Creating mint account.");
    msg!("Mint key {:?}",mint_account.key);

    invoke(
        &system_instruction::create_account(
            &mint_authority.key, &mint_account.key, LAMPORTS_PER_SOL, 82, &token_program.key),
            &[mint_account.clone(),mint_authority.clone(),token_program.clone()])?;

    msg!("Intialize created mint account");

    invoke(&token_instruction::initialize_mint(
        &token_program.key,
        &mint_account.key,
        &mint_authority.key, 
        Some(&mint_authority.key),
        0)?, 
        &[mint_account.clone(),mint_authority.clone(),token_program.clone(),rent.clone()])?;

    msg!("Creating token account.");
    msg!("Token Account {}",token_account.key);

    invoke(
        &spl_associated_token_instruction::create_associated_token_account(
            &mint_authority.key, 
            &mint_authority.key,
            &mint_account.key, 
            &token_program.key), 
            &[mint_account.clone(),token_account.clone(),mint_authority.clone(),
            token_program.clone(),associated_account.clone()])?;
    
    msg!("Minting token to token account...");
    msg!("Mint: {}", mint_account.key);   
    msg!("Token Address: {}", token_account.key);

    invoke(
        &token_instruction::mint_to(
        &token_program.key, 
        &mint_account.key, 
        &token_account.key, 
        &mint_authority.key, 
        &[&mint_authority.key], 1)?,
        &[mint_account.clone(),token_account.clone(),mint_authority.clone(),token_program.clone(),rent.clone()]
    )?;

    
    Ok(())
    
}