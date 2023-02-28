use solana_program::{entrypoint::ProgramResult,entrypoint,msg, pubkey::Pubkey, account_info::{AccountInfo, next_account_info}, program::invoke, system_instruction, rent::Rent, sysvar::Sysvar, program_error::ProgramError, instruction::{Instruction, AccountMeta}};

entrypoint!(start);

pub fn start(
    program_id:&Pubkey,
    accounts:&[AccountInfo],
    input:&[u8]
)->ProgramResult{

    let iter = &mut accounts.iter();
    let user = next_account_info(iter)?;
    let post_program_id = next_account_info(iter)?;
    
    msg!("Calle instruction cpi");
    // let (&tag,rest) = input.split_first().ok_or(ProgramError::InvalidInstructionData)?;
    msg!("Post instruction tag: {:?}",input);
    
    invoke(&Instruction::new_with_borsh(
        post_program_id.key.clone(), 
        &input.clone(), 
        vec![AccountMeta::new(user.key.clone(), false)]),
        &[user.clone()]
    )?;


    Ok(())
}