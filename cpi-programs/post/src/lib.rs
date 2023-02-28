use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{entrypoint::ProgramResult,entrypoint, pubkey::Pubkey,msg, account_info::{AccountInfo, next_account_info}, program::invoke, system_instruction, rent::Rent, sysvar::Sysvar, program_error::ProgramError};

entrypoint!(start);

pub fn start(
    program_id:&Pubkey,
    accounts:&[AccountInfo],
    input:&[u8]
)->ProgramResult{

    let (&tag,rest) = input.split_first().ok_or(ProgramError::InvalidInstructionData)?;
    msg!("Post instruction tag: {}",tag);
    match &tag {
        0=>return create_post(program_id,accounts,rest),
        1=>return update_post(program_id,accounts,rest),
        _=>{}
    }


    Ok(())
}

pub fn create_post(
    program_id:&Pubkey,
    accounts:&[AccountInfo],
    input:&[u8]
)->ProgramResult{
    let iter = &mut accounts.iter();
    let payer = next_account_info(iter)?;
    let user = next_account_info(iter)?;
    let system_program = next_account_info(iter)?;
    let post = Post::try_from_slice(input)?;
    let account_space = 1000;
    let lamports = Rent::get()?.minimum_balance(account_space);

    invoke(
        &system_instruction::create_account(
            &payer.key, 
            &user.key, 
            lamports, 
            1000, program_id), 
            &[payer.clone(),user.clone(),system_program.clone()])?;
    post.serialize(&mut &mut user.data.borrow_mut()[..])?;
    Ok(())
}

pub fn update_post(
    program_id:&Pubkey,
    accounts:&[AccountInfo],
    input:&[u8]
)->ProgramResult{
    let iter = &mut accounts.iter();
    let user = next_account_info(iter)?;
    let post = Post::try_from_slice(input)?;
    post.serialize(&mut &mut user.data.borrow_mut()[..])?;
    Ok(())
}

#[derive(Debug,BorshDeserialize,BorshSerialize)]
pub struct Post{
    pub title:String,
    pub body:String
}