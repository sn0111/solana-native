use borsh::BorshSerialize;
use solana_program::{account_info::{AccountInfo, next_account_info}, pubkey::Pubkey, entrypoint::ProgramResult,msg, program::{invoke, invoke_signed}, instruction, system_instruction::{SystemInstruction, self}, rent::Rent, sysvar::Sysvar, lamports, program_error::ProgramError};

use crate::state::UserInfo;

pub fn create_user(
    programId:&Pubkey,
    accounts:&[AccountInfo],
    userInfo:&UserInfo
)->ProgramResult{
    msg!("User acount without seeds");
    let iter_accounts = &mut accounts.iter();
    let payer = next_account_info(iter_accounts)?;
    let user = next_account_info(iter_accounts)?;
    let system_account = next_account_info(iter_accounts)?;

    let space = userInfo.try_to_vec()?.len();
    let lamports = Rent::get()?.minimum_balance(space);

    let instruction = &system_instruction::create_account(payer.key, user.key,lamports , space as u64, programId);
    let account_infos = &[payer.clone(),user.clone(),system_account.clone()];
    invoke(instruction, account_infos)?;
    msg!("{:?}",userInfo);
    userInfo.serialize(&mut &mut user.data.borrow_mut()[..])?;
    Ok(())
}

pub fn create_user_with_seeds(
    program_id:&Pubkey,
    accounts:&[AccountInfo],
    user_info:&UserInfo
)->ProgramResult{
    msg!("User acount with seeds");
    let iter_accounts = &mut accounts.iter();
    let payer = next_account_info(iter_accounts)?;
    let user = next_account_info(iter_accounts)?;
    let system_account = next_account_info(iter_accounts)?;

    let (user_address,bump) =Pubkey::find_program_address(&[b"user-info",&payer.key.to_bytes()], program_id);

    if user_address != *user.key{
        return Err(ProgramError::InvalidAccountData);
    }

    let space = user_info.try_to_vec()?.len();
    let lamports = Rent::get()?.minimum_balance(space);

    let instruction = &system_instruction::create_account(payer.key, user.key,lamports , space as u64, program_id);
    let account_infos = &[payer.clone(),user.clone(),system_account.clone()];
    
    invoke_signed(
        instruction, 
        account_infos,
        &[&[b"user-info",payer.key.as_ref(),&[bump]]]
    )?;
    msg!("{:?}",user_info);
    user_info.serialize(&mut &mut user.data.borrow_mut()[..])?;
    Ok(())
}